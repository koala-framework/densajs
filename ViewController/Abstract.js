Ext4.define('Kwf.Ext4.ViewController.Abstract', {
    extend: 'Deft.mvc.ViewController',
    optionalControl: null,
    onViewInitialize: function()
    {
        if (this.optionalControl) {
            this.control = Ext4.clone(this.control || {});
            for (var id in this.optionalControl) {
                if (typeof this.control[id] != 'undefined') continue;
                var config = this.optionalControl[id];
                var selector = null;
                if (id !== 'view') {
                    if (Ext4.isString(config)) {
                        selector = config;
                    } else if (config.selector != null) {
                        selector = config.selector;
                    } else {
                        selector = '#' + id;
                    }
                }
                if (this.getViewComponent(selector)) {
                    this.control[id] = config;
                }
            }
        }
        this.callParent(arguments);
    }
});
