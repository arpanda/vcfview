define([
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/array',
        'dojo/promise/all'
    ],
    function (declare, lang, array, all) {
        return declare(null, {
            constructor: function (args) {
                console.log("I am inside vcf view ");
            }
        });
    });