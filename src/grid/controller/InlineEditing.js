Ext.define('Densa.grid.controller.InlineEditing', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    indexOfEditColumn: 0,

    constructor: function(config) {
        if (config.indexOfEditColumn) {
            this.indexOfEditColumn = config.indexOfEditColumn;
        }
        this.mixins.observable.constructor.call(this, config);
        this.init();
    },

    init: function()
    {
        if (!this.gridController) {
            if (!this.grid) Ext.Error.raise('grid or gridController config is required');
            if (!(this.grid instanceof Ext.grid.Panel)) Ext.Error.raise('grid config needs to be a Ext.grid.Panel');
            this.gridController = this.grid.getController();
        }
        if (!this.gridController) Ext.Error.raise('gridController config is required');
        if (!(this.gridController instanceof Densa.grid.PanelController)) Ext.Error.raise('gridController config needs to be a Densa.grid.PanelController');

        var grid = this.gridController.view;
        if (typeof this.gridAddButton == 'undefined') this.gridAddButton = grid.down('button#addButton');
        if (this.gridAddButton && !(this.gridAddButton instanceof Ext.button.Button)) Ext.Error.raise('gridAddButton config needs to be a Ext.button.Button');
        if (typeof this.gridSaveButton == 'undefined') this.gridSaveButton = grid.down('button#saveButton');
        if (this.gridSaveButton && !(this.gridSaveButton instanceof Ext.button.Button)) Ext.Error.raise('gridSaveButton config needs to be a Ext.button.Button');

        if (this.gridAddButton) {
            this.gridAddButton.on('click', function() {
                var s = grid.getStore();
                var row = s.model.create();
                s.add(row);
                this.fireEvent('add', row);
                grid.getSelectionModel().select(row);
                grid.getPlugin('cellediting').startEdit(row, this.indexOfEditColumn);
            }, this);
        }

        if (this.gridSaveButton) {
            this.gridSaveButton.on('click', function() {
                var s = grid.getStore();
                s.sync();
            }, this);
        }
    }
});
