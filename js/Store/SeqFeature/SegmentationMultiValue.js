define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "JBrowse/Store/LRUCache",
  "JBrowse/Store/SeqFeature",
  "JBrowse/Model/SimpleFeature",
  "JBrowse/Store/SeqFeature/VCFTabix",
], function (
  declare,
  lang,
  LRUCache,
  SeqFeatureStore,
  SimpleFeature,
  VCFTabix
) {
  return declare([VCFTabix, SeqFeatureStore], {
    constructor(args) {
      this.dpField = args.dpField || "DP";
      this.binSize = args.binSize || 100000;
      // this.featureCache = new LRUCache({
      //   name: "vcfFeatureCache",
      //   fillCallback: dojo.hitch(this, "_readChunk"),
      //   sizeFunction: function (features) {
      //     return features.length;
      //   },
      //   maxSize: 100000,
      // });
    },
    async getFeatures(query, featCallback, finishCallback, errorCallback) {
      var binSize = this.binSize;
      var supermethod = this.getInherited(arguments);
      const { ref, start: originalStart, end: originalEnd } = query;

      var start = originalStart - (originalStart % binSize);
      var end = originalEnd + (binSize - (originalEnd % binSize));

      var bins = [];
      for (let i = start; i < end; i += binSize) {
        bins.push({ score: 0, count: 0 });
      }

      supermethod.call(
        this,
        { ref, start, end },
        (feature) => {
          let genotype = feature.get("genotypes");
          let samples = Object.keys(genotype);

          let sample_position = samples.length - 1;
          let sample_name = feature.get("genotypes")[samples[sample_position]];

          //score += sample_name[this.dpField].values[0];

          let sample_score = 0;
          const field_list = ["DP", "mutect_DP", "strelka_DP", "lofreq_DP"];
          field_list.forEach((val) => {
            if (typeof sample_name[val] != "undefined") {
              sample_score = sample_name[val].values[0];
            }
          });
          const featureBin = Math.max(
            Math.floor((feature.get("start") - start) / binSize),
            0
          );
          bins[featureBin].score += sample_score;
          bins[featureBin].count++;
        },
        () => {
          bins.forEach((bin, i) => {
            if (bin.count) {
              featCallback(
                new SimpleFeature({
                  id: `${start + binSize * i}_feat_1`,
                  data: {
                    start: start + binSize * i,
                    end: start + binSize * (i + 1),
                    score: bin.score / bin.count,
                    source: "main",
                  },
                })
              );
              featCallback(
                new SimpleFeature({
                  id: `${start + binSize * i}_feat_2`,
                  data: {
                    start: start + binSize * i,
                    end: start + binSize * (i + 1),
                    score: bin.score / bin.count + 5,
                    source: "secondary",
                  },
                })
              );
            }
          });
          finishCallback();
        },
        errorCallback
      );
    },
  });
});
