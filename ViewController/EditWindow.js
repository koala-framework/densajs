Ext4.define('Kwf.Ext4.ViewController.EditWindow', {
    extend: 'Kwf.Ext4.ViewController.Abstract',
    uses: [ 'Kwf.Ext4.Data.StoreSyncQueue' ],

    focusOnEditSelector: 'field',
    bindable: null,
    autoSync: false,

    deleteConfirmText: trlKwf('Do you really wish to remove this entry?'),

    optionalControl: {

        saveButton: {
            selector: '> toolbar > button#save',
            listeners: {
                click: 'onSaveClick'
            }
        },

        deleteButton: {
            selector: '> toolbar > button#delete',
            listeners: {
                click: 'onDeleteClick'
            }
        },

        cancelButton: {
            selector: '> toolbar > button#cancel',
            listeners: {
                click: 'onCancelClick'
            }
        }

    },
    init: function()
    {
        if (!this.view) Ext4.Error.raise('view is required');
        if (!(this.view instanceof Ext4.window.Window)) Ext4.Error.raise('view needs to be a Ext.window.Window');

        if (!this.bindable) {
            //by default (most common case) get form
            this.bindable = this.view.down('> form');
        }
        if (!this.bindable) Ext4.Error.raise('bindable config is required');
        if (!this.bindable.isBindableController && this.bindable.getController) {
            this.bindable = this.bindable.getController();
        }
        if (!this.bindable.isBindableController) {
            Ext4.Error.raise('bindable config needs to be a Kwf.Ext4.Controller.Bindable.Interface');
        }

        this.view.on('beforeclose', function() {
            this.onCancelClick();
            return false;
        }, this);
    },

    //store is optional, used for sync
    openEditWindow: function(row, store)
    {
        this._loadedStore = store;
        if (row.phantom) {
            this.view.setTitle(trlKwf('Add'));
        } else {
            this.view.setTitle(trlKwf('Edit'));
        }
        this.view.show();
        this.bindable.load(row, store);
        if (this.focusOnEditSelector) {
            this.view.down(this.focusOnEditSelector).focus();
        }
    },

    validateAndSubmit: function(options)
    {
        return this.bindable.validateAndSubmit(options);
    },

    doSave: function()
    {
        return this.bindable.allowSave().then({
            success: function() {

                var row = this.bindable.getLoadedRecord();
                if (row.phantom && this._loadedStore
                    && this._loadedStore.indexOf(row) == -1
                ) {
                    this._loadedStore.add(row);
                }

                if (this.autoSync) {
                    if (this._loadedStore) {
                        var syncQueue = new Kwf.Ext4.Data.StoreSyncQueue();
                        syncQueue.add(this._loadedStore); //sync store first
                        this.bindable.save(syncQueue);    //then bindables (so bindable grid is synced second)
                                                        //bindable forms can still update the row as the sync is not yet started
                        syncQueue.start({
                            success: function() {
                                this.fireViewEvent('savesuccess');
                            },
                            scope: this
                        });
                    } else {
                        this.bindable.save();
                        this.bindable.getLoadedRecord().save({
                            callback: function(records, operation, success) {
                                if (success) this.fireViewEvent('savesuccess');
                            },
                            scope: this
                        });
                    }
                } else {
                    this.bindable.save();
                }
                this.fireViewEvent('save');

            },
            scope: this
        });
    },

    onSaveClick: function()
    {
        this.doSave().then({
            success: function() {
                this.closeWindow();
            },
            scope: this
        });
    },

    onCancelClick: function()
    {
        if (this.bindable.isDirty()) {
            Ext4.Msg.show({
                title: trlKwf('Save'),
                msg: trlKwf('Do you want to save the changes?'),
                icon: Ext4.MessageBox.QUESTION,
                buttons: Ext4.Msg.YESNOCANCEL,
                fn: function(btn) {
                    if (btn == 'no') {
                        this.closeWindow();
                    } else if (btn == 'yes') {
                        this.doSave().then({
                            success: function() {
                                this.closeWindow();
                            },
                            scope: this
                        });
                    }
                },
                scope: this
            });
        } else {
            this.closeWindow();
        }
    },

    closeWindow: function()
    {
        this.view.hide();
        this.bindable.reset();
    },

    getLoadedRecord: function()
    {
        if (this.bindable) {
            return this.bindable.getLoadedRecord();
        } else {
            return null;
        }
    },

    onDeleteClick: function()
    {
        this.bindable.allowDelete().then({
            success: function() {
                if (this.autoSync) {
                    Ext4.Msg.show({
                        title: trlKwf('Delete'),
                        msg: this.deleteConfirmText,
                        buttons: Ext4.Msg.YESNO,
                        scope: this,
                        fn: function(button) {
                            if (button == 'yes') {
                                if (this._loadedStore) {
                                    this._loadedStore.remove(this.getLoadedRecord());
                                    this._loadedStore.sync();
                                } else {
                                    this.getLoadedRecord().destory();
                                }
                                this.closeWindow();
                            }
                        }
                    });
                } else {
                    if (!this._loadedStore) {
                        Ext4.Error.raise("Can't delete record without store");
                    }
                    this._loadedStore.remove(this.getLoadedRecord());
                    this.closeWindow();
                }
            },
            scope: this
        });
    }

});
