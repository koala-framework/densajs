/**
 * Hovering over first grid row produces an error with ExtJS 4.2.1.883
 *
 * http://www.sencha.com/forum/showthread.php?273651-Hovering-over-first-grid-row-produces-an-error-with-ExtJS-4.2.1.883
 *
 * Fixed in 4.2.2
 */
Ext.define('Densa.overrides.Table', {
    override: 'Ext.view.Table',
    setHighlightedItem: function(item) {
        var me = this,
            highlighted = me.highlightedItem;

        if (highlighted && me.el.isAncestor(highlighted) && me.isRowStyleFirst(highlighted)) {
            me.toggleRowTableCls(highlighted, me.tableOverFirstCls, false);
        }

        item = me.getNode(item, false); // make sure item is not a "data row"

        if (item && me.isRowStyleFirst(item)) {
            me.toggleRowTableCls(item, me.tableOverFirstCls, true);
        }
    },

    onRowSelect: function(rowIdx) {
        var me = this,
            beforeSelectedItemCls = me.beforeSelectedItemCls;

        me.addRowCls(rowIdx, me.selectedItemCls);
        if (me.isRowStyleFirst(rowIdx)) {
            me.toggleRowTableCls(rowIdx, me.tableSelectedFirstCls, true);
            if (rowIdx > 0) {
                me.removeRowCls(rowIdx - 1, beforeSelectedItemCls);
            }
        } else {
            me.addRowCls(rowIdx - 1, beforeSelectedItemCls);
        }
    },

    onRowFocus: function(rowIdx, highlight, supressFocus) {
        var me = this;

        if (highlight) {
            me.addRowCls(rowIdx, me.focusedItemCls);
            if (me.isRowStyleFirst(rowIdx)) {
                me.toggleRowTableCls(rowIdx, me.tableFocusedFirstCls, true);
            } else {
                me.addRowCls(rowIdx - 1, me.beforeFocusedItemCls);
            }
            if (!supressFocus) {
                me.focusRow(rowIdx);
            }
            //this.el.dom.setAttribute('aria-activedescendant', row.id);
        } else {
            me.removeRowCls(rowIdx, me.focusedItemCls);
            if (me.isRowStyleFirst(rowIdx)) {
                me.toggleRowTableCls(rowIdx, me.tableFocusedFirstCls, false);
            } else {
                me.removeRowCls(rowIdx - 1, me.beforeFocusedItemCls);
            }
        }

        if ((Ext.isIE6 || Ext.isIE7) && !me.ownerCt.rowLines) {
            me.repaintRow(rowIdx)
        }
    },

    onRowDeselect: function(rowIdx) {
        var me = this;

        me.removeRowCls(rowIdx, [me.selectedItemCls, me.focusedItemCls]);
        if (me.isRowStyleFirst(rowIdx)) {
            me.toggleRowTableCls(rowIdx, [me.tableFocusedFirstCls, me.tableSelectedFirstCls], false);
        } else {
            me.removeRowCls(rowIdx - 1, [me.beforeFocusedItemCls, me.beforeSelectedItemCls]);
        }
    },

    toggleRowTableCls: function(item /* view item or row index */, cls, enabled) {
        var me = this,
            table, root;

        if (!item.tagName) {
            item = this.getNode(item);
        }

        root = me.isGrouping ? Ext.fly(item) : this.el;

        if (root) {
            table = root.down('table.' + Ext.baseCSSPrefix + 'grid-table');
        }

        if (table) {
            table[enabled ? 'addCls' : 'removeCls'](cls);
        }
    }
});

