define([
        'dojo/_base/declare',
        'JBrowse/Store/SeqFeature/VCFTabix',
        'JBrowse/Model/SimpleFeature'
    ],
    function (declare, VCFTabix, SimpleFeature) {
        return declare(VCFTabix, {
            constructor: function(args){
                this.urlTemplate = args.urlTemplate

                this.BinSize = 1000
                if(typeof args.BinSize != "undefined"){
                    this.BinSize = args.BinSize
                }
            },

            getFeatures: function (query, featureCallback, finishCallback, errorCallback) {

                this.inherited(arguments, [query,  (feature) => {

                    var thisB = this
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
                    //console.log(query)
                    let span_len = (query.end - query.start)*query.basesPerSpan*query.scale
                    //console.log(span_len)
                    // console.log(feature.get('start'), feature.get('end'))
                    // console.log(sample_score)
                    let sample_data = new SimpleFeature({ id: feature.get('id'), data: { start:feature.get('start'),
                            end:feature.get('end'), score: sample_score }})
                    featureCallback(sample_data)


                }, finishCallback, errorCallback])
            }

        });
    });
