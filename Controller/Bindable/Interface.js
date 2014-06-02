Ext4.define('Kwf.Ext4.Controller.Bindable.Interface', {
    isBindableController: true,
    load: Ext4.emptyFn,
    reset: Ext4.emptyFn,

    isDirty: function()
    {
        return false;
    },

    isValid: function()
    {
        return true;
    },

    save: Ext4.emptyFn,

    getLoadedRecord: Ext4.emptyFn,

    enable: Ext4.emptyFn,
    disable: Ext4.emptyFn,
    getPanel: Ext4.emptyFn,
    onAdd: Ext4.emptyFn
});
