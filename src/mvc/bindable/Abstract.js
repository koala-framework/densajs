Ext.define('Densa.mvc.bindable.Abstract', {
    extend: 'Densa.mvc.bindable.Interface',
    mixins: {
        observable: 'Ext.util.Observable'
    },
    constructor: function(config) {
        this.mixins.observable.constructor.call(this, config);
        this.init();
    },

    init: Ext.emptyFn
});
