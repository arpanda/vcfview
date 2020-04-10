define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/promise/all',
    'JBrowse/Store/SeqFeature',
], function (
    declare, 
    long, 
    array,
    all,
    SeqFeatureStore,
    ) {

    return declare([SeqFeatureStore ], {
        constructor: function (args) {
            console.log("testing the folder name")
            this.chunkSize = args.chunkSize || 10000
            this.urlTemplate = args.urlTemplate
            this.baseUrl = args.baseUrl
            this.type = args.type

            console.log(this.urlTemplate)
            console.log(this.chunkSize)
            console.log(this.type)

            //console.log(args.config);
            /* do anything you need to initialize your plugin here */
        }

        getFeatures(query, featureCallback, finishCallback, errorCallback) {
            query.toString = () => `${query.ref},${query.start},${query.end}`
            const s = query.start - query.start % chunkSize
            const e = query.end + (chunkSize - query.end % chunkSize)

        }

    });

});
