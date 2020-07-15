define([
  "dojo/_base/declare",
  "dojo/dom-construct",
  "dojo/on",
  "dijit/focus",
  "dijit/form/NumberSpinner",
  "dijit/form/Select",
  "dijit/form/Button",
  "JBrowse/View/Dialog/WithActionBar",
], function (
  declare,
  dom,
  on,
  focus,
  NumberSpinner,
  Select,
  Button,
  ActionBarDialog
) {
  return declare(ActionBarDialog, {
    title: "Set sample name",

    constructor: function (args) {
      this.sampleList = args.samples;
      this.sample = args.sample || 0;
      this.GenotypeField = args.GenotypeField || "DP";

      this.SelectedSample = args.SelectedSample;
      this.SelectedGenotype = args.SelectedGenotype;

      this.browser = args.browser;
      this.setCallback = args.setCallback || function () {};
      this.cancelCallback = args.cancelCallback || function () {};
    },

    _fillActionBar: function (actionBar) {
      new Button({
        label: "OK",
        onClick: dojo.hitch(this, function () {
          var sample = this.SampleSelect.getValue();
          var GenotypeField = this.GenotypeFieldSelect.getValue();

          this.setCallback && this.setCallback(sample, GenotypeField);
          this.hide();
        }),
      }).placeAt(actionBar);

      new Button({
        label: "Cancel",
        onClick: dojo.hitch(this, function () {
          this.cancelCallback && this.cancelCallback();
          this.hide();
        }),
      }).placeAt(actionBar);
    },

    show: function (/* callback */) {
      var SelectedSampleChecker = function (selectedSample) {
        return function (sample, index) {
          if (index == selectedSample) {
            return { label: sample, value: index, selected: true };
          } else {
            return { label: sample, value: index };
          }
        };
      };

      var SelectedGenotypeChecker = function (selectedGenotype) {
        return function (genotype) {
          console.log(genotype);
          if (genotype == selectedGenotype) {
            console.log("selected", genotype);
            return { label: genotype, value: genotype, selected: true };
          } else {
            return { label: genotype, value: genotype };
          }
        };
      };

      this.SampleSelect = new Select({
        name: "sample_select",
        // options: this.sampleList.map((sample, index) => ({ label: sample, value: index })) ,
        options: this.sampleList.map(
          SelectedSampleChecker(this.SelectedSample)
        ),
      });

      this.GenotypeFieldSelect = new Select({
        name: "genotype_field",
        options: ["DP", "AD"].map(
          SelectedGenotypeChecker(this.SelectedGenotype)
        ),
      });

      this.set("content", [
        dom.create("p", { innerHTML: "Set Sample name" }),
        dom.create("label", {
          for: "sample_select",
          innerHTML: "Sample",
          style: { display: "inline-block", width: "100px" },
        }),
        this.SampleSelect.domNode,
        dom.create("br"),

        dom.create("label", {
          for: "genotype_field",
          innerHTML: "Genotype Field",
          style: { display: "inline-block", width: "100px" },
        }),
        this.GenotypeFieldSelect.domNode,
        dom.create("br"),
      ]);

      this.inherited(arguments);
    },

    hide: function () {
      this.inherited(arguments);
      window.setTimeout(dojo.hitch(this, "destroyRecursive"), 500);
    },
  });
});
