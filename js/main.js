define([
        'dojo/_base/declare',
        'JBrowse/Plugin'
    ],
    function (
        declare,
        JBrowsePlugin
    ) {
        return declare(JBrowsePlugin,
            {
                constructor: function ( /* args */) {

                    // do anything you need to initialize your plugin here
                    console.log("vcfview plugin starting");

                }
            });
    });
