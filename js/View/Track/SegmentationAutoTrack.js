
define([
    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'JBrowse/View/Track/Wiggle/XYPlot',
    'vcfview/Store/SeqFeature/SegmentationMultiBin',
    'vcfview/View/Dialog/SampleSelectVCF',
    'JBrowse/Util'
    ],
    function(declare, array ,lang, XYPlot, SegmentationMultiBin, SampleSelectVCF, Util) {
        return declare(XYPlot, {
            constructor(args) {
                this.store = new SegmentationMultiBin(
                Object.assign(args, {
                    store: this.store,
                    config: this.config,
                    browser: this.browser,
                    sample: this.sample,
                }));
            },
            /*
            _defaultConfig1: function () {
                return Util.deepUpdate(lang.clone(this.inherited(arguments)), {
                    sample: 'tumor',
                });
            },*/
            _trackMenuOptions: function () {
                var track = this;
                var options = this.inherited(arguments);
                options.push({
                    label: 'Sample options',

                    onClick: function () {
                        this.store.getSampleName();

                        new SampleSelectVCF({
                            setCallback: function(sample){
                                track.config.sample = sample
                                track.browser.publish('/jbrowse/v1/c/tracks/replace', [track.config]);
                            },
                        }).show();

                    }
                });
                return options;
            },


        })
});
