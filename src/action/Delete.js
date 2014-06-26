Ext.define('Densa.action.Delete', {
    extend: 'Ext.Action',
    defaultText: 'Delete',
    constructor: function(config)
    {
        if (!config) config = {};
        if (!config.text) config.text = this.defaultText;
        if (!config.itemId) config.itemId = 'delete';
        this.callParent([config]);
    }
});
