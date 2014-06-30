Ext.define('Densa.defaultButton.Add', {
    extend: 'Ext.button.Button',
    defaultText: 'Add',
    constructor: function(config)
    {
        if (!config) config = {};
        if (!config.text) config.text = this.defaultText;
        if (!config.itemId) config.itemId = 'addButton';
        this.callParent([config]);
    }
});
