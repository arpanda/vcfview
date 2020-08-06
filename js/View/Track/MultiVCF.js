define([
  "dojo/_base/declare",
  "MultiBigWig/View/Track/MultiWiggle/MultiXYPlot",
  "vcfview/View/Dialog/SampleSelectVCF",
], function (declare, XYPlot, Dialog) {
  return declare(XYPlot, {
    makeTrackLabel() {
      this.inherited(arguments);
      console.log(this.store);

      this.store.getParser().then((header) => {
        this.samples = header.samples;
      });
    },

    _trackMenuOptions() {
      var options = this.inherited(arguments);
      options.push({
        label: "Sample options",

        onClick: () => {
          console.log("clicked");
          new Dialog({
            setCallback: (sample, GenotypeField) => {
              console.log({ sample, GenotypeField });
              console.log(this.config, this.store);
              console.log(this.browser.stores);
              this.config.sample = sample;
              this.config.GenotypeField = GenotypeField;
              if (GenotypeField == "AD") {
                this.config.max_score = 1;
              } else {
                this.config.max_score = undefined;
              }

              const clone = dojo.clone(this.config);
              clone.type = this.config.storeClass;
              clone.sample = sample;
              clone.GenotypeField = GenotypeField;
              var storeName = this.browser.addStoreConfig(null, clone);

              // const clone = Object.create(this.config);
              // const conf = Object.assign(this.config, {
              //   store: storeName,
              // });
              this.config.store = storeName;
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
