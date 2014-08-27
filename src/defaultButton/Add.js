Ext.define('Densa.defaultButton.Add', {
    extend: 'Ext.button.Button',
    defaultText: 'Add',
    alias: 'widget.densa.defaultButton.add',
    constructor: function(config)
    {
        if (!config) config = {};
        if (!config.text) config.text = this.defaultText;
        if (!config.itemId) config.itemId = 'addButton';
        this.callParent([config]);
    }
});
