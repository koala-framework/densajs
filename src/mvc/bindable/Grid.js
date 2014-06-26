Ext4.define('Densa.mvc.bindable.Grid', {
    extend: 'Densa.mvc.bindable.Abstract',

    relation: null,
    gridController: null,
    reloadRowOnSave: false,

    init: function()
    {
        if (!this.grid) Ext4.Error.raise('grid config is required');
        if (!(this.grid instanceof Ext4.grid.Panel)) Ext4.Error.raise('grid config needs to be a Ext4.grid.Panel');
        this.gridController = this.grid.getController();
        if (!(this.gridController instanceof Densa.grid.PanelController)) Ext4.Error.raise('gridController needs to be a Densa.grid.PanelController');

        if (!this.relation) Ext4.Error.raise('relation config is required');

        if (this.reloadRowOnSave) {
            //savesuccess is fired by gridController on sync after delete
            this.gridController.view.on('savesuccess', this._reloadLoadedRow, this);
        }
    },

    load: function(row, parentStore)
    {
        var storeName = this.relation+'Store'; //same naming as in Ext.data.association.HasMany
        if (this._loadedRecord && this._loadedRecord[storeName]) {
            //if new row has same id as currently loaded copy the store
            //this makes sures dirty values are kept
            if (row.getId() == this._loadedRecord.getId()) {
                row[storeName] = this._loadedRecord[storeName];
            }
        }
        this._loadedRecord = row;
        var store = row[this.relation]();
        if (!store.loaded) {
            store.loaded = true;
            if (!row.phantom) {
                store.load();
            }
        }

        //if both model has HayMany assocication and child model has BelongsTo associacion
        //we set the child models the parent model instance wich they will use for getXxx
        //that way both share the same object
        var belongsToAssoc;
        store.model.prototype.associations.each(function(assoc) {
            if (assoc instanceof Ext4.data.association.BelongsTo) {
                Ext4.ClassManager.get(assoc.model).prototype.associations.each(function(i) {
                    if (i instanceof Ext4.data.association.HasMany
                        && i.model == store.model.$className
                        && i.foreignKey == assoc.foreignKey
                    ) {
                        belongsToAssoc = assoc;
                    }
                }, this);

            }
        }, this);
        if (belongsToAssoc) {
            if (!store['belongsTo'+belongsToAssoc.instanceName]) {
                store.loadRecords = Ext4.Function.createInterceptor(store.loadRecords, function(records) {
                    var store = this;
                    for (var i=0; i < records.length; i++) {
                        records[i][belongsToAssoc.instanceName] = store['belongsTo'+belongsToAssoc.instanceName];
                    }
                });
                store.insert = Ext4.Function.createInterceptor(store.insert, function(index, records) {
                    var store = this;
                    if (!Ext4.isIterable(records)) {
                        records = [records];
                    }
                    for (var i=0; i < records.length; i++) {
                        records[i][belongsToAssoc.instanceName] = store['belongsTo'+belongsToAssoc.instanceName];
                    }
                });
            }
            store['belongsTo'+belongsToAssoc.instanceName] = row;
            store.each(function(r) {
                r[belongsToAssoc.instanceName] = row;
            }, this);
        }

        this.gridController.view.bindStore(store);
    },

    reset: function()
    {
        this._loadedRecord = null;
        this.gridController.view.bindStore(Ext4.StoreMgr.get('ext-empty-store'));
    },

    isDirty: function()
    {
        if (!this.gridController.view.getStore()) return false;
        return this.gridController.view.getStore().getModifiedRecords().length || this.gridController.view.getStore().getNewRecords().length;
    },

    isValid: function()
    {
        return true;
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

    save: function(syncQueue)
    {
        if (this.gridController.view.getStore()) {
            if (syncQueue) {
                syncQueue.add(this.gridController.view.getStore());
                if (this.reloadRowOnSave) {
                    syncQueue.on('finished', function() {
                        this._reloadLoadedRow();

                    }, this, { single: true });
                }
            } else {
                this.gridController.view.getStore().sync({
                    callback: function() {
                        if (this.reloadRowOnSave) {
                            this._reloadLoadedRow();
                        }
                    },
                    scope: this
                });
            }
        }
    },

    getLoadedRecord: function()
    {
        return this._loadedRecord;
    },

    enable: function()
    {
        this.gridController.view.enable();
    },
    disable: function()
    {
        this._loadedRecord = null;
        var s = this.gridController.view.store;
        if (s) {
            this.gridController.view.bindStore(Ext4.create('Ext.data.Store', {
                model: s.model
            }));
        }
        this.gridController.view.disable();
    },
    getPanel: function()
    {
        return this.grid;
    }
});
