Ext.define('Densa.mvc.ViewController', {
    extend: 'Deft.mvc.ViewController',
    optionalControl: null,

    mixins: {
        observable: 'Ext.util.Observable'
    },

    constructor: function(config) {
        this.callParent(arguments);
        this.mixins.observable.constructor.call(this, config);
    },
    onViewInitialize: function()
    {
        if (this.optionalControl) {
            this.control = Ext.clone(this.control || {});
            for (var id in this.optionalControl) {
                if (typeof this.control[id] != 'undefined') continue;
                var config = this.optionalControl[id];
                var selector = null;
                if (id !== 'view') {
                    if (Ext.isString(config)) {
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
    },

    /**
     * Fires an event on the view. See {@link Ext.Component#fireEvent}.
     * @param {String} eventName The name of the event to fire.
     * @param {Object...} args Variable number of parameters are passed to handlers.
     * @return {Boolean} returns false if any of the handlers return false otherwise it returns true.
     * @protected
     */
    fireViewEvent: function(eventName) {
        var view = this.view,
            result = false;

        if (view) {
            result = view.fireEvent.apply(view, arguments);
        }
        return result;
    }
});
