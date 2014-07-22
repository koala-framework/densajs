Ext.define('Densa.form.PanelModel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.densa.form',
    /**
     * @property {Ext.data.Model} record
     */
    replaceSession: function(session)
    {
        console.log('replaceSession');

        var previousSession = this.getSession();

        this.setSession(session);

        if (this.get('record').session == previousSession) {
            var s = session.getParent();
            var r = this.get('record');
            if (r) {
                this.getView().setRecord(s.peekRecord(r.entityName, r.id));
            }
        }
    }
});
