import AbortablePromiseCache from "abortable-promise-cache";
import LRU from "quick-lru";

function getMean(data) {
  return (
    data.reduce(function (a, b) {
      return a + b;
    }) / data.length
  );
}
function getSD(data) {
  let m = getMean(data);
  return Math.sqrt(
    data.reduce(function (sq, n) {
      return sq + (n - m) * (n - m);
    }, 0) /
      (data.length - 1)
  );
}

define([
  "dojo/_base/declare",
  "JBrowse/Store/SeqFeature/VCFTabix",
  "JBrowse/Model/SimpleFeature",
], function (declare, VCFTabix, SimpleFeature) {
  return declare(VCFTabix, {
    constructor(args) {
      console.log(args);
      this.featureCache = new AbortablePromiseCache({
        cache: new LRU({
          maxSize: 20,
        }),
        fill: this._readChunk.bind(this),
      });
    },
    async _readChunk(query) {
      const parser = await this.getParser();
      const samples = parser.samples;

      const regularizedReferenceName = this.browser.regularizeReferenceName(
        query.ref
      );

      const end = this.browser.view.ref.end;
      let binSize = 100000;
      var bins = [];
      for (let i = 0; i < end; i += binSize) {
        bins.push({
          samples: samples.map(() => ({ score: 0, count: 0 })),
        });
      }

      let averages = samples.map(() => ({ scores: [] }));

      //       await this.indexedData.getLines(
      //         regularizedReferenceName,
      //         0,
      //         undefined,
      //         (line, fileOffset) => {
      //           const fields = line.split("\t");
      //           const start = +fields[1];
      //           const featureBin = Math.max(Math.floor(start / binSize), 0);
      //           bins[featureBin].start = featureBin * binSize;
      //           bins[featureBin].end = (featureBin + 1) * binSize;
      //           bins[featureBin].id = fileOffset;
      //           for (let i = 0; i < samples.length; i++) {
      //             const sampleName = samples[i];
      //             const score = +fields[9 + i].split(":")[2];
      //             averages[i].scores.push(isNaN(score) ? 0 : score);
      //             bins[featureBin].samples[i].score += isNaN(score) ? 0 : score;
      //             bins[featureBin].samples[i].count++;
      //             bins[featureBin].samples[i].source = sampleName;
      //           }
      //         }
      //       );
      //       bins.forEach((bin) => {
      //         bin.samples.forEach((sample, index) => {
      //           sample.score =
      //             (sample.score / sample.count - getMean(averages[index].scores)) /
      //             getSD(averages[index].scores);
      //         });
      //       });
      return bins;
    },

    async _getFeatures(
      query,
      featureCallback,
      finishedCallback,
      errorCallback
    ) {
      try {
        const features = await this.featureCache.get(query.ref, query);
        features.forEach((feature) => {
          if (feature.end > query.start && feature.start < query.end) {
            feature.samples.forEach((sample) => {
              featureCallback(
                new SimpleFeature({
                  data: Object.assign(Object.create(feature), {
                    score: sample.score,
                    source: sample.source,
                  }),
                })
              );
            });
          }
        });

        finishedCallback();
      } catch (e) {
        errorCallback(e);
      }
    },
  });
});
