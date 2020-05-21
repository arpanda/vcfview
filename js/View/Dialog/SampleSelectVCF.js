define([
    'dojo/_base/declare',
    'dojo/dom-construct',
    'dojo/on',
    'dijit/focus',
    'dijit/form/NumberSpinner',
    'dijit/form/Select',
    'dijit/form/Button',
    'JBrowse/View/Dialog/WithActionBar'
],
function (
    declare,
    dom,
    on,
    focus,
    NumberSpinner,
    Select,
    Button,
    ActionBarDialog
) {
    return declare(ActionBarDialog, {
        title: 'Set sample name',

        constructor: function (args) {
            this.sample          = args.sample || 0;
            this.browser         = args.browser;
            this.setCallback     = args.setCallback || function () {};
            this.cancelCallback  = args.cancelCallback || function () {};
        },

        _fillActionBar: function (actionBar) {
            new Button({
                label: 'OK',
                onClick: dojo.hitch(this, function () {

                    var sample = this.SampleSelect.getValue();

                    this.setCallback && this.setCallback(sample);
                    this.hide();
                })
            }).placeAt(actionBar);

            new Button({
                label: 'Cancel',
                onClick: dojo.hitch(this, function () {
                    this.cancelCallback && this.cancelCallback();
                    this.hide();
                })
            }).placeAt(actionBar);
        },

        show: function (/* callback */) {

            this.SampleSelect = new Select({
                name: 'sample_select',
                options: [
                    { label: 'First Sample', value: '0', selected: true },
                    { label: 'Second Sample', value: '1' }
                ],
                value: this.sample
            });

            this.set('content', [
                dom.create('p', { innerHTML: 'Set Sample name' }),
                dom.create('label', { for: 'sample_select', innerHTML: 'Sample', style: {display: 'inline-block', width: '100px' } }),
                this.SampleSelect.domNode,
                dom.create('br')
            ]);

            this.inherited(arguments);
        },

        hide: function () {
            this.inherited(arguments);
            window.setTimeout(dojo.hitch(this, 'destroyRecursive'), 500);
        }
    });
});
