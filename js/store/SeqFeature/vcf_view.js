define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/promise/all',
    'JBrowse/Store/SeqFeature',
    'JBrowse/Store/DeferredStatsMixin',
    'JBrowse/Store/DeferredFeaturesMixin',
],
function( declare, 
    long, 
    all,
    SeqFeatureStore,
    DeferredFeaturesMixin,
    DeferredStatsMixin,
    ) {

    return declare( [DeferredFeaturesMixin, DeferredStatsMixin], {
        constructor: function( args ) {
        var browser = this.browser;
        console.log('tesing in on');
        /* do anything you need to initialize your plugin here */
        }
    });

});