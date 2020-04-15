define([
        'dojo/_base/declare',
        'JBrowse/Store/SeqFeature/VCFTabix',
        'JBrowse/Model/SimpleFeature'
    ],
    function (declare, VCFTabix, SimpleFeature) {
        return declare(VCFTabix, {
            constructor: function(args){
              this.urlTemplate =args.urlTemplate
            },

            getFeatures: function (query, featureCallback, finishCallback, errorCallback) {

                this.inherited(arguments, [query,  (feature) => {

                    // my code
                    // console.log(this.urlTemplate)
                    // console.log(feature)
                    let genotype = feature.get('genotypes')
                    let samples = Object.keys(genotype)

                    let sample_position = samples.length-1
                    let sample_name = feature.get('genotypes')[samples[sample_position]]

                    let sample_score = 0
                    const field_list = ['DP', 'mutect_DP', 'strelka_DP', 'lofreq_DP']
                    field_list.forEach(val => {
                        if (typeof sample_name[val] != "undefined"){
                            sample_score = sample_name[val].values[0]
                        }
                    });

                    // console.log(sample_score)
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