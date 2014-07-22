Ext.define('Densa.overrides.Component', {
    override: 'Ext.Component',
    discardSession: function()
    {
        var previousSession = this.getSession();
        if (!previousSession) Ext.Error.raise("Can't discardSession as there is none");
        if (!previousSession.getParent()) Ext.Error.raise("Can't discardSession as the session has no parent");

        var newSession = previousSession.getParent().spawn();
        this.setSession(newSession);

        if (this.getViewModel()) {
            if (this.getViewModel().replaceSession) {
                this.getViewModel().replaceSession(newSession);
            } else {
                this.getViewModel().setSession(newSession);
            }
        }
        Ext.each(this.query('[viewModel]'), function(i) {
            if (i.getViewModel().getSession() == previousSession) {
                if (i.getViewModel().replaceSession) {
                    i.getViewModel().replaceSession(newSession);
                } else {
                    i.getViewModel().setSession(newSession);
                }
            }
        }, this);

        previousSession.destroy();
    }
});
