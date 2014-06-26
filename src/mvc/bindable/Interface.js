Ext.define('Densa.mvc.bindable.Interface', {
    requires: [
        'Deft.promise.Deferred', 'Deft.promise.Promise'
    ],
    isBindableController: true,
    load: Ext.emptyFn,
    reset: Ext.emptyFn,

    isDirty: function()
    {
        return false;
    },

    isValid: function()
    {
        return true;
    },

    save: Ext.emptyFn,

    getLoadedRecord: Ext.emptyFn,

    enable: Ext.emptyFn,
    disable: Ext.emptyFn,
    getPanel: Ext.emptyFn,
    onAdd: Ext.emptyFn,

    allowDelete: function()
    {
        return Deft.promise.Deferred.resolve();
    },

    allowSave: function()
    {
        return Deft.promise.Deferred.resolve();
    }
});
