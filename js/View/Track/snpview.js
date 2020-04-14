define([
        'dojo/_base/declare',
        'JBrowse/View/Track/SNPCoverage'
    ],
    function (declare, SNPCoverageStore) {
        return declare(SNPCoverageStore,
            {
                constructor: function (args) {
                    this.inherited(arguments);
                    this.store = args.store;
                }
            });
    });