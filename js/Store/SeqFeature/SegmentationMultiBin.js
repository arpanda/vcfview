define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'JBrowse/Store/LRUCache',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Model/SimpleFeature',
],
function (
    declare,
    lang,
    LRUCache,
    SeqFeatureStore,
    SimpleFeature,
) {
    return declare([SeqFeatureStore], {
        constructor(args) {
            this.sample = args.config.sample | 0;
            console.log(this.sample);
            this.store = args.store;
            this.dpField = args.config.dpField || 'DP';
            this.binSize = args.config.binSize || 100000;
            this.featureCache = new LRUCache({
                name: 'vcfFeatureCache',
                fillCallback: dojo.hitch(this, '_readChunk'),
                sizeFunction: function (features) {
                    return features.length;
                },
                maxSize: 100000
            });
        },
        getFeatures: function (query, featCallback, finishCallback, errorCallback) {

            let chunkSize = "undefined";
            //console.log(this.binSize)

            if(typeof  this.binSize == "number"){
                chunkSize = this.binSize;
            }else{
                var bin_array = this.binSize;
                let zoom = query.basesPerSpan
                chunkSize = bin_array.reduce(function(prev, curr) {
                    return (Math.abs(curr - zoom) < Math.abs(prev - zoom) ? curr : prev);
                });
            }
            //console.log("selected binsize", chunkSize)

            var s = query.start - query.start % chunkSize;
            var e = query.end + (chunkSize - (query.end % chunkSize));
            var chunks = [];

            var chunksProcessed = 0;
            for (let start = s; start < e; start += chunkSize) {
                var chunk = { ref: query.ref, start: start, end: start + chunkSize };
                chunk.toString = function () {
                    return query.ref + ',' + query.start + ',' + query.end;
                };
                chunks.push(chunk);
            }

            chunks.forEach(c => {
                this.featureCache.get(c, function (f, err) {
                    if (err) {
                        errorCallback(err);
                    } else {
                        if (f) {
                            featCallback(f);
                        }
                        if (++chunksProcessed === chunks.length) {
                            finishCallback();
                        }
                    }
                });
            });
        },
        _readChunk(params, callback) {
            let score = 0;
            let numFeatures = 0;
            const {ref, start, end} = params;

            this.store.getFeatures({ref, start, end}, feature => {
                let genotype = feature.get('genotypes');
                let samples = Object.keys(genotype);

                //let sample_position = samples.length - 1;
                //let sample_position = samples.length - 1;

                let sample_position = this.sample  // select sample position

                //console.log(feature.get('genotypes'))
                let sample_name = feature.get('genotypes')[samples[sample_position]];

                //score += sample_name[this.dpField].values[0];

                let sample_score = 0
                //const field_list = ['DP', 'mutect_DP', 'strelka_DP', 'lofreq_DP']
                const field_list = ['AF']
                field_list.forEach(val => {
                    if (typeof sample_name[val] != "undefined"){
                        //console.log(sample_name[val])
                        sample_score = sample_name[val].values[0]
                        sample_score = sample_name[val].values[0]
                        //console.log(sample_score)
                    }
                });
                score += sample_score

                numFeatures++;
            }, () => {
                if (numFeatures) {
                    // console.log(start, end, end-start, score / numFeatures)
                    callback(
                        new SimpleFeature({id: `${start}_${end}`, data: {start, end, score: score / numFeatures}})
                    );
                } else {
                    callback(null);
                }
            }, error => {
                callback(null, error);
            });
        },
        getSampleName: function(query, featCallback, finishCallback, errorCallback){
            console.log('sample name', query.start)

        }
    });
});

