Ext4.define('Kwf.Ext4.ViewController.Bindable', {
    extend: 'Kwf.Ext4.ViewController.Abstract',

    mixins: {
        bindable: 'Kwf.Ext4.Controller.Bindable.Interface'
    },
    init: function()
    {
        if (!this.bindable) {
            Ext4.Error.raise('bindable is required');
        }
        if (!this.bindable.isBindableController && this.bindable.getController) {
            this.bindable = this.bindable.getController();
        }
        if (!this.bindable.isBindableController) {
            Ext4.Error.raise('bindable needs to implement Kwf.Ext4.Controller.Bindable.Interface');
        }
    },

    //store is optional, used for sync
    load: function(row, store)
    {
        return this.bindable.load(row, store);
    },

    save: function(syncQueue)
    {
        return this.bindable.save(syncQueue);
    },

    getLoadedRecord: function()
    {
        return this.bindable.getLoadedRecord();
    },

    reset: function()
    {
        return this.bindable.reset();
    },

    isDirty: function()
    {
        return this.bindable.isDirty();
    },

    isValid: function()
    {
        return this.bindable.isDirty();
    },

    enable: function()
    {
        return this.bindable.enable();
    },
    disable: function()
    {
        return this.bindable.disable();
    },
    getPanel: function()
    {
        return this.view;
    },

    onAdd: function()
    {
        return this.bindable.onAdd();
    }
});
