Ext.define('Densa.form.Panel', {
    extend: 'Ext.form.Panel',
    requires: [
        'Densa.form.PanelController'
    ],
    viewModel: {
        type: 'densa.form'
    },
    controller: 'densa.form',

    modelValidation: true,
    defaultBindProperty: 'record',

    autoScroll: true,
    initComponent: function() {
        this.callParent(arguments);
    },

    setRecord: function(record)
    {
        if (record) {
            if (record.session !== this.lookupSession()) {
                console.log('linkTo', record);
                this.getViewModel().linkTo('record', record);
            } else {
                console.log('set', record);
                this.getViewModel().set('record', record);
            }
        } else {
            console.log('set', record);
            this.getViewModel().set('record', null);
        }
    },
    getRecord: function()
    {
        return this.getViewModel().get('record');
    }
});
