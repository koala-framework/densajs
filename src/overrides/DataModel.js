Ext4.define('Densa.overrides.DataModel', {
    override: 'Ext.data.Model',

    //when creating record with uuid idGenerator we can set the internalId to the id
    //which it will get after saving
    //fixes de-selected row in grid after insert in bound form
    constructor: function(data, id, raw, convertedData) {
        this.callParent(arguments);
        if (this.phantom && this.getId()) {
            this.internalId = this.getId();
        }
    }
});
