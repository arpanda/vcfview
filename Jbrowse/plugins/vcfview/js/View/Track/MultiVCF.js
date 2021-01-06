define([
  "dojo/_base/declare",
  "MultiBigWig/View/Track/MultiWiggle/MultiXYPlot",
  "vcfview/View/Dialog/SampleSelectVCF",
], function (declare, XYPlot, Dialog) {
  return declare(XYPlot, {
    makeTrackLabel() {
      this.inherited(arguments);

      this.store.getParser().then(header => {
        this.samples = header.samples;
      });
    },

    _trackMenuOptions() {
      var options = this.inherited(arguments);
      options.push({
        label: "Sample options",

        onClick: () => {
          new Dialog({
            setCallback: (sample, GenotypeField) => {
              this.config.sample = sample;
              this.config.GenotypeField = GenotypeField;
              // if (GenotypeField == "AD") {
              //   this.config.max_score = 1;
              // } else {
              //   this.config.max_score = undefined;
              //     console.log(this.config)
              // }

              const clone = dojo.clone(this.config);
              clone.type = this.config.storeClass;
              clone.sample = sample;
              clone.GenotypeField = GenotypeField;
              this.browser.releaseStore(this.config.store);
              this.config.store = this.browser.addStoreConfig(null, clone);
              console.log(this.config);
              this.browser.publish("/jbrowse/v1/c/tracks/replace", [
                this.config,
              ]);
            },
            samples: this.samples,
            SelectedSample: this.config.sample || 0,
            SelectedGenotype: this.config.GenotypeField || "DP",
          }).show();
        },
      });
      return options;
    },
  });
});
