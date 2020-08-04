const { TabixIndexedFile } = cjsRequire('@gmod/tabix');
const VCF = cjsRequire('@gmod/vcf');
import AbortablePromiseCache from 'abortable-promise-cache';
import LRU from 'quick-lru';
define([
  'dojo/_base/declare',
  'JBrowse/Store/SeqFeature/VCFTabix',
  'JBrowse/Model/SimpleFeature',
  'JBrowse/Model/VCFFeature',
], function (declare, VCFTabix, SimpleFeature, VCFFeature) {
  return declare(VCFTabix, {
    constructor() {
      this.featureCache = new AbortablePromiseCache({
        cache: new LRU({
          maxSize: 20,
        }),
        fill: this._readChunk.bind(this),
      });
    },
    async _readChunk(query) {
      const parser = await this.getParser();
      const regularizedReferenceName = this.browser.regularizeReferenceName(
        query.ref,
      );

      const end = this.browser.view.ref.end;
      let binSize = 100000;
      var bins = [];
      for (let i = 0; i < end; i += binSize) {
        bins.push({ score: 0, count: 0 });
      }
      console.time('vcfextra');
      await this.indexedData.getLines(
        regularizedReferenceName,
        0,
        undefined,
        (line, fileOffset) => {
          try {
            const variant = parser.parseLine(line);
            const feature = new VCFFeature({
              variant: variant,
              parser: parser,
              id: 'vcf-' + fileOffset,
            });
            const score = (feature.get('genotypes')['NA12877'].DP.values ||
              [])[0];
            const start = feature.get('start');

            const featureBin = Math.max(Math.floor(start / binSize), 0);
            bins[featureBin].score += isNaN(score) ? 0 : score;
            bins[featureBin].count++;
            bins[featureBin].start = featureBin * binSize;
            bins[featureBin].end = (featureBin + 1) * binSize;
            bins[featureBin].id = fileOffset;
          } catch (e) {
            console.error(e);
          }
        },
      );
      console.timeEnd('vcfextra');
      return bins;
    },

    async _getFeatures(
      query,
      featureCallback,
      finishedCallback,
      errorCallback,
    ) {
      try {
        const features = await this.featureCache.get(query.ref, query);
        features.forEach(feature => {
          if (feature.end > query.start && feature.start < query.end) {
            featureCallback(
              new SimpleFeature({
                data: Object.assign(Object.create(feature), {
                  score: feature.score / feature.count,
                }),
              }),
            );
          }
        });

        finishedCallback();
      } catch (e) {
        errorCallback(e);
      }
    },
  });
});
