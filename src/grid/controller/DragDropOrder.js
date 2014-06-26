Ext.define('Densa.grid.controller.DragDropOrder', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    autoSync: true,
    constructor: function(config) {
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

        var plugin = this.gridController.view.view.findPlugin('gridviewdragdrop');
        if (!plugin) Ext.Error.raise('Didn\'t find gridviewdragdrop plugin in grid view');
        this.gridController.view.view.on('drop', function(node, data, overRow, dropPosition, eOpts) {
            var pos = 1;
            this.gridController.view.getStore().each(function(i) {
                if (data.records[0] == i) {
                    //skip
                    return;
                }
                if (i == overRow) {
                    data.records[0].set('pos', null);
                    if (dropPosition == 'before') {
                        data.records[0].set('pos', pos);
                    } else {
                        data.records[0].set('pos', pos+1);
                    }
                }
                pos++;
            }, this);
            if (this.autoSync) {
                this.gridController.view.getStore().sync();
            }
        }, this);
    }
});
