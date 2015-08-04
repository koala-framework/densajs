// Is necessary for class loader
Ext.define('Densa.form.field.vtypes.DateRange', {
    requires: [
        'Ext.form.field.VTypes'
    ]
});
/**
 * vtypes will be ignored if allowBlank is true and value is null
 * validation for this can be activated with "validateBlank: true" setting
 */
Ext.apply(Ext.form.field.VTypes, {
    daterange: function(val, field) {
        var start, end;
        var date = field.parseDate(val);

        if (!date) {
            if (field.startDateField) {
                start = field.up('form').down('#' + field.startDateField);
                start.setMaxValue(null);
            } else if (field.endDateField) {
                end = field.up('form').down('#' + field.endDateField);
                end.setMinValue(null);
            }
            return field.allowBlank;
        }
        if (field.startDateField && (!this.dateRangeMax || (date.getTime() != this.dateRangeMax.getTime()))) {
            start = field.up('form').down('#' + field.startDateField);
            start.setMaxValue(date);
            start.validate();
            this.dateRangeMax = date;
        }
        else if (field.endDateField && (!this.dateRangeMin || (date.getTime() != this.dateRangeMin.getTime()))) {
            end = field.up('form').down('#' + field.endDateField);
            end.setMinValue(date);
            end.validate();
            this.dateRangeMin = date;
        }
        /*
         * Always return true since we're only using this vtype to set the
         * min/max allowed values (these are tested for after the vtype test)
         */
        return true;
    }
});

