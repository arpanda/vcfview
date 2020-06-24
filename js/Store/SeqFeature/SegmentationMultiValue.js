define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'JBrowse/Store/LRUCache',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Model/SimpleFeature',
    'JBrowse/Store/SeqFeature/VCFTabix'
],
function (declare, lang, LRUCache, SeqFeatureStore, SimpleFeature, VCFTabix,) {
    return declare([VCFTabix, SeqFeatureStore], {
        constructor(args) {
            this.dpField = args.dpField || 'DP';
            this.binSize = args.binSize || 100000;
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
            var chunkSize = this.binSize;

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
            var supermethod = this.getInherited(arguments);

            chunks.forEach(c => {
                this.featureCache.get(Object.assign(c, {supermethod}), function (f, err) {
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
            const {supermethod, ref, start, end} = params;

            supermethod.call(this, {ref, start, end}, feature => {
                let genotype = feature.get('genotypes');
                let samples = Object.keys(genotype);

                let sample_position = samples.length - 1;
                let sample_name = feature.get('genotypes')[samples[sample_position]];

                //score += sample_name[this.dpField].values[0];

                let sample_score = 0
                const field_list = ['DP', 'mutect_DP', 'strelka_DP', 'lofreq_DP']
                field_list.forEach(val => {
                    if (typeof sample_name[val] != "undefined"){
                        sample_score = sample_name[val].values[0]
                    }
                });
                score += sample_score

                numFeatures++;
            }, () => {
                if (numFeatures) {
                    //console.log(start, end, end-start)
                    callback(
                        new SimpleFeature({id: `${start}_${end}`, data: {start, end, score: score / numFeatures}})
                    );
                } else {
                    callback(null);
                }
            }, error => {
                callback(null, error);
            });
        }
    });
});
