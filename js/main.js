define([
    'dojo/_base/declare',
    'JBrowse/Plugin'
],
function( declare, JBrowsePlugin) {

    return declare( JBrowsePlugin, {
        constructor: function( args ) {
        var browser = this.browser;
        console.log('VCF visualization started');
        /* do anything you need to initialize your plugin here */
        }
    });

});
