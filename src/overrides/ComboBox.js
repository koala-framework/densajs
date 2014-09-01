Ext.define('Densa.overrides.ComboBox', {
    override: 'Ext.form.field.ComboBox',
    showNoSelection: false,
    defaultEmptyText: 'no selection',

    initComponent: function()
    {
        if (this.showNoSelection && !this.emptyText) {
            this.emptyText = '('+this.defaultEmptyText+')';
        }
        this.callParent(arguments);
    },

    onBindStore: function(store, initial)
    {
        this.callParent(arguments);
        this._addNoSelection(store);
        store.on('load', this._addNoSelection, this);
    },

    onUnbindStore: function(store, initial)
    {
        this.callParent(arguments);
        store.un('load', this._addNoSelection, this);
    },

    _findNoSelectionEntry: function (record, id) {
        return record.emptyValue ? true : false;
    },

    _addNoSelection : function(store)
    {
        if (!store) store = this.getStore();
        if (this.showNoSelection && store.findBy(this._findNoSelectionEntry) == -1) {
            var row = new store.model();
            row.set(this.displayField, this.emptyText);
            row.emptyValue = true;
            store.insert(0, row);
        }
    },

    setValue: function(value, doSelect)
    {
        value = Ext.Array.from(value);
        for (i = 0; i < value.length; i++) {
            var record = value[i];
            if (record.isModel && record.emptyValue) {
                value.splice(i, 1);
                i--;
            }
        }
        arguments[0] = value;
        this.callParent(arguments);
    },

    /**
     * lastSelection is searched for records
     * (together with store's records which are searched in the parent call)
     *
     * http://stackoverflow.com/questions/14200701/extjs-combo-loses-selected-value-on-store-page-load
     */
    findRecord: function(field, value)
    {
        var foundRec = null;
        Ext.each(this.lastSelection, function(rec) {
            if (rec.get(field) === value) {
                foundRec = rec;
                return false; // stop 'each' loop
            }
        });
        if (foundRec) {
            return foundRec;
        } else {
            return this.callParent(arguments);
        }
    }
});
