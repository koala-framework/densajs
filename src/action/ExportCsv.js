Ext4.define('Densa.action.ExportCsv', {
    extend: 'Ext.Action',
    defaultText: 'Export CSV',
    constructor: function(config)
    {
        if (!config) config = {};
        if (!config.text) config.text = this.defaultText;
        if (!config.itemId) config.itemId = 'exportCsv';
        this.callParent([config]);
    }
});
