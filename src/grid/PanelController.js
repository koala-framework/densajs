Ext.define('Densa.grid.PanelController', {
    extend: 'Densa.mvc.ViewController',
    uses: [ 'Ext.window.MessageBox' ],
    autoSync: true,
    autoLoad: false,
    deleteConfirmTitle: 'Delete',
    deleteConfirmText: 'Do you really wish to remove this entry?',
    exportProgressTitle: 'Export',
    exportProgressMsg: 'Exporting rows...',

    grid: null,

    _store: null,

    optionalControl: {

        exportCsv: {
            selector: 'button#exportCsvButton',
            listeners: {
                click: 'onCsvExport'
            }
        },

        deleteButton: {
            selector: 'button#deleteButton',
            listeners: {
                click: 'onDeleteClick'
            }
        }

    },

    init: function()
    {
        if (!this.view) Ext.Error.raise('view config is required');
        if (!(this.view instanceof Ext.grid.Panel)) Ext.Error.raise('view config needs to be a Ext.grid.Panel');
        var grid = this.view;

        if (this.getDeleteButton) this.getDeleteButton().disable();
        grid.on('selectionchange', function(model, rows) {
            if (rows[0]) {
                var row = rows[0];
                if (this.getDeleteButton) this.getDeleteButton().enable();
            } else {
                if (this.getDeleteButton) this.getDeleteButton().disable();
            }
        }, this);
        Ext.each(grid.query('> toolbar[dock=top] field'), function(field) {
            field.on('change', function() {
                var filterId = 'filter-'+field.getName();
                var v = field.getValue();
                var filter = this.view.getStore().filters.get(filterId);
                if (!filter || filter.value != v) {
                    this.view.getStore().addFilter({
                        id: filterId,
                        property: field.getName(),
                        value: v
                    });
                }
            }, this, { buffer: 300 });
        }, this);

        if (grid.getStore()) this.onBindStore();
        Ext.Function.interceptAfter(grid, "bindStore", this.onBindStore, this);

        if (this.autoLoad) {
            this.view.getStore().load();
        }

    },

    onDeleteClick: function(options)
    {
        if (this.autoSync) {
            Ext.Msg.show({
                title: this.deleteConfirmTitle,
                msg: this.deleteConfirmText,
                buttons: Ext.Msg.YESNO,
                scope: this,
                fn: function(button) {
                    if (button == 'yes') {
                        this.deleteSelected();
                        if (options.callback) options.callback.call(options.scope || this);
                    }
                }
            });
        } else {
            this.deleteSelected();
            if (options.callback) options.callback.call(options.scope || this);
        }
    },

    deleteSelected: function()
    {
        this.view.getStore().remove(this.view.getSelectionModel().getSelection());
        if (this.autoSync) {
            this.view.getStore().sync({
                success: function() {
                    this.fireViewEvent('savesuccess');
                },
                scope: this
            });
            this.fireViewEvent('save');
        }
    },

    onBindStore: function()
    {
        var s = this.view.getStore();
        this._store = s;
        Ext.each(this.view.query('pagingtoolbar'), function(i) {
            i.bindStore(s);
        }, this);
        Ext.each(this.view.query('> toolbar[dock=top] field'), function(field) {
            var filterId = 'filter-'+field.getName();
            var v = field.getValue();
            if (typeof v == 'undefined') v = null;
            this.view.getStore().addFilter({
                id: filterId,
                property: field.getName(),
                value: v
            }, false);
        }, this);

        this.fireViewEvent('bindstore', s);
    },

    onCsvExport: function()
    {
        var csv = '';

        //header
        var sep = '';
        Ext.each(this.view.columns, function(col) {
            if (!col.dataIndex) return;
            csv += sep+col.text;
            sep = ';';
        }, this);
        csv += '\n';


        var pageSize = 25;
        var totalCount = this._store.getTotalCount();
        var pageCount = Math.ceil(totalCount / pageSize);
        var page = 1;

        //create own store, so grid doesn't display loaded rows
        var store = this._store.self.create({
            model: this._store.model,
            filters: this._store.filters.items,
            sorters: this._store.sorters.items,
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
                Ext.each(this.view.columns, function(col) {
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
            var a = this.view.el.createChild({
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
