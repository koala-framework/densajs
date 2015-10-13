Ext.define('Densa.overrides.AbstractStore', {
    override: 'Ext.data.AbstractStore',

    /**
     * load does not copy filters for lastOptions but references the same object,
     * this is a problem if comparing last request with current filters
     */
    load: function (options) {
        this.callParent(arguments);
        this.lastOptions.filters = Ext.Array.clone(this.filters.items);
    },
});
