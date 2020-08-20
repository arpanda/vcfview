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
      this.sample = args.sample || 0;
      this.featureCache = new AbortablePromiseCache({
        cache: new LRU({
          maxSize: 20,
        }),
        fill: this._readChunk.bind(this),
      });
    },

    async parseGC() {
      const result = await fetch(this.resolveUrl(this.config.gcContent));
      if (!result.ok) {
        throw new Error("no gc content specified");
      }
      const text = await result.text();
      const refs = {};
      text.split("\n").forEach((row) => {
        if (row.trim() !== "") {
          const [refName, start, gcContent, gcCount, atCount] = row.split("\t");
          if (!refs[refName]) {
            refs[refName] = [];
          }
          refs[refName].push({
            start: +start,
            gcContent: +gcContent,
            gcCount: +gcCount,
            atCount: +atCount,
          });
        }
      });
      console.log({ refs });
      return refs;
    },
    async _readChunk(query) {
      const parser = await this.getParser();
      const samples = parser.samples;
      const gc = await this.parseGC();

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

      await this.indexedData.getLines(
        regularizedReferenceName,
        0,
        undefined,
        (line, fileOffset) => {
          const fields = line.split("\t");
          const start = +fields[1];
          const format = fields[8].split(":");
          const DP = format.indexOf("DP");
          const featureBin = Math.max(Math.floor(start / binSize), 0);
          bins[featureBin].start = featureBin * binSize;
          bins[featureBin].end = (featureBin + 1) * binSize;
          bins[featureBin].id = fileOffset;
          for (let i = 0; i < samples.length; i++) {
            const sampleName = samples[i];
            const score = +fields[9 + i].split(":")[DP];
            bins[featureBin].samples[i].score += isNaN(score) ? 0 : score;
            bins[featureBin].samples[i].count++;
            bins[featureBin].samples[i].source = sampleName;
          }
        }
      );
      let averages = new Array(samples.length);
      averages.fill(0);
      bins.forEach((bin) => {
        bin.samples.forEach((sample, index) => {
          sample.score = sample.score / (sample.count || 1);
          averages[index] += sample.score;
        });
      });
      console.log({ bins });

      return {
        averages: averages.map((average) => average / bins.length),
        bins,
      };
    },

    async _getFeatures(
      query,
      featureCallback,
      finishedCallback,
      errorCallback
    ) {
      try {
        const { bins, averages } = await this.featureCache.get(
          query.ref,
          query
        );

        bins.forEach((feature) => {
          if (feature.end > query.start && feature.start < query.end) {
            const sample = feature.samples[this.sample];
            featureCallback(
              new SimpleFeature({
                data: Object.assign(Object.create(feature), {
                  score: sample.score,
                  source: sample.source,
                }),
              })
            );
          }
        });

        featureCallback(
          new SimpleFeature({
            data: {
              start: 0,
              end: this.browser.view.ref.end,
              score: averages[this.sample],
              uniqueId: "average_" + this.sample,
              source: "average",
            },
          })
        );

        finishedCallback();
      } catch (e) {
        errorCallback(e);
      }
    },
  });
});
