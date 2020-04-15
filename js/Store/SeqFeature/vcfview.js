define([
        'dojo/_base/declare',
        'JBrowse/Store/SeqFeature/VCFTabix',
        'JBrowse/Model/SimpleFeature'
    ],
    function (declare, VCFTabix, SimpleFeature) {
        return declare(VCFTabix, {
            getFeatures: function (query, featureCallback, finishCallback, errorCallback) {

                this.inherited(arguments, [query,  (feature) => {

                    // my code
                    console.log(feature.urlTemplate)
                    console.log(feature)
                    var genotype = feature.get('genotypes')
                    samples = Object.keys(genotype)

                    var sample_position = samples.length-1
                    var sample_score = feature.get('genotypes')[samples[sample_position]][DP].values[0]
                    var sample_data = new SimpleFeature({ id: feature.get('id'), data: { start:feature.get('start'), end:feature.get('end'), score: sample_score }})
                    featureCallback(sample_data)


                    /*
                    console.log(feature)
                    //console.log(feature.get('genotypes').Sample.DP.values[0])
                    var sample_info = feature.get('genotypes').Sample.DP.values[0];
                    console.log(sample_info)

                    var sample_data = new SimpleFeature({ id: feature.get('id'), data: { start:feature.get('start'), end:feature.get('end'), score: sample_info }})
                    featureCallback(sample_data)
                    */
                }, finishCallback, errorCallback])
            }

        });
    });