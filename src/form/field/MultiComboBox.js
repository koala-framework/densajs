Ext4.define('Densa.form.field.MultiComboBox', {
    extend: 'Ext.form.field.ComboBox',
    alias: 'widget.densa.form.field.multiComboBox',
    initComponent: function() {
        this.pageSize = 0;
        this.multiSelect = true;

        this.callParent(arguments);

        this.getStore().pageSize = 0;
    }
});
