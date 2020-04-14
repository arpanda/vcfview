define([
        'dojo/_base/declare',
        'JBrowse/View/Track/CanvasFeatures'
    ],
    function (declare, CanvasFeatures) {
        return declare(CanvasFeatures,
            {
                constructor: function (args) {
                    this.inherited(arguments);
                    this.store = args.store;
                }
            });
    });