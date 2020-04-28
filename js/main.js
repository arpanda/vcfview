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
                label: 'VCFSegmentationMultiBin',
                type: 'vcfview/View/Track/SegmentationMultiBin'
            });

            browser.registerTrackType({
                label: 'SegmentationTrack',
                type: 'vcfview/View/Track/SegmentationTrack'
            });
        }
    });
});
