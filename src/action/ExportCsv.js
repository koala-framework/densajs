Ext4.define('Densa.action.ExportCsv', {
    extend: 'Ext.Action',
    constructor: function(config)
    {
        if (!config) config = {};
        if (!config.text) config.text = trlKwf('Export CSV');
        if (!config.itemId) config.itemId = 'exportCsv';
        this.callParent([config]);
    }
});
