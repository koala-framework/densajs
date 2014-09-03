Ext.define('Densa.form.Panel', {
    extend: 'Ext.form.Panel',
    requires: [
        'Densa.form.PanelController'
    ],
    controller: 'Densa.form.PanelController',
    autoScroll: true,
    initComponent: function() {
        this.callParent(arguments);
    }
});
