Ext.define('Densa.viewController.Saveable', {
    mixinId: 'densa.saveable',
    requires: [
        'Deft.promise.Deferred'
    ],
    isSaveable: true,
    allowSave: function() {
        return Deft.promise.Deferred.resolve();
    },
    allowDelete: function() {
        return Deft.promise.Deferred.resolve();
    },
    isDirty: function() {
        return false;
    }
});
