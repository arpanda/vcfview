define([
    'dojo/_base/declare',
    'JBrowse/Plugin'
],
function( declare, JBrowsePlugin) {

    return declare( JBrowsePlugin, {
        constructor: function( /* args */ ) {
        console.log('vcf_view plugin starting');
        }
    });

});
