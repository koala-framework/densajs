Ext.define('Densa.mvc.bindable.GridBinding', {
    extend: 'Densa.mvc.bindable.Grid',

    bindableToGridController: null,
    panel: null,

    init: function()
    {
        if (!this.bindableToGridController) Ext.Error.raise('bindableToGridController config is required');
        if (!(this.bindableToGridController instanceof Densa.grid.controller.Bind)) Ext.Error.raise('bindableToGridController config needs to be a Densa.grid.controller.Bind');
        if (this.panel && !(this.panel instanceof Ext.panel.Panel)) Ext.Error.raise('panel config needs to be a Ext.panel.Panel');
        if (!this.grid) this.grid = this.bindableToGridController.gridController.view;

        this.callParent(arguments);
        this.bindableToGridController.bindable.on('savesuccess', this._reloadGrid, this);
        this.bindableToGridController.bindable.on('savesuccess', function() {
            this.fireEvent('savesuccess');
        }, this);
    },

    reset: function()
    {
        this.callParent(arguments);
        this.bindableToGridController.reset();
    },

    isDirty: function()
    {
        if (this.callParent(arguments)) {
            return true;
        }
        return this.bindableToGridController.isDirty();
    },

    isValid: function()
    {
        return this.bindableToGridController.isValid() && this.callParent(arguments);
    },

    save: function(syncQueue)
    {
        this.bindableToGridController.save(syncQueue);
    },

    enable: function()
    {
        if (this.panel) this.panel.enable();
        this.bindableToGridController.gridController.view.enable();
    },
    disable: function()
    {
        if (this.panel) this.panel.disable();
        this.bindableToGridController.gridController.view.disable();
    },
    getPanel: function()
    {
        return this.panel;
    }
});
