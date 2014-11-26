Ext.define('Densa.overrides.HasMany', {
    override: 'Ext.data.association.HasMany',
    /**
     * Allow filters in storeConfig
     *
     * Original overrides filters with filter
     */
    createStore: function() {
        var that            = this,
            associatedModel = that.associatedModel,
            storeName       = that.storeName,
            foreignKey      = that.foreignKey,
            primaryKey      = that.primaryKey,
            filterProperty  = that.filterProperty,
            autoLoad        = that.autoLoad,
            storeConfig     = that.storeConfig || {};

        return function() {
            var me = this,
                config, filter,
                modelDefaults = {};

            if (me[storeName] === undefined) {
                if (filterProperty) {
                    filter = {
                        property  : filterProperty,
                        value     : me.get(filterProperty),
                        exactMatch: true
                    };
                } else {
                    filter = {
                        property  : foreignKey,
                        value     : me.get(primaryKey),
                        exactMatch: true
                    };
                }
                if (!storeConfig.filters) storeConfig.filters = [];
                storeConfig.filters.push(filter);

                modelDefaults[foreignKey] = me.get(primaryKey);

                config = Ext.apply({}, storeConfig, {
                    model        : associatedModel,
                    remoteFilter : false,
                    modelDefaults: modelDefaults,
                    disableMetaChangeEvent: true
                });

                me[storeName] = Ext.data.AbstractStore.create(config);
                if (autoLoad) {
                    me[storeName].load();
                }
            }

            return me[storeName];
        };
    }
});

