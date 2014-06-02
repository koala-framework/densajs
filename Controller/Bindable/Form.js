Ext4.define('Kwf.Ext4.Controller.Bindable.Form', {
    extend: 'Kwf.Ext4.Controller.Bindable.Abstract',

    formController: null,

    constructor: function()
    {
        this.callParent(arguments);

        if (this.updateOnChange) Ext4.Error.raise('updateOnChange config moved to Controller.Form');
        if (this.focusOnAddSelector) Ext4.Error.raise('updateOnChange config moved to Controller.Form');

        if (!this.formController) {
            if (!this.form) Ext4.Error.raise('form or formController config is required');
            this.formController = this.form.getController();
        }
        if (!this.formController) Ext4.Error.raise('formController config is required');
        if (!(this.formController instanceof Kwf.Ext4.ViewController.Form)) Ext4.Error.raise('formController config needs to be a Kwf.Ext4.ViewController.Form');
    },

    load: function(row, store)
    {
        this.formController.load(row, store);
    },

    reset: function()
    {
        this.formController.reset();
    },

    isDirty: function()
    {
        return this.formController.isDirty();
    },

    isValid: function()
    {
        return this.formController.isValid();
    },

    save: function(syncQueue)
    {
        return this.formController.save(syncQueue);
    },

    getLoadedRecord: function()
    {
        return this.formController.getLoadedRecord();
    },

    enable: function()
    {
        this.formController.enable();
    },
    disable: function()
    {
        this.formController.disable();
    },
    getPanel: function()
    {
        return this.formController.view;
    },

    onAdd: function()
    {
        this.formController.onAdd();
    }
});
