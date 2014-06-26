Ext4.define('Densa.action.Save', {
    extend: 'Ext.Action',
    constructor: function(config)
    {
        if (!config) config = {};
        if (!config.text) config.text = trlKwf('Save');
        if (!config.itemId) config.itemId = 'save';
        this.callParent([config]);
    }
});
