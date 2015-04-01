Ext.define('Densa.editWindow.Window', {
    extend: 'Ext.window.Window',
    requires: [ 'Densa.editWindow.WindowController' ],
    controller: 'Densa.editWindow.WindowController',
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
    bbar: [],
    initComponent: function() {
        if (this.showDelete) {
            this.bbar.push({
                text: this.deleteText,
                itemId: 'deleteButton'
            });
        }
        this.bbar.push('->');
        if (this.showSave) {
            this.bbar.push({
                text: this.saveText,
                itemId: 'saveButton'
            });
        }
        this.bbar.push({
            text: this.showSave ? this.cancelText : this.closeText,
            itemId: 'cancelButton'
        });
        this.callParent(arguments);
    }
});
