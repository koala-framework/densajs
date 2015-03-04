Ext.define('Densa.mvc.bindable.Multiple', {
    extend: 'Densa.mvc.bindable.Abstract',

    items: null,
    panel: null, //optional

    init: function()
    {
        if (this.panel && !(this.panel instanceof Ext.panel.Panel)) Ext.Error.raise('panel config needs to be a Ext.panel.Panel');
        if (!this.items) Ext.Error.raise('items config is required');
        if (!(this.items instanceof Array)) Ext.Error.raise('items config needs to be an array');
        if (this.items.length < 1) Ext.Error.raise('items config length needs to be >0');
        for (var i=0; i<this.items.length; i++) {
            if (!this.items[i].isBindableController) {
                this.items[i] = this.items[i].getController();
            }
            if (!this.items[i].isBindableController) {
                Ext.Error.raise('item is not a bindableController');
            }
        }
        Ext.each(this.items, function(i) {
            i.on('savesuccess', function() {
                this.fireEvent('savesuccess');
            }, this);
        }, this);
    },

    load: function(row, store)
    {
        Ext.each(this.items, function(i) {
            i.load(row, store);
        }, this);
    },

    reset: function()
    {
        Ext.each(this.items, function(i) {
            i.reset();
        }, this);
    },

    isDirty: function()
    {
        var ret = false;
        Ext.each(this.items, function(i) {
            if (i.isDirty()) {
                ret = true;
                return false;
            }
        }, this);
        return ret;
    },

    isValid: function()
    {
        var ret = true;
        Ext.each(this.items, function(i) {
            if (!i.isValid()) {
                ret = false;
                return false;
            }
        }, this);
        return ret;
    },

    save: function(syncQueue)
    {
        Ext.each(this.items, function(i) {
            i.save(syncQueue);
        }, this);
    },

    getLoadedRecord: function()
    {
        return this.items[0].getLoadedRecord();
    },

    enable: function()
    {
        if (this.panel) this.panel.enable();
        Ext.each(this.items, function(i) {
            i.enable();
        }, this);
    },
    disable: function()
    {
        if (this.panel) this.panel.disable();
        Ext.each(this.items, function(i) {
            i.disable();
        }, this);
    },
    getPanel: function()
    {
        return this.panel;
    },
    onAdd: function()
    {
        var ret = false;
        Ext.each(this.items, function(i) {
            if (i.onAdd()) {
                ret = true;
                return false;
            }
        }, this);
        return ret;
    },

    allowDelete: function()
    {
        var ret = this.callParent(arguments);
        Ext.each(this.items, function(i) {
            ret = ret.then(function() {
                return i.allowDelete()
            });
        }, this);
        return ret;
    },

    allowSave: function()
    {
        var ret = this.callParent(arguments);
        Ext.each(this.items, function(i) {
            ret = ret.then(function() {
                return i.allowSave()
            });
        }, this);
        return ret;
    }
});
