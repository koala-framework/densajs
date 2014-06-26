Ext.define('Densa.action.Save', {
    extend: 'Ext.Action',
    defaultText: 'Save',
    constructor: function(config)
    {
        if (!config) config = {};
        if (!config.text) config.text = this.defaultText;
        if (!config.itemId) config.itemId = 'save';
        this.callParent([config]);
    }
});
