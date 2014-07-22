Ext.define('Densa.grid.PanelController', {
    extend: 'Ext.app.ViewController',
    uses: [ 'Ext.window.MessageBox' ],
    alias: 'controller.densa.grid',

    autoSync: true,
    deleteConfirmTitle: 'Delete',
    deleteConfirmText: 'Do you really wish to remove this entry?',
    exportProgressTitle: 'Export',
    exportProgressMsg: 'Exporting rows...',
    saveChangesTitle: 'Save',
    saveChangesMsg: 'Do you want to save the changes?',


    config: {
        control: {
            '#deleteButton': {
                click: 'onDeleteClick'
            },
            '#addButton': {
                click: 'onAddClick'
            },
            '#exportCsvButton': {
                click: 'onCsvExportClick'
            }
        }
    },

    init: function()
    {
        var grid = this.getView();

        if (grid.down('#deleteButton')) {
            grid.down('#deleteButton').disable();
            grid.down('#deleteButton').setBind({
                disabled: '{!'+this.getView().getReference()+'.selection}'
            });
        }

        Ext.each(grid.query('> toolbar[dock=top] field'), function(field) {
            field.on('change', function() {
                var filterId = 'filter-'+field.getName();
                var v = field.getValue();
                var filter = this.getView().getStore().filters.get(filterId);
                if (!filter || filter.value != v) {
                    this.getView().getStore().addFilter({
                        id: filterId,
                        property: field.getName(),
                        value: v,
                        exatchMatch: v == '' ? true : false
                    });
                }
            }, this, { buffer: 300 });
        }, this);

        if (grid.getStore()) this.onBindStore();
        Ext.Function.interceptAfter(grid, "bindStore", this.onBindStore, this);

        grid.on('beforeselect', function(sm, record) {
            console.log(sm.getSelection());
            var parentSessionView = this.getView().findParentBy(function(i){return i.getSession()});
            if (parentSessionView) {
                var selection = this.getView().getSelection();
                var isDirty = selection.length && selection[0].phantom;
                Ext.each(parentSessionView.query("[session]"), function(i) {
                    if (i.getSession().getChangesForParent()) {
                        isDirty = true;
                    }
                }, this);
                Ext.each(parentSessionView.query("[controller]"), function(i) {
                    //additionally a controller can be dirty
                    if (i.getController().isSaveable && i.getController().isDirty()) {
                        isDirty = true;
                    }
                }, this);
                if (isDirty) {
                    this.askSaveChanges().then({
                        success: function() {
                            console.log('success!');
                            this.getView().setSelection(record);
                        },
                        failure: function() {
                            console.log('failure!');

                            this.getView().setSelection(sm.getSelection()); //set to previous selection
                        },
                        scope: this
                    });
                    return false;
                }
            }

//             var isDirty = false;
//             var sessionView = this.getView().findParentBy(function(i){return i.getSession()});
//             Ext.each(sessionView.query("[session]"), function(i) {
//                 if (i.getSession().getChanges()) {
//                     isDirty = true;
//                 }
//             }, this);
//             if (isDirty) {
//                 this.askSaveChanges().then({
//                     success: function() {
//                         this.getView().setSelection(record);
//                     },
//                     failure: function() {
//                         this.getView().setSelection(bindable.getLoadedRecord()); //TODO
//                     },
//                     scope: this
//                 });
//                 return false;
//             }
        }, this);

    },

    askSaveChanges: function()
    {
        var deferred = new Deft.promise.Deferred;
        Ext.Msg.show({
            title: this.saveChangesTitle,
            msg: this.saveChangesMsg,
            buttons: Ext.Msg.YESNOCANCEL,
            scope: this,
            fn: function(button) {
                if (button == 'yes') {
                    this.doSave().then({
                        success: function() {

                            deferred.resolve();
                        },
                        failure: function() {
                            //validation failed re-select
                            deferred.reject();
                        },
                        scope: this
                    });
                } else if (button == 'no') {
                    //discard changes
                    var sessionView = this.getView().findParentBy(function(i){return i.getSession()});
                    Ext.each(sessionView.query("[session]"), function(i) {
                        if (i.getSession().getChanges()) {
                            i.discardSession();
                        }
                    }, this);
                    var selection = this.getView().getSelection();
                    if (selection.length && selection[0].phantom) {
                        this.getView().suspendEvents();
                        this.getView().setSelection([]);
                        this.getView().resumeEvents();
                        console.log('DROOOP');
                        selection[0].drop();
                    }
                    deferred.resolve();
                } else if (button == 'cancel') {
                    deferred.reject();
                }
            }
        });
        return deferred.promise;
    },

    doSave: function()
    {
        var promise = Deft.promise.Deferred.resolve();

        var parentSessionView = this.getView().findParentBy(function(i) { return i.getSession(); });
        Ext.each(parentSessionView.query('[controller]'), function(i) {
            if (i.getController().isSaveable) {
                promise = promise.then({
                    success: function() { return i.getController().allowSave(); },
                    scope: this
                });
            }
        }, this);

        promise = promise.then({
            success: function() {
                Ext.each(parentSessionView.query('[session]'), function(i) {
                    var s = i.getSession();
                    if (s != this.getSession()) {
                        console.log('save session');
                        s.save();
                        i.discardSession();
                    }
                }, this);
                var batch = this.getSession().getSaveBatch();
                console.log('got saveBatch', batch);
                if (batch) {
                    batch.start();
                }
            },
            scope: this
        });

        return promise;
    },
/*
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
*/
    onAddClick: function()
    {
        var s = this.getView().getStore();
        var record = this.getView().lookupSession().createRecord(s.model);
        s.add(record);
        this.getView().setSelection(record);
    },

    onDeleteClick: function()
    {
        if (this.autoSync) {
            Ext.Msg.show({
                title: this.deleteConfirmTitle,
                msg: this.deleteConfirmText,
                icon: Ext.MessageBox.QUESTION,
                buttons: Ext.Msg.YESNO,
                scope: this,
                fn: function(button) {
                    if (button == 'yes') {
                        this.deleteSelected();
                    }
                }
            });
        } else {
            this.deleteSelected();
        }
    },
    deleteSelected: function()
    {
        Ext.each(this.getView().getSelection(), function(i) {
            i.drop();
        }, this);
        if (this.autoSync) {
            var batch = this.getView().lookupSession().getSaveBatch();
            if (batch) batch.start();
        }
        this.fireViewEvent('save');
    },

    onBindStore: function(store)
    {
        var s = this.getView().getStore();
        Ext.each(this.getView().query('pagingtoolbar'), function(i) {
            i.bindStore(s);
        }, this);
        Ext.each(this.getView().query('> toolbar[dock=top] field'), function(field) {
            var filterId = 'filter-'+field.getName();
            var v = field.getValue();
            if (typeof v == 'undefined') v = null;
            this.getView().getStore().addFilter({
                id: filterId,
                property: field.getName(),
                value: v
            }, false);
        }, this);
    },

    onCsvExportClick: function()
    {
        var csv = '';

        //header
        var sep = '';
        Ext.each(this.getView().columns, function(col) {
            if (!col.dataIndex) return;
            csv += sep+col.text;
            sep = ';';
        }, this);
        csv += '\n';


        var store = this.getView().getStore();

        var pageSize = 25;
        var totalCount = store.getTotalCount();
        var pageCount = Math.ceil(totalCount / pageSize);
        var page = 1;

        //create own store, so grid doesn't display loaded rows
        var store = store.self.create({
            model: store.model,
            filters: store.filters.items,
            sorters: store.sorters.items,
            pageSize: pageSize
        });

        Ext.Msg.show({
            title: this.exportProgressTitle,
            msg: this.exportProgressMsg,
            progress: true,
            buttons: Ext.Msg.CANCEL
        });

        loadPage.call(this);

        function loadPage()
        {
            if (!Ext.Msg.isVisible()) return; //export cancelled
            Ext.Msg.updateProgress((page-1)/pageCount);
            store.loadPage(page, {
                callback: function() {
                    exportRows.call(this);
                    if (page < pageCount) {
                        page++;
                        loadPage.call(this);
                    } else {
                        Ext.Msg.updateProgress(1);
                        createDownload.call(this);
                    }
                },
                scope: this
            });
        }

        function exportRows()
        {
            store.each(function(row) {
                var sep = '';
                Ext.each(this.getView().columns, function(col) {
                    if (!col.dataIndex) return;
                    var val = row.get(col.dataIndex);
                    if (col.renderer) {
                        val = Ext.util.Format.stripTags(col.renderer(val, col, row));
                    }
                    if (!val) val = '';
                    csv += sep;
                    csv += String(val).replace('\\', '\\\\').replace(';', '\;').replace('\n', '\\n');
                    sep = ';';
                }, this);
                csv += '\n';
            }, this);
        }

        function createDownload()
        {
            //TODO IE8 compatibility
            var URL = window.URL || window.webkiURL;
            var blob = new Blob([csv]);
            var blobURL = URL.createObjectURL(blob);
            var a = this.getView().el.createChild({
                tag: 'a',
                href: blobURL,
                style: 'display:none;',
                download: 'export.csv'
            });
            a.dom.click();
            a.remove();
            Ext.Msg.hide();
        }
    }
});
