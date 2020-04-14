define([
        'dojo/_base/declare',
        'JBrowse/Store/SeqFeature/VCFTabix'
    ],
    function (declare, VCFTabix) {
        return declare(VCFTabix, {
            getFeatures: function (query, featureCallback, finishCallback, errorCallback) {
                this.inherited(arguments, [query,  (feature) => {
                    console.log(feature.get('genotypes').Sample.DP.values[0])
                    featureCallback(feature)

                }, finishCallback, errorCallback])
            }

        });
    });