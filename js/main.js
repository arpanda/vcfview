(function(d, script) {
    script = d.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.onload = function(){
        // remote script has loaded
    };
    script.src = 'https://cdn.jsdelivr.net/npm/jstat@latest/dist/jstat.min.js';
    d.getElementsByTagName('head')[0].appendChild(script);
}(document));


define(["dojo/_base/declare", "JBrowse/Plugin"], function (
  declare,
  JBrowsePlugin
) {
  return declare(JBrowsePlugin, {
    constructor: function (args) {
      var browser = args.browser;
      console.log("VcfView plugin starting");

      browser.registerTrackType({
        label: "SegmentationMultiBinTrack",
        type: "vcfview/View/Track/SegmentationMultiBinTrack",
      });

      browser.registerTrackType({
        label: "SegmentationTrack",
        type: "vcfview/View/Track/SegmentationTrack",
      });

      browser.registerTrackType({
        label: "SegmentationAutoTrack",
        type: "vcfview/View/Track/SegmentationAutoTrack",
      });

      browser.registerTrackType({
        label: "SegmentationAutoMultiTrack",
        type: "vcfview/View/Track/SegmentationAutoMultiTrack",
      });
    },
  });
});
