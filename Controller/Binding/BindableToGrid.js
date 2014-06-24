Ext4.define('Kwf.Ext4.Controller.Binding.BindableToGrid', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    requires: [ 'Kwf.Ext4.Data.StoreSyncQueue' ],

    gridController: null,
    bindable: null,

    constructor: function(config) {
        this.mixins.observable.constructor.call(this, config);
        this.init();
    },


    init: function()
    {
        if (!this.grid) Ext4.Error.raise('grid config is required');
        if (!(this.grid instanceof Ext4.grid.Panel)) Ext4.Error.raise('grid config needs to be a Ext4.grid.Panel');
        if (!this.grid.getController) Ext4.Error.raise('grid has no controller');
        this.gridController = this.grid.getController();
        if (!(this.gridController instanceof Kwf.Ext4.ViewController.Grid)) Ext4.Error.raise('gridController needs to be a Kwf.Ext4.ViewController.Grid');

        if (!this.bindable) Ext4.Error.raise('bindable config is required');
        if (!this.bindable.isBindableController) {
            if (this.bindable.getController) {
                this.bindable = this.bindable.getController();
            }
        }
        if (!this.bindable.isBindableController) {
            Ext4.Error.raise('bindable needs to implement Kwf.Ext4.Controller.Bindable.Interface');
        }

        var grid = this.gridController.view;
        var bindable = this.bindable;
        bindable.disable();

        if (!this.addButton) this.addButton = grid.down('button#add');
        if (this.addButton && !(this.addButton instanceof Ext4.button.Button)) Ext4.Error.raise('addButton config needs to be a Ext.button.Button');

        grid.on('selectionchange', function(model, rows) {
            if (rows[0]) {
                var row = rows[0];
                bindable.enable();
                if (bindable.getLoadedRecord() !== row) {
                    bindable.load(row, this.grid.getStore());
                }
                if (this.saveButton) this.saveButton.enable();
            } else {
                bindable.disable();
                if (this.saveButton) this.saveButton.disable();
            }
        }, this);

        grid.on('beforeselect', function(sm, record) {
            if (bindable.getLoadedRecord() !== record && bindable.isDirty()) {
                Ext4.Msg.show({
                    title: trlKwf('Save'),
                    msg: trlKwf('Do you want to save the changes?'),
                    buttons: Ext4.Msg.YESNOCANCEL,
                    scope: this,
                    fn: function(button) {
                        if (button == 'yes') {
                            this.save().then({
                                success: function() {
                                    bindable.reset();
                                    grid.getSelectionModel().select(record);
                                },
                                failure: function() {
                                    //validation failed re-select
                                    grid.getSelectionModel().select(bindable.getLoadedRecord());
                                },
                                scope: this
                            });
                        } else if (button == 'no') {
                            bindable.reset();
                            grid.getSelectionModel().select(record);
                        } else if (button == 'cancel') {
                            grid.getSelectionModel().select(bindable.getLoadedRecord());
                        }
                    }
                });
                return false;
            }
        }, this);

        this.gridController.view.on('bindstore', this.onBindStore, this);
        if (grid.getStore()) this.onBindStore(grid.getStore());

        if (this.addButton) {
            this.addButton.on('click', function() {
                if (!bindable.isValid()) {
                    return false;
                }

                var s = grid.getStore();
                var row = s.model.create();
                s.add(row);
                this.bindable.view.fireEvent('add', row);

                grid.getSelectionModel().select(row);
                bindable.onAdd(row);

            }, this);
        }
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

    save: function(syncQueue)
    {
        return this.bindable.allowSave().then({
            success: function() {
                if (syncQueue) {
                    syncQueue.add(this.gridController.view.getStore()); //sync this.gridController.view store first
                    this.bindable.save(syncQueue);         //then bindables (so bindable grid is synced second)
                                                        //bindable forms can still update the row as the sync is not yet started
                    syncQueue.on('finished', function(syncQueue) {
                        if (!syncQueue.hasException) {
                            this.bindable.view.fireEvent('savesuccess');
                        }
                    }, this, { single: true });
                } else {
                    this.bindable.save();                  //bindables first to allow form updating the row before sync
                    this.gridController.view.getStore().sync({
                        success: function() {
                            this.bindable.view.fireEvent('savesuccess');
                        },
                        scope: this
                    });
                }
                this.bindable.view.fireEvent('save');
            },
            scope: this
        });
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
