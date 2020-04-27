define([
    'dojo/_base/declare',
    'JBrowse/Plugin'
],
function (
    declare,
    JBrowsePlugin
) {
    return declare(JBrowsePlugin, {
        constructor: function (args) {
            var browser = args.browser;
            console.log('VcfView plugin starting');

            browser.registerTrackType({
                label: 'VCFSegmentation',
                type: 'vcfview/Store/SeqFeature/Segmentation'
            });
            browser.registerTrackType({
                label: 'VCFSegmentationMultiBin',
                type: 'vcfview/Store/SeqFeature/SegmentationMultiBin'
            });
        }
    });
});
