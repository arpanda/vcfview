define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/promise/all',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Store/DeferredStatsMixin',
    'JBrowse/Store/DeferredFeaturesMixin',
], function (declare, long, array, all, SeqFeatureStore, DeferredFeaturesMixin, DeferredStatsMixin) {

    return declare([SeqFeatureStore, DeferredFeaturesMixin, DeferredStatsMixin ], {
        constructor: function (args) {
            console.log('tesing in');
            /* do anything you need to initialize your plugin here */
        }
    });

});
