Ext4.define('Kwf.Ext4.ViewController.Grid', {
    extend: 'Kwf.Ext4.ViewController.Abstract',
    uses: [ 'Ext.window.MessageBox' ],
    autoSync: true,
    autoLoad: false,
    deleteConfirmText: trlKwf('Do you really wish to remove this entry?'),

    grid: null,

    _store: null,

    optionalControl: {

        exportCsv: {
            click: 'onCsvExport'
        },

        deleteButton: {
            selector: 'button#delete',
            listeners: {
                click: 'onDeleteClick'
            }
        }

    },

    init: function()
    {
        if (!this.view) Ext4.Error.raise('view config is required');
        if (!(this.view instanceof Ext4.grid.Panel)) Ext4.Error.raise('view config needs to be a Ext.grid.Panel');
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
        Ext4.each(grid.query('> toolbar[dock=top] field'), function(field) {
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
        Ext4.Function.interceptAfter(grid, "bindStore", this.onBindStore, this);

        if (this.autoLoad) {
            this.view.getStore().load();
        }

    },

    onDeleteClick: function(options)
    {
        if (this.autoSync) {
            Ext4.Msg.show({
                title: trlKwf('Delete'),
                msg: this.deleteConfirmText,
                buttons: Ext4.Msg.YESNO,
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
        Ext4.each(this.view.query('pagingtoolbar'), function(i) {
            i.bindStore(s);
        }, this);
        Ext4.each(this.view.query('> toolbar[dock=top] field'), function(field) {
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
        Ext4.each(this.view.columns, function(col) {
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

        Ext4.Msg.show({
            title: trlKwf('Export'),
            msg: trlKwf('Exporting rows...'),
            progress: true,
            buttons: Ext4.Msg.CANCEL
        });

        loadPage.call(this);

        function loadPage()
        {
            if (!Ext4.Msg.isVisible()) return; //export cancelled
            Ext4.Msg.updateProgress((page-1)/pageCount);
            store.loadPage(page, {
                callback: function() {
                    exportRows.call(this);
                    if (page < pageCount) {
                        page++;
                        loadPage.call(this);
                    } else {
                        Ext4.Msg.updateProgress(1);
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
                Ext4.each(this.view.columns, function(col) {
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
            Ext4.Msg.hide();
        }
    }
});
