Ext.define('Densa.mvc.bindable.ParentAssociation', {
    extend: 'Densa.mvc.bindable.Abstract',

    bindable: null,
    associationName: null,
    reloadRowOnSave: true,

    init: function()
    {
        this.callParent(arguments);
        if (!this.bindable) {
            Ext.Error.raise('bindable config is required');
        }
        if (!this.bindable.isBindableController) {
            this.bindable = this.bindable.getController();
        }
        if (!this.bindable.isBindableController) {
            Ext.Error.raise('bindable is not a bindableController');
        }
        if (!this.associationName) {
            Ext.Error.raise('associationName is required');
        }
        if (this.reloadRowOnSave) {
            //_parentRowStore is used so we can listen to 'write' event
            this._parentRowStore = new Ext.data.Store({
                proxy: 'memory'
            });
            this._parentRowStore.on('write', this._reloadLoadedRow, this);
        }
    },

    _reloadLoadedRow: function()
    {
        var r = this.getLoadedRecord();
        if (r && !r.phantom) {
            r.self.load(r.getId(), {
                success: function(loadedRow) {
                    r.beginEdit();
                    r.set(loadedRow.getData());
                    r.endEdit();
                    r.commit();
                },
                scope: this
            });
        }
    },

    load: function(row, store)
    {
        this._loadedRecord = row;
        var getterName;
        row.associations.each(function(i) {
            if (i instanceof Ext.data.association.BelongsTo) {
                if (i.name == this.associationName) {
                    getterName = i.getterName;
                }
            }
        }, this);
        if (!getterName) Ext.Error.raise("Can't find getterName for ");
        row[getterName](function(parentRow) {
            this.bindable.load(parentRow);
            if (this.reloadRowOnSave) {
                this._parentRowStore.removeAll();
                parentRow.join(this._parentRowStore);
            }
        }, this);

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
        return this.bindable.isValid();
    },

    save: function(syncQueue)
    {
        return this.bindable.save(syncQueue);
    },

    getLoadedRecord: function()
    {
        return this._loadedRecord;
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
        return this.bindable.getPanel();
    },
    onAdd: function()
    {
        return this.bindable.onAdd();
    },
    allowDelete: function()
    {
        return this.bindable.allowDelete();
    },
    allowSave: function()
    {
        return this.bindable.allowSave();
    }
});
