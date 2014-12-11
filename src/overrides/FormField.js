//Override to fix: Form updateRecord should not modify the value shown by display fields
//Fixed in Ext5
Ext4.define('Densa.overrides.FormField', {
    override: 'Ext.form.field.Field',
    getModelData: function() {
        if (!this.submitValue) return {};
        return this.callParent(arguments);
    }
});
