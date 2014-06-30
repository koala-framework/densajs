Ext.define('Densa.defaultButton.Save', {
    extend: 'Ext.button.Button',
    defaultText: 'Save',
    constructor: function(config)
    {
        if (!config) config = {};
        if (!config.text) config.text = this.defaultText;
        if (!config.itemId) config.itemId = 'saveButton';
        this.callParent([config]);
    }
});
