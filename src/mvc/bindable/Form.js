Ext.define('Densa.mvc.bindable.Form', {
    extend: 'Densa.mvc.bindable.Abstract',

    formController: null,

    constructor: function()
    {
        this.callParent(arguments);

        if (this.updateOnChange) Ext.Error.raise('updateOnChange config moved to Controller.Form');
        if (this.focusOnAddSelector) Ext.Error.raise('updateOnChange config moved to Controller.Form');

        if (!this.formController) {
            if (!this.form) Ext.Error.raise('form or formController config is required');
            this.formController = this.form.getController();
        }
        if (!this.formController) Ext.Error.raise('formController config is required');
        if (!(this.formController instanceof Densa.form.PanelController)) Ext.Error.raise('formController config needs to be a Densa.form.PanelController');
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
    },

    allowSave: function()
    {
        return this.formController.allowSave();
    },

    allowDelete: function()
    {
        return this.formController.allowDelete();
    }
});
