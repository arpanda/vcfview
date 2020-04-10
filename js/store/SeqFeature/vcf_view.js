define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'JBrowse/Store/SeqFeature',
], function (
    declare, 
    long, 
    array, 
    SeqFeatureStore,
    ) {

    return declare([SeqFeatureStore ], {
        constructor: function(args) {
            console.log('tesing in');
            /* do anything you need to initialize your plugin here */
        }

    });

});
