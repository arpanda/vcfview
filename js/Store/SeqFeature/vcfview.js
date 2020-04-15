define([
        'dojo/_base/declare',
        'JBrowse/Store/SeqFeature/VCFTabix',
        'JBrowse/Model/SimpleFeature'
    ],
    function (declare, VCFTabix, SimpleFeature) {
        return declare(VCFTabix, {
            getFeatures: function (query, featureCallback, finishCallback, errorCallback) {
                this.inherited(arguments, [query,  (feature) => {
                    console.log(feature)
                    //console.log(feature.get('genotypes').Sample.DP.values[0])
                    let sample_info = feature.get('genotypes').get('samples')
                    console.log(sample_info)

                    var sample_data = new SimpleFeature({ id: feature.get('id'), data: { start:feature.get('start'), end:feature.get('end'), score: feature.get('genotypes').Sample.DP.values[0] }})
                    featureCallback(sample_data)

                }, finishCallback, errorCallback])
            }

        });
    });