Ext4.define('Kwf.Ext4.Overrides.MultiSelect', {
    override: 'Ext.ux.form.MultiSelect',

    setValue: function(value){
        var me = this,
            selModel = me.boundList.getSelectionModel(),
            store = me.store;

//BEGIN OVERRIDE: this code moved up (to fix resetOriginalValue call before store is loaded)
        value = me.setupValue(value);
        me.mixins.field.setValue.call(me, value);
//END OVERRIDE: this code moved up

        // Store not loaded yet - we cannot set the value
        if (!store.getCount()) {
            store.on({
                load: Ext4.Function.bind(me.setValue, me, [value]),
                single: true
            });
            return;
        }

        if (me.rendered) {
            ++me.ignoreSelectChange;
            selModel.deselectAll();
            selModel.select(me.getRecordsForValue(value));
            --me.ignoreSelectChange;
        } else {
            me.selectOnRender = true;
        }
    }
});
