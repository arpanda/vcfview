define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'JBrowse/Store/SeqFeature',
], function (
    declare, 
    long,
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

    });

});
