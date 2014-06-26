Ext.define('Densa.tip.Message', {
    requires: ['Ext.tip.Tip'],
    singleton: true,
    showMessage: function(msg)
    {
        var tip = Ext.create('Ext.tip.Tip', {
            renderTo: Ext.getBody(),
            html: msg
        });
        tip.showBy(Ext.getBody(), 't', [0, 10]);
        (function() {
            tip.el.fadeOut({
                callback: function() {
                    tip.destroy();
                }
            });
        }).defer(2000);
    }
});
