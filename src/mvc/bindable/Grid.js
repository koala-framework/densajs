Ext.define('Densa.mvc.bindable.Grid', {
    extend: 'Densa.mvc.bindable.Abstract',

    relation: null,
    gridController: null,

    init: function()
    {
        if (!this.grid) Ext.Error.raise('grid config is required');
        if (!(this.grid instanceof Ext.grid.Panel)) Ext.Error.raise('grid config needs to be a Ext.grid.Panel');
        this.gridController = this.grid.getController();
        if (!(this.gridController instanceof Densa.grid.PanelController)) Ext.Error.raise('gridController needs to be a Densa.grid.PanelController');

        if (!this.relation) Ext.Error.raise('relation config is required');

        //savesuccess is fired by gridController on sync after delete
        this.grid.on('savesuccess', this._reloadGrid, this);
        this.grid.on('savesuccess', function(type) {
            this.fireEvent('savesuccess', type);
        }, this);

        this.grid.getController().bindable = this;
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

        //if both model has HayMany assocication and child model has BelongsTo associacion
        //we set the child models the parent model instance wich they will use for getXxx
        //that way both share the same object
        var belongsToAssoc;
        store.model.prototype.associations.each(function(assoc) {
            if (assoc instanceof Ext.data.association.BelongsTo && assoc.model == row.$className) {
                Ext.ClassManager.get(assoc.model).prototype.associations.each(function(i) {
                    if (i instanceof Ext.data.association.HasMany
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
                store.loadRecords = Ext.Function.createInterceptor(store.loadRecords, function(records) {
                    var store = this;
                    for (var i=0; i < records.length; i++) {
                        records[i][belongsToAssoc.instanceName] = store['belongsTo'+belongsToAssoc.instanceName];
                    }
                });
                store.insert = Ext.Function.createInterceptor(store.insert, function(index, records) {
                    var store = this;
                    if (!Ext.isIterable(records)) {
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
        // loaded after bindStore to enable views to apply filters
        if (!row.phantom
            && (!store.lastOptions
                || !this._filtersArrayEqual(store.filters.items, store.lastOptions.filters)
            )
        ) {
            store.load();
        }
    },

    _filtersArrayEqual: function(filtersOne, filtersTwo)
    {
        if (filtersOne.length != filtersTwo.length) return false;
        for (var i = 0; i < filtersOne.length; i++) {
            var filterMatchedInSecondArray = false;
            for (var a = 0; a < filtersTwo.length; a++) {
                if (filtersOne[i].id == filtersTwo[a].id
                    && filtersOne[i].property == filtersTwo[a].property
                    && filtersOne[i].value == filtersTwo[a].value
                ) {
                    filterMatchedInSecondArray = true;
                    break;
                }
            }
            if (!filterMatchedInSecondArray) return false;
        }
        return true;
    },

    reset: function()
    {
        this._loadedRecord = null;
        this.gridController.view.bindStore(Ext.StoreMgr.get('ext-empty-store'));
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

    _reloadGrid: function()
    {
        this.gridController.view.getStore().reload();
    },

    save: function(syncQueue)
    {
        if (this.gridController.view.getStore()) {
            if (syncQueue) {
                syncQueue.add(this.gridController.view.getStore());
                syncQueue.on('finished', function() {
                    this._reloadGrid();
                }, this, { single: true });
            } else {
                this.gridController.view.getStore().sync({
                    callback: function() {
                        this._reloadGrid();
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
            this.gridController.view.bindStore(Ext.create('Ext.data.Store', {
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
