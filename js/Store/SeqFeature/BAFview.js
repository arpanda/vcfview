import AbortablePromiseCache from "abortable-promise-cache";
import LRU from "quick-lru";
import { unzip } from "@gmod/bgzf-filehandle";

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
      (data.length - 1),
  );
}

function beta(a, b, p, phased = true) {
  return p ** a * (1 - p) ** b + p ** b * (1 - p) ** a;
}

function linspace(a, b, n) {
  if (typeof n === "undefined") n = Math.max(Math.round(b - a) + 1, 1);
  if (n < 2) {
    return n === 1 ? [a] : [];
  }
  var i,
    ret = Array(n);
  n--;
  for (i = n; i >= 0; i--) {
    ret[i] = (i * b + (n - i) * a) / n;
  }
  return ret;
}

define([
  "dojo/_base/declare",
  "JBrowse/Store/SeqFeature/VCFTabix",
  "JBrowse/Model/SimpleFeature",
], function (declare, VCFTabix, SimpleFeature) {
  return declare(VCFTabix, {
    constructor(args) {
      this.sample = args.sample || 0;
      this.binSize = args.binSize || 100000;
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
        query.ref,
      );

      // let binSize = 100000;
      let binSize = this.binSize;
      var bins = [];

      const refName = query.ref.replace("chr", "");
      await this.indexedData.getLines(
        regularizedReferenceName,
        0,
        undefined,
        (line, fileOffset) => {
          const fields = line.split("\t");
          // console.log(fields);
          const start = +fields[1];
          const format = fields[8].split(":");
          const DP = format.indexOf("DP");
          const AD = format.indexOf("AD");
          const GT = format.indexOf("GT");
          const featureBin = Math.max(Math.floor(start / binSize), 0);

          if (!bins[featureBin]) {
            bins[featureBin] = {
              score: 0,
              count: 0,
              lh_score: [],
              min_score: 0,
            };
          }

          bins[featureBin].start = featureBin * binSize;
          bins[featureBin].end = (featureBin + 1) * binSize;
          bins[featureBin].id = fileOffset;
          const sampleName = samples[this.sample];
          const score = +fields[9 + this.sample].split(":")[DP];
          const ad_score = fields[9 + this.sample]
            .split(":")
            [AD].split(",")
            .map(x => +x);
          const gt_score = fields[9 + this.sample]
            .split(":")
            [GT].split("/")
            .map(x => +x);
          const ad_a = ad_score[0];
          const ad_b = ad_score[1];

          if (
            (gt_score[0] == 0 && gt_score[1] == 1) ||
            (gt_score[0] == 1 && gt_score[1] == 0)
          ) {
            if (bins[featureBin].lh_score.length == 0) {
              bins[featureBin].lh_score = linspace(0, 1, 200).map(
                (value, index) => {
                  return beta(ad_a, ad_b, value);
                },
              );
            } else {
              var sum = 0;

              bins[featureBin].lh_score = linspace(0, 1, 200).map(
                (value, index) => {
                  var lh_value =
                    bins[featureBin].lh_score[index] * beta(ad_a, ad_b, value);
                  sum = sum + lh_value;
                  return lh_value;
                },
              );

              bins[featureBin].lh_score = linspace(0, 1, 200).map(
                (value, index) => {
                  return bins[featureBin].lh_score[index] / sum;
                },
              );
            }
          }

          const finalScore = isNaN(score) ? 0 : score;
          // bins[featureBin].baf = ad_score[1]/(ad_score[0]+ad_score[1])
          bins[featureBin].score += finalScore;
          bins[featureBin].count++;
          bins[featureBin].source = sampleName;
        },
      );

      bins.forEach(sample => {
        if (sample.lh_score.length > 0) {
          const max = Math.max(...sample.lh_score);

          const res = sample.lh_score.indexOf(max);
          // const res = [];
          //sample.lh_score.forEach((item, index) => item === max ? res.push(index): null);
          sample.score = Math.max(res / 200, 1 - res / 200);
          // sample.score = getMean(res)/200;
          sample.min_score = Math.min(res / 200, 1 - res / 200);
        } else {
          sample.score = 0;
        }
        // sample.score = sample.score / (sample.count || 1);
        const start = sample.start;
        const featureBin = Math.max(Math.floor(start / binSize), 0);
        // ample.baf = sample.baf /sample.count;
      });
      // console.log(bins);
      const results = {
        bins,
      };
      return results;
    },

    async _getFeatures(
      query,
      featureCallback,
      finishedCallback,
      errorCallback,
    ) {
      // testing part

      this.inherited(arguments, [
        query,
        feature => {
          var thisB = this;
          let genotype = feature.get("genotypes");
          let samples = Object.keys(genotype);

          let sample_position = samples.length - 1;
          let sample_name = feature.get("genotypes")[samples[sample_position]];

          let sample_score = 0;
          const field_list = ["AD"];
          field_list.forEach(val => {
            if (typeof sample_name[val] != "undefined") {
              sample_score =
                sample_name[val].values[1] /
                (sample_name[val].values[0] + sample_name[val].values[1]);
            }
          });

          //console.log(sample_score);
          //console.log(feature.get('start'), feature.get('end'))
          // console.log(samples[sample_position]);
          let sample_data = new SimpleFeature({
            id: feature.get("id"),
            data: {
              start: feature.get("start"),
              end: feature.get("end"),
              score: sample_score,
              source: "sample_BAF",
            },
          });
          featureCallback(sample_data);
        },
      ]);

      // testing part
      try {
        const { bins } = await this.featureCache.get(query.ref, query);

        bins.forEach(feature => {
          if (feature.end > query.start && feature.start < query.end) {
            const sample = feature;
            featureCallback(
              new SimpleFeature({
                data: Object.assign(Object.create(feature), {
                  score: sample.score,
                  source: "sample",
                }),
              }),
            ),
              featureCallback(
                new SimpleFeature({
                  data: Object.assign(Object.create(feature), {
                    score: sample.baf,
                    source: "sample_BAF",
                  }),
                }),
              ),
              featureCallback(
                new SimpleFeature({
                  data: Object.assign(Object.create(feature), {
                    score: sample.min_score,
                    source: "sample_MIN",
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
