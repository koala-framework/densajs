Ext4.define('Kwf.Ext4.ViewController.EditWindow', {
    extend: 'Kwf.Ext4.ViewController.Abstract',
    uses: [ 'Kwf.Ext4.Data.StoreSyncQueue' ],

    focusOnEditSelector: 'field',
    bindable: null,
    autoSync: false,

    optionalControl: {

        saveButton: {
            selector: '> toolbar > button#save',
            listeners: {
                click: 'onSave'
            }
        },

        deleteButton: {
            selector: '> toolbar > button#delete'
        },

        cancelButton: {
            selector: '> toolbar > button#cancel',
            listeners: {
                click: 'onCancel'
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
            this.onCancel();
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
        this.bindable.load(row);
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
        if (!this.bindable.isValid()) {
            Ext4.Msg.alert(trlKwf('Save'),
                trlKwf("Can't save, please fill all red underlined fields correctly."));
            return false;
        }

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

        return true;
    },

    onSave: function()
    {
        if (this.doSave() !== false) {
            this.closeWindow();
        }
    },

    onCancel: function()
    {
        if (this.bindable.isDirty()) {
            Ext4.Msg.show({
                title: trl('Speichern'),
                msg: trl('Wollen Sie die Änderungen speichern?'),
                icon: Ext4.MessageBox.QUESTION,
                buttons: Ext4.Msg.YESNOCANCEL,
                fn: function(btn) {
                    if (btn == 'no') {
                        this.closeWindow();
                    } else if (btn == 'yes') {
                        if (this.doSave() !== false) {
                            this.closeWindow();
                        }
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
        this.bindable.reset();
        this.view.hide();
    },

    getLoadedRecord: function()
    {
        if (this.bindable) {
            return this.bindable.getLoadedRecord();
        } else {
            return null;
        }
    }

});
