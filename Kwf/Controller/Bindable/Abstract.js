Ext4.define('Kwf.Ext4.Controller.Bindable.Abstract', {
    extend: 'Kwf.Ext4.Controller.Bindable.Interface',
    mixins: {
        observable: 'Ext.util.Observable'
    },
    constructor: function(config) {
        this.mixins.observable.constructor.call(this, config);
        this.init();
    },

    init: Ext4.emptyFn
});
