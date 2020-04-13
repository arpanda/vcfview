define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/promise/all',
    'JBrowse/Store/SeqFeature'
], function (
    declare, 
    long,
    array,
    all,
    SeqFeatureStore,
    ) {

    return declare( null, {
        constructor: function (args) {
            console.log("testing the folder name")
            this.chunkSize = args.chunkSize || 10000
            this.urlTemplate = args.urlTemplate
            this.baseUrl = args.baseUrl


            console.log(this.urlTemplate)
            console.log(this.chunkSize)

            //console.log(args.config);
            /* do anything you need to initialize your plugin here */
        }

    });

});
