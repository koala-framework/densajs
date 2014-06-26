Ext4.define('Densa.action.Add', {
    extend: 'Ext.Action',
    defaultText: 'Add',
    constructor: function(config)
    {
        if (!config) config = {};
        if (!config.text) config.text = this.defaultText;
        if (!config.itemId) config.itemId = 'add';
        this.callParent([config]);
    }
});
