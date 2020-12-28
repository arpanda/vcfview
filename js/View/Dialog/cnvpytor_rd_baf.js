let i = 0;

define([
  "dojo/_base/declare",
  "dojo/dom-construct",
  "dojo/aspect",
  "dijit/Dialog",
  "dijit/form/Button",
  "dijit/form/TextBox",
  "dijit/focus",
  "JBrowse/Model/FileBlob",
], function (
  declare,
  dom,
  aspect,
  Dialog,
  Button,
  TextBox,
  dijitFocus,
  FileBlob,
) {
  return declare(null, {
    constructor: function (args) {
      this.browser = args.browser;
      this.config = dojo.clone(args.config || {});
      this.title = args.title;
      this.prompt = args.prompt;
      this.goCallback = args.goCallback;
      this.showCallback = args.showCallback;
    },

    show: function () {
      var dialog = (this.dialog = new Dialog({
        title: this.title,
        className: "locationChoiceDialog",
        style: { width: "50%" },
      }));
      var container = dom.create("div", {});

      var subcontainer = dojo.create(
        "div",
        { style: { padding: "20px" } },
        container,
      );
      dojo.create(
        "p",
        { innerHTML: "Index for the sample in the VCF (if multi-sample VCF)" },
        subcontainer,
      );
      var sampleIndex = new TextBox({ value: 0 }).placeAt(subcontainer);

      dojo.create(
        "p",
        { innerHTML: "Option 1: URL for a VCF.gz file (tabixed VCF)" },
        subcontainer,
      );

      var searchBox = new TextBox().placeAt(subcontainer);

      dojo.create(
        "p",
        {
          innerHTML:
            "Option 2: Open VCF.gz and VCF.gz.tbi file from local computer",
        },
        subcontainer,
      );
      var fileBox = dojo.create(
        "input",
        { type: "file", multiple: "multiple" },
        subcontainer,
      );

      this.sampleIndex = sampleIndex;
      this.searchBox = searchBox;
      this.fileBox = fileBox;

      this.actionBar = dojo.create("div", {
        className: "infoDialogActionBar dijitDialogPaneActionBar",
      });

      const urlTemplates = [
        { name: "HepG2", color: "grey" },
        { name: "HepG2_GC", color: "black" },
        { name: "HepG2_meanshift", color: "red" },
        { name: "HepG2_call", color: "green" },
      ];
      new Button({
        label: "Submit",
        onClick: () => {
          const conf = this.browser.resolveUrl(
            this.browser.config.dataRoot + "/" + "hg19.100000.gc",
          );

          // if they passed a URL, use the search box
          if (this.searchBox.value) {
            var storeConf = {
              browser: this.browser,
              refSeq: this.browser.refSeq,
              sample: +this.sampleIndex.value || 0,
              type: "vcfview/Store/SeqFeature/segmentation_complete",
              gcContent: conf,
              chunkSizeLimit: 100000000,
              urlTemplate: this.searchBox.value,
              urlTemplates,
            };
          }

          // else if they use the local file, use the fileBox
          else if (this.fileBox.files.length) {
            console.log(this.fileBox.files);
            let tbi = 0;
            let vcf = 0;
            for (let i = 0; i < this.fileBox.files.length; i++) {
              const file = this.fileBox.files[i];
              console.log({ file });
              if (file.name.endsWith("tbi")) {
                tbi = i;
              }
              if (file.name.endsWith("gz")) {
                vcf = i;
              }
            }
            var storeConf = {
              browser: this.browser,
              refSeq: this.browser.refSeq,
              sample: +this.sampleIndex.value || 0,
              type: "vcfview/Store/SeqFeature/segmentation_complete",
              gcContent: conf,
              chunkSizeLimit: 100000000,
              file: new FileBlob(this.fileBox.files[vcf]),
              tbi: new FileBlob(this.fileBox.files[tbi]),
              urlTemplates,
            };
          } else {
            alert("No file opened");
            return;
          }
          var storeName = this.browser.addStoreConfig(undefined, storeConf);
          storeConf.name = storeName;
          var searchTrackConfig = {
            type: "MultiBigWig/View/Track/MultiWiggle/MultiXYPlot",
            label: "search_track_" + i++,
            key: "Testing",
            store: storeName,
            urlTemplates,
          };

          // send out a message about how the user wants to create the new track
          this.browser.publish("/jbrowse/v1/v/tracks/new", [searchTrackConfig]);

          // Open the track immediately
          this.browser.publish("/jbrowse/v1/v/tracks/show", [
            searchTrackConfig,
          ]);
          dialog.hide();
        },
      }).placeAt(this.actionBar);

      new Button({
        iconClass: "dijitIconDelete",
        label: "Cancel",
        onClick: dojo.hitch(dialog, "hide"),
      }).placeAt(this.actionBar);

      dialog.set("content", [container, this.actionBar]);
      dialog.show();

      aspect.after(
        dialog,
        "hide",
        dojo.hitch(this, function () {
          if (dijitFocus.curNode) {
            dijitFocus.curNode.blur();
          }
          setTimeout(function () {
            dialog.destroyRecursive();
          }, 500);
        }),
      );
    },

    show_baf: function () {
      var dialog = (this.dialog = new Dialog({
        title: this.title,
        className: "locationChoiceDialog",
        style: { width: "50%" },
      }));
      var container = dom.create("div", {});

      var subcontainer = dojo.create(
        "div",
        { style: { padding: "20px" } },
        container,
      );
      dojo.create(
        "p",
        { innerHTML: "Index for the sample in the VCF (if multi-sample VCF)" },
        subcontainer,
      );
      var sampleIndex = new TextBox({ value: 0 }).placeAt(subcontainer);

      dojo.create(
        "p",
        { innerHTML: "Option 1: URL for a VCF.gz file (tabixed VCF)" },
        subcontainer,
      );

      var searchBox = new TextBox().placeAt(subcontainer);

      dojo.create(
        "p",
        {
          innerHTML:
            "Option 2: Open VCF.gz and VCF.gz.tbi file from local computer",
        },
        subcontainer,
      );
      var fileBox = dojo.create(
        "input",
        { type: "file", multiple: "multiple" },
        subcontainer,
      );

      this.sampleIndex = sampleIndex;
      this.searchBox = searchBox;
      this.fileBox = fileBox;

      this.actionBar = dojo.create("div", {
        className: "infoDialogActionBar dijitDialogPaneActionBar",
      });

      const urlTemplates = [
        { "name": "HepG2", "color": "red", "nonCont": true },
        { "name": "HepG2_BAF", "color": "blue", "nonCont": true},
        { "name": "HepG2_MIN", "color": "red", "nonCont": true}
      ];
      new Button({
        label: "Submit",
        onClick: () => {
          const conf = this.browser.resolveUrl(
            this.browser.config.dataRoot + "/" + "hg19.100000.gc",
          );

          // if they passed a URL, use the search box
          if (this.searchBox.value) {
            var storeConf = {
              browser: this.browser,
              refSeq: this.browser.refSeq,
              sample: +this.sampleIndex.value || 0,
              type: "vcfview/Store/SeqFeature/BAFview",
              gcContent: conf,
              chunkSizeLimit: 100000000,
              urlTemplate: this.searchBox.value,
              urlTemplates,
            };
          }

          // else if they use the local file, use the fileBox
          else if (this.fileBox.files.length) {
            console.log(this.fileBox.files);
            let tbi = 0;
            let vcf = 0;
            for (let i = 0; i < this.fileBox.files.length; i++) {
              const file = this.fileBox.files[i];
              console.log({ file });
              if (file.name.endsWith("tbi")) {
                tbi = i;
              }
              if (file.name.endsWith("gz")) {
                vcf = i;
              }
            }
            var storeConf = {
              browser: this.browser,
              refSeq: this.browser.refSeq,
              sample: +this.sampleIndex.value || 0,
              type: "vcfview/Store/SeqFeature/BAFview",
              gcContent: conf,
              chunkSizeLimit: 100000000,
              file: new FileBlob(this.fileBox.files[vcf]),
              tbi: new FileBlob(this.fileBox.files[tbi]),
              urlTemplates,
            };
          } else {
            alert("No file opened");
            return;
          }
          var storeName = this.browser.addStoreConfig(undefined, storeConf);
          storeConf.name = storeName;
          var searchTrackConfig = {
            type: "MultiBigWig/View/Track/MultiWiggle/MultiXYPlot",
            label: "search_track_" + i++,
            key: "Testing",
            store: storeName,
            urlTemplates,
          };

          // send out a message about how the user wants to create the new track
          this.browser.publish("/jbrowse/v1/v/tracks/new", [searchTrackConfig]);

          // Open the track immediately
          this.browser.publish("/jbrowse/v1/v/tracks/show", [
            searchTrackConfig,
          ]);
          dialog.hide();
        },
      }).placeAt(this.actionBar);

      new Button({
        iconClass: "dijitIconDelete",
        label: "Cancel",
        onClick: dojo.hitch(dialog, "hide"),
      }).placeAt(this.actionBar);

      dialog.set("content", [container, this.actionBar]);
      dialog.show();

      aspect.after(
        dialog,
        "hide",
        dojo.hitch(this, function () {
          if (dijitFocus.curNode) {
            dijitFocus.curNode.blur();
          }
          setTimeout(function () {
            dialog.destroyRecursive();
          }, 500);
        }),
      );
    },

  });
});
