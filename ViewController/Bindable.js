Ext4.define('Kwf.Ext4.ViewController.Bindable', {
    extend: 'Kwf.Ext4.ViewController.Abstract',

    mixins: {
        bindable: 'Kwf.Ext4.Controller.Bindable.Interface'
    },

    autoSync: true,
    deleteConfirmText: trlKwf('Do you really wish to remove this entry?'),

    _loadedStore: null,

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
        }

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
        if (this.getSaveButton) this.getSaveButton().disable();
        if (this.getDeleteButton) this.getDeleteButton().disable();
    },

    _onStoreWrite: function()
    {
    },

    //store is optional, used for sync
    load: function(row, store)
    {
        if (this.bindable) {
            if (this._loadedStore) this._loadedStore.un('write', this._onStoreWrite, this);
            this._loadedStore = store;
            if (this._loadedStore) this._loadedStore.on('write', this._onStoreWrite, this);
            if (this.getSaveButton) this.getSaveButton().enable();
            if (this.getDeleteButton) this.getDeleteButton().enable();
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
            if (this.getSaveButton) this.getSaveButton().disable();
            if (this.getDeleteButton) this.getDeleteButton().disable();
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
    },

    allowSave: function()
    {
        if (this.bindable) {
            return this.bindable.allowSave();
        } else {
            return this.mixins.bindable.allowSave.call(this);
        }
    },

    allowDelete: function()
    {
        if (this.bindable) {
            return this.bindable.allowDelete();
        } else {
            return this.mixins.bindable.allowDelete.call(this);
        }
    },

    onSaveClick: function()
    {
        var submitDeferred = new Deft.promise.Deferred;
        var ret = this.allowSave().then({
            success: function() {
                var syncQueue = new Kwf.Ext4.Data.StoreSyncQueue();
                if (this.autoSync) {
                    syncQueue.add(this._loadedStore); //sync store first
                }
                this.save(syncQueue);    //then bindables (so bindable grid is synced second)
                                         //bindable forms can still update the row as the sync is not yet started
                syncQueue.start({
                    success: function() {
                        submitDeferred.resolve();
                    },
                    failure: function() {
                        submitDeferred.reject();
                    }
                });
            },
            failure: function() {
                submitDeferred.reject();
            },
            scope: this
        });
        ret.submitPromise = submitDeferred.promise;
        return ret;
    },

    onDeleteClick: function()
    {
        var submitDeferred = new Deft.promise.Deferred;
        var ret = this.allowDelete().then({
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
                                    var syncQueue = new Kwf.Ext4.Data.StoreSyncQueue();
                                    syncQueue.add(this._loadedStore);
                                    syncQueue.start({
                                        success: function() {
                                            submitDeferred.resolve();
                                        },
                                        failure: function() {
                                            submitDeferred.reject();
                                        }
                                    });
                                } else {
                                    this.getLoadedRecord().destory({
                                        success: function() {
                                            submitDeferred.resolve();
                                        },
                                        failure: function() {
                                            submitDeferred.reject();
                                        }
                                    });
                                }
                            }
                        }
                    });
                } else {
                    if (this._loadedStore) {
                        this._loadedStore.remove(this.getLoadedRecord());
                    } else {
                        Ext4.Error.raise("Can't delete if autoSync is disabled and store was not provided");
                    }
                }
            },
            failure: function() {
                submitDeferred.reject();
            },
            scope: this
        });
        ret.submitPromise = submitDeferred.promise;
        return ret;
    }
});
