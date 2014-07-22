Ext.define('Densa.editWindow.Window', {
    extend: 'Ext.window.Window',
//     requires: [ 'Densa.editWindow.WindowController' ],
//     controller: 'Densa.editWindow.WindowController',
    layout: 'fit',
    border: false,
    modal: true,
    closeAction: 'hide',
    stateful: true,
    showSave: true,
    showDelete: false,
    constrainHeader: true,
    saveText: 'Save',
    deleteText: 'Delete',
    cancelText: 'Cancel',
    closeText: 'Close',
    padding: 10,
    initComponent: function() {
        this.bbar = [];
        if (this.showDelete) {
            this.bbar.push({
                text: this.deleteText,
                itemId: 'deleteButton',
                reference: 'deleteButton'
            });
        }
        this.bbar.push('->');
        if (this.showSave) {
            this.bbar.push({
                text: this.saveText,
                itemId: 'saveButton',
                reference: 'saveButton',
                listeners: {
                    click: 'onSaveClick'
                }
            });
        }
        this.bbar.push({
            text: this.showSave ? this.cancelText : this.closeText,
            itemId: 'cancelButton',
            reference: 'cancelButton',
                listeners: {
                    click: 'onCancelClick'
                }
        });
        this.callParent(arguments);
    }
});
