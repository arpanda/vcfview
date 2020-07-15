define([
  "dojo/_base/declare",
  "JBrowse/View/Track/Wiggle/XYPlot",
  "vcfview/Store/SeqFeature/SegmentationMultiBin",
], function (declare, XYPlot, SegmentationMultiBin) {
  return declare(XYPlot, {
    constructor(args) {
      this.store = new SegmentationMultiBin(
        Object.assign(args, {
          store: this.store,
          config: this.config,
          browser: this.browser,
        })
      );
    },
  });
});
