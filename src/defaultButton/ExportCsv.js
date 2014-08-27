Ext.define('Densa.defaultButton.ExportCsv', {
    extend: 'Ext.button.Button',
    defaultText: 'Export CSV',
    alias: 'widget.densa.defaultButton.exportCsv',
    constructor: function(config)
    {
        if (!config) config = {};
        if (!config.text) config.text = this.defaultText;
        if (!config.itemId) config.itemId = 'exportCsvButton';
        this.callParent([config]);
    }
});
