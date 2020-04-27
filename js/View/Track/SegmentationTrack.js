
define([
    'dojo/_base/declare',
    'JBrowse/View/Track/Wiggle/XYPlot',
    'vcfview/Store/SeqFeature/SegmentationMultiBin'
    ],
    function(declare, XYPlot, SegmentationMultiBin) {
        return declare(XYPlot, {
            constructor(args) {
                console.log("testing web integration")
                this.store = new SegmentationMultiBin(this.store)
                console.log(this.store)
            }
        })
});
