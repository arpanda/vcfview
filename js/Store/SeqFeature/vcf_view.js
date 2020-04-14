define(
    ['dojo/_base/declare', 'dojo/_base/lang', 'dojo/promise/all'],
    function (declare, lang, all) {
        return declare(null, {
            constructor: function (args) {
                console.log("I am inside vcf view ")
            }
        });
    }
);