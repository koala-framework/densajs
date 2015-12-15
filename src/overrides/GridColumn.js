//Override to fix problem with random reorder of user-ordered grid columns
Ext4.define('Densa.overrides.GridColumn', {
    override: 'Ext.grid.column.Column',
    initComponent: function() {
        if (!this.stateId && this.dataIndex) {
            this.stateId = this.dataIndex;
        }
        return this.callParent(arguments);
    }
});
