Ext4.define('Densa.action.Delete', {
    extend: 'Ext.Action',
    constructor: function(config)
    {
        if (!config) config = {};
        if (!config.text) config.text = trlKwf('Delete');
        if (!config.itemId) config.itemId = 'delete';
        this.callParent([config]);
    }
});
