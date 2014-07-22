Ext.define('Densa.defaultButton.SaveController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.densa.defaultButton.save',
    requires: [
        'Deft.promise.Deferred'
    ],
    config: {
        control: {
//             '#': {
//                 click: 'onClick'
//             }
        }
    },
    init: function()
    {
        this.getView().on('click', this.onClick, this);
        this.callParent(arguments);
    },
    onClick: function()
    {
        var promise = Deft.promise.Deferred.resolve();

        var parentSessionView = this.getView().findParentBy(function(i) { return i.getSession(); });
        Ext.each(parentSessionView.query('[controller]'), function(i) {
            if (i.getController().isSaveable) {
                promise = promise.then({
                    success: function() {
                        return i.getController().allowSave();
                    },
                    scope: this
                });
            }
        }, this);

        promise = promise.then({
            success: function() {
                var s = this.getView().lookupSession();
                if (s.getParent()) {
                    this.getView().lookupSession().save();
                    parentSessionView.discardSession();
                }
                var batch = s.getSaveBatch();
                if (batch) {
                    batch.start();
                }
            },
            scope: this
        });
    }
});
