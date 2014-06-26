Ext4.define('Densa.action.Add', {
    extend: 'Ext.Action',
    constructor: function(config)
    {
        if (!config) config = {};
        if (!config.text) config.text = trlKwf('Add');
        if (!config.itemId) config.itemId = 'add';
        this.callParent([config]);
    }
});
