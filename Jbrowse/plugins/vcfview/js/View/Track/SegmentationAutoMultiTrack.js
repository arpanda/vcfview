define([
  "dojo/_base/declare",
  "MultiBigWig/View/Track/MultiWiggle/MultiXYPlot",
  "vcfview/View/Dialog/SampleSelectVCF",
], function (declare, XYPlot, SampleSelectVCF) {
  return declare(XYPlot, {
    makeTrackLabel() {
      this.inherited(arguments);

      this.store.getParser().then(header => {
        this.samples = header.samples;
      });
    },

    _trackMenuOptions: function () {
      var track = this;
      var options = this.inherited(arguments);
      options.push({
        label: "Sample options",

        onClick: function () {
          console.log("clicked");
          new SampleSelectVCF({
            setCallback: function (sample, GenotypeField) {
              track.config.sample = sample;
              track.config.GenotypeField = GenotypeField;
              if (GenotypeField == "AD") {
                track.config.max_score = 1;
              } else {
                track.config.max_score = undefined;
              }

              track.browser.publish("/jbrowse/v1/c/tracks/replace", [
                track.config,
              ]);
            },
            samples: track.samples,
            SelectedSample: track.config.sample || 0,
            SelectedGenotype: track.config.GenotypeField || "DP",
          }).show();
        },
      });
      return options;
    },
  });
});
