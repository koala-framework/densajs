/**
 * Based on ext4/examples/portal/
 *
 * A layout column class used internally be {@link Densa.portal.Panel}.
 */
Ext.define('Densa.portal.Column', {
    extend: 'Ext.container.Container',
    alias: 'widget.portalcolumn',

    requires: [
        'Ext.layout.container.Anchor',
        'Densa.portal.Portlet'
    ],

    layout: 'anchor',
    defaultType: 'portlet',
    cls: 'x-portal-column'

    // This is a class so that it could be easily extended
    // if necessary to provide additional behavior.
});
