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
                    var genotype = feature.get('genotypes')
                    samples = Object.keys(genotype)

                    var sample_position = samples.length-1
                    var sample_name = feature.get('genotypes')[samples[sample_position]]

                    var sample_score = 0
                    if( typeof sample_name.DP != 'undefined'){
                        sample_score = sample_name.DP.values[0]
                    }else if (typeof sample_name.mutect_DP != 'undefined'){
                        sample_score = sample_name.mutect_DP.values[0]
                    }else if (typeof sample_name.strelka_DP != 'undefined'){
                        sample_score = sample_name.strelka_DP.values[0]
                    }else if (typeof sample_name.lofreq_DP != 'undefined'){
                        sample_score = sample_name.lofreq_DP.values[0]
                    }
                    console.log(sample_score)
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