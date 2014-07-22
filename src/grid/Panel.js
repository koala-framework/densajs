Ext.define('Densa.grid.Panel', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Densa.grid.PanelController'
    ],
    controller: 'densa.grid',
    initComponent: function() {
        this.callParent(arguments);
    }
});
