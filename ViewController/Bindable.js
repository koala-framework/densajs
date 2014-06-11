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
        if (this._disableOnInit) {
            delete this._disableOnInit;
            this.disable();
        }
        if (this._loadOnInit) {
            this.load.apply(this, this._loadOnInit);
            delete this._loadOnInit;
        }
    },

    //store is optional, used for sync
    load: function(row, store)
    {
        if (this.bindable) {
            return this.bindable.load(row, store);
        } else {
            this._loadOnInit = [row, store];
        }
    },

    save: function(syncQueue)
    {
        if (this.bindable) {
            return this.bindable.save(syncQueue);
        }
    },

    getLoadedRecord: function()
    {
        if (this.bindable) {
            return this.bindable.getLoadedRecord();
        } else if (this._loadOnInit) {
            return this._loadOnInit[0];
        }
        return null
    },

    reset: function()
    {
        if (this.bindable) {
            return this.bindable.reset();
        }
    },

    isDirty: function()
    {
        if (this.bindable) {
            return this.bindable.isDirty();
        } else {
            return false;
        }
    },

    isValid: function()
    {
        if (this.bindable) {
            return this.bindable.isValid();
        } else {
            return true;
        }
    },

    enable: function()
    {
        if (this.bindable) {
            return this.bindable.enable();
        } else {
            this._disableOnInit = false;
        }
    },
    disable: function()
    {
        if (this.bindable) {
            return this.bindable.disable();
        } else {
            this._disableOnInit = true;
        }
    },
    getPanel: function()
    {
        return this.view;
    },

    onAdd: function()
    {
        if (this.bindable) {
            return this.bindable.onAdd();
        }
    }
});
