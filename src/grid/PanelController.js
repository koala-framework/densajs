// @require ModernizrADownload
// @require excel-builder

Ext.define('Densa.grid.PanelController', {
    extend: 'Densa.mvc.ViewController',
    uses: [ 'Ext.window.MessageBox' ],
    autoSync: true,
    autoLoad: false,
    deleteConfirmTitle: 'Delete',
    deleteConfirmText: 'Do you really wish to remove this entry?',
    exportProgressTitle: 'Export',
    exportProgressMsg: 'Exporting rows...',
    excelExportWorksheetName: 'Worksheet',
    postBackUrl: null,

    grid: null,
    bindable: null,

    _store: null,

    optionalControl: {

        exportCsv: {
            selector: 'button#exportCsvButton',
            listeners: {
                click: 'onCsvExport'
            }
        },

        exportXls: {
            selector: 'button#exportXlsButton',
            listeners: {
                click: 'onXlsExport'
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
            var eventName = 'change';
            if (Ext.form.field.ComboBox && field instanceof Ext.form.field.ComboBox && field.editable === true && field.forceSelection === true) {
                eventName = 'select';
            }

            field.on(eventName, function() {
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
                icon: Ext.MessageBox.QUESTION,
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
                    this.fireEvent('savesuccess');
                },
                scope: this
            });
        }
        this.fireViewEvent('save');
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

    onXlsExport: function()
    {
        this._exportData({
            map: function(row) {
                var excelRow = [];
                Ext4.each(this.view.columns, function(col) {
                    if (!col.dataIndex) return;
                    var val = row.get(col.dataIndex);
                    if (col.renderer) {
                        val = Ext4.util.Format.stripTags(col.renderer(val, col, row));
                    }
                    if (!val) val = '';
                    excelRow.push(val);
                }, this);
                return excelRow;
            },
            reduce: function(data, outputType){
                var workbook = ExcelBuilder.createWorkbook();
                var worksheet = workbook.createWorksheet({name: this.excelExportWorksheetName});
                workbook.addWorksheet(worksheet);

                var columnNames = [];
                Ext.each(this.view.columns, function(col) {
                    if (!col.dataIndex) return;
                    columnNames.push(col.text);
                }, this);
                data.unshift(columnNames);

                worksheet.setData(data);

                return ExcelBuilder.createFile(workbook, {type: outputType});
            },
            filename: 'export.xlsx',
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            uploadType: 'base64'
        });
    },

    onCsvExport: function()
    {
        this._exportData({
            map: function(row) {
                var sep = '';
                var csvRow = '';
                Ext.each(this.view.columns, function(col) {
                    if (!col.dataIndex) return;
                    var val = row.get(col.dataIndex);
                    if (col.renderer) {
                        val = Ext.util.Format.stripTags(col.renderer(val, col, row));
                    }
                    if (!val) val = '';
                    csvRow += sep;
                    csvRow += String(val).replace('\\', '\\\\').replace(';', '\;').replace('\n', '\\n');
                    sep = ';';
                }, this);
                return csvRow;
            },
            reduce: function(data, outputType) {
                var csv = '';
                //header
                var sep = '';
                Ext.each(this.view.columns, function(col) {
                    if (!col.dataIndex) return;
                    csv += sep+col.text;
                    sep = ';';
                }, this);
                csv += '\n';
                csv += data.join('\n');
                if (outputType == 'blob') {
                    return new Blob([csv]);
                } else if (outputType == 'string') {
                    return csv;
                }
            },
            filename: 'export.csv',
            mimeType: 'text/csv',
            uploadType: 'string'
        });
    },

    _exportData: function(config)
    {
        //create own store, so grid doesn't display loaded rows
        var store = this._store.self.create({
            model: this._store.model,
            filters: this._store.filters.items,
            sorters: this._store.sorters.items,
            pageSize: 250
        });

        var totalCount = this._store.getTotalCount();
        var pageCount = Math.ceil(totalCount / store.pageSize);
        var page = 1;

        Ext.Msg.show({
            title: this.exportProgressTitle,
            msg: this.exportProgressMsg,
            progress: true,
            buttons: Ext.Msg.CANCEL
        });

        loadPage.call(this);
        var data = [];

        function loadPage()
        {
            if (!Ext.Msg.isVisible()) return; //export cancelled
            Ext.Msg.updateProgress((page-1)/pageCount);
            store.loadPage(page, {
                callback: function() {
                    store.each(function(row) {
                        data.push(config.map.call(this, row));
                    }, this);
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

        function createDownload()
        {
            var URL = window.URL || window.webkiURL;
            if (window.Modernizr && Modernizr.adownload && URL && window.Blob) {
                //modern browser
                var blob = config.reduce.call(this, data, 'blob');
                var blobURL = URL.createObjectURL(blob);
                var a = this.view.el.createChild({
                    tag: 'a',
                    href: blobURL,
                    style: 'display:none;',
                    download: config.filename
                });
                a.dom.click();
                a.remove();
                Ext.Msg.hide();
            } else {
                //IE, Safari
                Ext.Ajax.request({
                    // Needs to be added to url because else it gets lost because of using rawData for data
                    // It's also not possible to use param instead of rawData because extraParams gets attached to data
                    url: this.postBackUrl+'?'+Ext.urlEncode(Ext.Ajax.extraParams)+'&upload-type='+config.uploadType,
                    rawData: config.reduce.call(this, data, config.uploadType),
                    headers: {
                        'Content-Type': config.mimeType,
                        'X-Download-Filename': config.filename
                    },
                    success: function(response, options) {
                        if (!Ext.Msg.isVisible()) return; //export cancelled
                        var r = Ext.decode(response.responseText);
                        var a = this.view.el.createChild({
                            tag: 'a',
                            href: r.downloadUrl,
                            style: 'display:none;'
                        });
                        a.dom.click();
                        a.remove();
                        Ext.Msg.hide();
                    },
                    failure: function() {
                        Ext.Msg.hide();
                    },
                    scope: this
                });
            }
        }
    }
});
