define([
  "dojo/_base/declare",
  "JBrowse/View/Track/Wiggle/XYPlot",
  "vcfview/Store/SeqFeature/Segmentation",
], function (declare, XYPlot, Segmentation) {
  return declare(XYPlot, {
    constructor(args) {
      console.log("testing web integration", args);
      this.store = new Segmentation(
        Object.assign(args, {
          store: this.store,
          config: this.config,
          browser: this.browser,
        }),
      );
    },
  });
});
