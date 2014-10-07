Ext.define('Densa.grid.controller.Bind', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    requires: [ 'Densa.data.StoreSyncQueue' ],

    saveChangesTitle: 'Save',
    saveChangesMsg: 'Do you want to save the changes?',


    gridController: null,
    bindable: null,

    constructor: function(config) {
        this.mixins.observable.constructor.call(this, config);
        this.init();
    },


    init: function()
    {
        if (!this.grid) Ext.Error.raise('grid config is required');
        if (!(this.grid instanceof Ext.grid.Panel)) Ext.Error.raise('grid config needs to be a Ext.grid.Panel');
        if (!this.grid.getController) Ext.Error.raise('grid has no controller');
        this.gridController = this.grid.getController();
        if (!(this.gridController instanceof Densa.grid.PanelController)) Ext.Error.raise('gridController needs to be a Densa.grid.PanelController');

        if (!this.bindable) Ext.Error.raise('bindable config is required');
        if (!this.bindable.isBindableController) {
            if (this.bindable.getController) {
                this.bindable = this.bindable.getController();
            }
        }
        if (!this.bindable.isBindableController) {
            Ext.Error.raise('bindable needs to implement Densa.mvc.bindable.Interface');
        }

        var grid = this.gridController.view;
        var bindable = this.bindable;
        bindable.disable();

        if (typeof this.addButton == 'undefined') this.addButton = grid.down('button#addButton');
        if (this.addButton && !(this.addButton instanceof Ext.button.Button)) Ext.Error.raise('addButton config needs to be a Ext.button.Button');

        grid.on('selectionchange', function(model, rows) {
            if (rows[0]) {
                var row = rows[0];
                bindable.enable();
                if (bindable.getLoadedRecord() !== row) {
                    bindable.load(row, this.grid.getStore());
                }
            } else {
                bindable.disable();
            }
        }, this);

        grid.on('beforeselect', function(sm, record) {
            if (bindable.getLoadedRecord() !== record && bindable.isDirty()) {
                this.askSaveChanges().then({
                    success: function() {
                        grid.getSelectionModel().select(record);
                    },
                    failure: function() {
                        grid.getSelectionModel().select(bindable.getLoadedRecord());
                    },
                    scope: this
                });
                return false;
            }
        }, this);

        this.gridController.view.on('bindstore', this.onBindStore, this);
        if (grid.getStore()) this.onBindStore(grid.getStore());

        if (this.addButton) {
            this.addButton.on('click', function() {
                this.askSaveChanges().then({
                    success: function() {
                        var s = grid.getStore();
                        var row = s.model.create();
                        s.add(row);
                        //this.bindable.view.fireEvent('add', row);
                        grid.getSelectionModel().select(row);
                        bindable.onAdd(row);
                    },
                    failure: function() {
                    },
                    scope: this
                });
            }, this);
        }
    },

    askSaveChanges: function()
    {
        if (!this.bindable.isDirty()) {
            return Deft.promise.Deferred.resolve();
        }
        var deferred = new Deft.promise.Deferred;
        Ext.Msg.show({
            title: this.saveChangesTitle,
            msg: this.saveChangesMsg,
            icon: Ext.MessageBox.QUESTION,
            buttons: Ext.Msg.YESNOCANCEL,
            scope: this,
            fn: function(button) {
                if (button == 'yes') {
                    this.doSave().then({
                        success: function() {
                            this.bindable.reset();
                            deferred.resolve();
                        },
                        failure: function() {
                            //validation failed re-select
                            deferred.reject();
                        },
                        scope: this
                    });
                } else if (button == 'no') {
                    var rec = this.bindable.getLoadedRecord();
                    if (rec && rec.phantom) {
                        this.grid.getStore().remove(rec);
                    }
                    this.bindable.reset();
                    deferred.resolve();
                } else if (button == 'cancel') {
                    deferred.reject();
                }
            }
        });
        return deferred.promise;
    },

    onRefreshStore: function()
    {
        var curr = this.bindable.getLoadedRecord();
        if (curr) {
            var newRow = this.gridController.view.getStore().getById(curr.getId());
            var selected = this.gridController.view.getSelectionModel().isSelected(newRow);
            //A refresh that loads the current row, a new object is created.
            //Load the new row, dirty values should be kept by the bindable
            if (newRow && newRow !== curr && selected) {
                this.bindable.enable();
                this.bindable.load(newRow, this.grid.getStore());
            }
        }
    },

    onBindStore: function(store)
    {
        store.on('refresh', this.onRefreshStore, this);
    },

    doSave: function()
    {
        return this.bindable.allowSave().then({
            success: function() {
                this.save();
                return Deft.promise.Deferred.resolve();
            },
            failure: function() {
                return Deft.promise.Deferred.failure();
            },
            scope: this
        });
    },

    save: function(syncQueue)
    {
        if (syncQueue) {
            syncQueue.add(this.gridController.view.getStore()); //sync this.gridController.view store first
            this.bindable.save(syncQueue);         //then bindables (so bindable grid is synced second)
                                                //bindable forms can still update the row as the sync is not yet started
            syncQueue.on('finished', function(syncQueue) {
                if (!syncQueue.hasException) {
                    //this.bindable.view.fireEvent('savesuccess');
                }
            }, this, { single: true });
        } else {
            this.bindable.save();                  //bindables first to allow form updating the row before sync
            this.gridController.view.getStore().sync({
                success: function() {
                    //this.bindable.view.fireEvent('savesuccess');
                },
                scope: this
            });
        }
        //this.bindable.view.fireEvent('save');
    },

    isValid: function()
    {
        return this.bindable.isValid();
    },

    isDirty: function()
    {
        return this.bindable.isDirty();
    },

    reset: function()
    {
        return this.bindable.reset();
    }
});
