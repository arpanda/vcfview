(function (d, script) {
  script = d.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.onload = function () {
    // remote script has loaded
  };
  script.src = "https://cdn.jsdelivr.net/npm/jstat@latest/dist/jstat.min.js";
  d.getElementsByTagName("head")[0].appendChild(script);
})(document);

define([
  "dojo/_base/declare",
  "JBrowse/Plugin",
  "./View/Dialog/cnvpytor_rd_baf",
  "dijit/MenuItem",
  "dijit/registry",
  "dojo/dom-construct",
], function (
  declare,
  JBrowsePlugin,
  LocationChoiceDialog,
  MenuItem,
  registry,
  domConstruct,
) {
  return declare(JBrowsePlugin, {
    constructor: function (args) {
      var browser = args.browser;
      console.log("VcfView plugin starting");

      browser.registerTrackType({
        label: "SegmentationMultiBinTrack",
        type: "vcfview_cp/View/Track/SegmentationMultiBinTrack",
      });

      browser.registerTrackType({
        label: "SegmentationTrack",
        type: "vcfview_cp/View/Track/SegmentationTrack",
      });

      browser.registerTrackType({
        label: "SegmentationAutoTrack",
        type: "vcfview_cp/View/Track/SegmentationAutoTrack",
      });

      browser.registerTrackType({
        label: "SegmentationAutoMultiTrack",
        type: "vcfview_cp/View/Track/SegmentationAutoMultiTrack",
      });

      this.browser.addGlobalMenuItem(
        "tools",
        new MenuItem({
          id: "menubar_cnvpytor_rd",
          label: "CNVpytor Read Depth analysis",
          onClick: () => {
            new LocationChoiceDialog({
              browser: this.browser,
              title: "CNVpytor read depth analysis import",
              prompt: "CNVpytor read depth analysis import",
            }).show();
          },
        }),
      );

      this.browser.addGlobalMenuItem(
        "tools",
        new MenuItem({
          id: "menubar_cnvpytor_baf",
          label: "CNVpytor BAF analysis",
          onClick: () => {
            new LocationChoiceDialog({
              browser: this.browser,
              title: "CNVpytor BAF analysis import",
              prompt: "CNVpytor BAF analysis import",
            }).show_baf();
          },
        }),
      );

      setTimeout(() => {
        if (!registry.byId("dropdownmenu_tools")) {
          this.browser.renderGlobalMenu(
            "tools",
            { text: "Tools" },
            this.browser.menuBar,
          );
          var toolsMenu = registry.byId("dropdownbutton_tools");
          var helpMenu = registry.byId("dropdownbutton_help");
          domConstruct.place(toolsMenu.domNode, helpMenu.domNode, "before");
        }
      }, 500);
    },
  });
});
