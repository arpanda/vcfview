define([
    'dojo/_base/declare',
    'JBrowse/View/Track/FeatureView',
],
function(
    declare,
    FeatureView
) {
    return declare(FeatureView, {
        renderDetailValue: function(parent, title, val, f, class_) {
            if(!val) return;
            this.inherited(arguments);
        }
    });
});