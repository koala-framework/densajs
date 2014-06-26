Ext4.define('Densa.grid.Panel', {
    extend: 'Ext.grid.Panel',
    requires: [
        'Densa.grid.PanelController'
    ],
    controller: 'Densa.grid.PanelController',
    initComponent: function() {
        this.callParent(arguments);
    }
});
