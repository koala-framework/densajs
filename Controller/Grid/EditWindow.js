Ext4.define('Kwf.Ext4.Controller.Grid.EditWindow', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    uses: [ 'Kwf.Ext4.ViewController.EditWindow' ],

    gridController: null,
    editWindowController: null,

    constructor: function(config) {
        this.mixins.observable.constructor.call(this, config);
        this.init();
    },

    init: function()
    {
        if (this.windowSaveButton) Ext4.Error.raise('windowSaveButton config doesn\'t exist anymore');
        if (this.windowDeleteButton) Ext4.Error.raise('windowDeleteButton config doesn\'t exist anymore');
        if (this.windowCancelButton) Ext4.Error.raise('windowCancelButton config doesn\'t exist anymore');
        if (this.form) Ext4.Error.raise('form config doesn\'t exist anymore');
        if (this.bindable) Ext4.Error.raise('bindable config doesn\'t exist anymore');

        if (!this.gridController) {
            if (!this.grid) Ext4.Error.raise('grid or gridController config is required');
            if (!(this.grid instanceof Ext4.grid.Panel)) Ext4.Error.raise('grid config needs to be a Ext4.grid.Panel');
            this.gridController = this.grid.getController();
        }
        if (!this.gridController) Ext4.Error.raise('gridController config is required');
        if (!(this.gridController instanceof Kwf.Ext4.ViewController.Grid)) Ext4.Error.raise('gridController config needs to be a Kwf.Ext4.ViewController.Grid');

        if (!this.editWindowController) {
            if (!this.editWindow) Ext4.Error.raise('editWindow or editWindowController config is required');
            if (!(this.editWindow instanceof Ext4.window.Window)) Ext4.Error.raise('editWindow config needs to be a Ext4.window.Window');
            this.editWindowController = this.editWindow.getController();
        }
        if (!this.editWindowController) Ext4.Error.raise('editWindowController config is required');
        if (!(this.editWindowController instanceof Kwf.Ext4.ViewController.EditWindow)) Ext4.Error.raise('editWindowController config needs to be a Kwf.Ext4.ViewController.EditWindow');

        if (!this.addButton) this.addButton = this.gridController.view.down('button#add');
        if (this.addButton && !(this.addButton instanceof Ext4.button.Button)) Ext4.Error.raise('addButton config needs to be a Ext.button.Button');

        if (!this.editActionColumn) this.editActionColumn = this.gridController.view.down('actioncolumn#edit')
        if (this.editActionColumn && !(this.editActionColumn instanceof Ext4.grid.column.Column)) Ext4.Error.raise('editActionColumn config needs to be a Ext.grid.column.Column');

        this.gridController.view.on('celldblclick', function(grid, td, cellIndex, row, tr, rowIndex, e) {
            this.openEditWindow(row);
        }, this);

        if (this.editActionColumn) {
            this.editActionColumn.on('click', function(view, cell, rowIndex, colIndex, e) {
                this.openEditWindow(this.gridController.view.store.getAt(rowIndex));
            }, this);
        }
        if (this.addButton) {
            this.addButton.on('click', function() {
                var row = this.gridController.view.getStore().model.create();
                this.fireEvent('add', row);
                this.openEditWindow(row);
            }, this);
        }
    },
    openEditWindow: function(row)
    {
        this.editWindowController.openEditWindow(row, this.gridController.view.store);
    }
});
