Ext.define('Densa.defaultButton.ExportXls', {
    extend: 'Ext.button.Button',
    defaultText: 'Export XLS',
    alias: 'widget.densa.defaultButton.exportXls',
    constructor: function(config)
    {
        if (!config) config = {};
        if (!config.text) config.text = this.defaultText;
        if (!config.itemId) config.itemId = 'exportXlsButton';
        this.callParent([config]);
    }
});
