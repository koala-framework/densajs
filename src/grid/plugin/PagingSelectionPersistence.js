/**
 * Grid PagingSelectionPersistence plugin
 *
 * Maintains row selection state when moving between pages of a paginated grid
 *
 * Public Methods:
 * getPersistedSelection() - retrieve the array of selected records across all pages
 * clearPersistedSelection() - deselect records across all pages
 *
 *
 * @class   Ext.ux.grid.plugin.PagingSelectionPersistence
 * @extends Ext.AbstractPlugin
 * @author  Bill Dami
 * @date    December 20th, 2011
 *
 * Url: https://www.sencha.com/forum/showthread.php?263871-Selection-of-records-over-multiple-pages-in-a-grid-Select-All
 */
Ext.define('Densa.grid.plugin.PagingSelectionPersistence', {
    alias: 'plugin.pagingselectpersist',
    extend: 'Ext.AbstractPlugin',
    pluginId: 'pagingSelectionPersistence',

    //array of selected records
    selection: [],
    //hash map of record id to selected state
    selected: {},

    init: function(grid) {
        this.grid = grid;
        this.selModel = this.grid.getSelectionModel();
        this.isCheckboxModel = (this.selModel.$className == 'Ext.selection.CheckboxModel');
        this.origOnHeaderClick = this.selModel.onHeaderClick;
        this.bindListeners();
    },

    destroy: function() {
        this.selection = [];
        this.selected = {};
        this.disable();
    },

    enable: function() {
        var me = this;

        if (this.disabled && this.grid) {
            this.grid.getView().on('refresh', this.onViewRefresh, this);
            this.selModel.on('select', this.onRowSelect, this);
            this.selModel.on('deselect', this.onRowDeselect, this);

            if (this.isCheckboxModel) {
                //For CheckboxModel, we need to detect when the header deselect/select page checkbox
                //is clicked, to make sure the plugin's selection array is updated. This is because Ext.selection.CheckboxModel
                //interally supresses event firings for selectAll/deselectAll when its clicked
                this.selModel.onHeaderClick = function(headerCt, header, e) {
                    var isChecked = header.el.hasCls(Ext.baseCSSPrefix + 'grid-hd-checker-on');
                    me.origOnHeaderClick.apply(this, arguments);

                    if (isChecked) {
                        me.onDeselectPage();
                    } else {
                        me.onSelectPage();
                    }
                };
            }
        }

        this.callParent();
    },

    disable: function() {
        if (this.grid) {
            this.grid.getView().un('refresh', this.onViewRefresh, this);
            this.selModel.un('select', this.onRowSelect, this);
            this.selModel.un('deselect', this.onRowDeselect, this);
            this.selModel.onHeaderClick = this.origOnHeaderClick;
        }

        this.callParent();
    },

    bindListeners: function() {
        var disabled = this.disabled;

        this.disable();

        if (!disabled) {
            this.enable();
        }
    },

    onViewRefresh : function(view, eOpts) {
        var store = this.grid.getStore(),
            sel = [],
            hdSelectState,
            rec,
            i;
        this.ignoreChanges = true;

        for (i = store.getCount() - 1; i >= 0; i--) {
            rec = store.getAt(i);

            if (this.selected[rec.getId()]) {
                sel.push(rec);
            }
        }

        this.selModel.select(sel, false);

        if (this.isCheckboxModel) {
            //For CheckboxModel, make sure the header checkbox is correctly
            //checked/unchecked when the view is refreshed depending on the
            //selection state of the rows on that page (workaround for possible bug in Ext 4.0.7?)
            hdSelectState = (this.selModel.selected.getCount() === this.grid.getStore().getCount());
            this.selModel.toggleUiHeader(hdSelectState);
        }

        this.ignoreChanges = false;
    },

    onRowSelect: function(sm, rec, idx, eOpts) {
        if (this.ignoreChanges === true) {
            return;
        }

        if (!this.selected[rec.getId()])
        {
            this.selection.push(rec);
            this.selected[rec.getId()] = true;
        }
    },

    onRowDeselect: function(sm, rec, idx, eOpts) {
        var i;

        if (this.ignoreChanges === true) {
            return;
        }

        if (this.selected[rec.getId()])
        {
            for (i = this.selection.length - 1; i >= 0; i--) {
                if (this.selection[i].getId() == rec.getId()) {
                    this.selection.splice(i, 1);
                    this.selected[rec.getId()] = false;
                    break;
                }
            }
        }
    },

    onSelectPage: function() {
        var sel = this.selModel.getSelection(),
            len = this.getPersistedSelection().length,
            i;

        for (i = 0; i < sel.length; i++) {
            alert(i + sel[i]);
            this.onRowSelect(this.selModel, sel[i]);
        }

        if (len !== this.getPersistedSelection().length) {
            this.selModel.fireEvent('selectionchange', this.selModel, [], {});
        }
    },

    onDeselectPage: function() {
        var store = this.grid.getStore(),
            len = this.getPersistedSelection().length,
            i;

        for (i = store.getCount() - 1; i >= 0; i--) {
            this.onRowDeselect(this.selModel, store.getAt(i));
        }

        if (len !== this.getPersistedSelection().length) {
            this.selModel.fireEvent('selectionchange', this.selModel, [], {});
        }
    },

    getPersistedSelection: function() {
        return [].concat(this.selection);
    },

    // private
    onSelectionClear: function() {
        if (! this.ignoreSelectionChanges) {
            // selection cleared by user
            // also called internally when the selection replaces the old selection
            this.selection = [];
            this.selected = {};
        }
    }, // end onSelectionClear

    clearPersistedSelection: function() {
        var changed = (this.selection.length > 0);

        this.selection = [];
        this.selected = {};
        this.onViewRefresh();

        if (changed) {
            this.selModel.fireEvent('selectionchange', this.selModel, [], {});
        }
    },


    /**
     * Selects all the rows in the grid, including those on other page
     * Be very careful using this on very large datasets
     */
    selectAll: function() {
        var storeB = this.grid.getStore();
        storeB.suspendEvents();
        //alert(storeB.getTotalCount());

        storeB.load({
            params: {start: 0, limit: storeB.getTotalCount() },
            callback: function(records, operation, success) {
                if (records.length > 0){ // Issue is here: Records returns as NULL
                    //alert('Num Records: ' + records.length);

                    for (var i = records.length - 1; i >= 0; i--) {
                        if (!this.selected[records[i].getId()])
                        {
                            this.selection.push(records[i]);
                            this.selected[records[i].getId()] = true;
                        }
                    };

                    storeB.resumeEvents();
                    this.onViewRefresh();

                    /*
                     this.selection = storeB.data.items.slice(0);
                     this.selected = {};
                     for (var i = this.selection.length - 1; i >= 0; i--) {
                     this.selected[this.selection[i].id] = true;
                     };*/
                }
                else
                {
                    alert('Error no tiene records');
                }
            },
            scope: this
        });


        if (!this.selected[rec.getId()])
        {
            this.selection.push(rec);
            this.selected[rec.getId()] = true;
        }

    },

    countAll: function() {
        var storeA = this.grid.getStore();
        alert('store count '+ storeA.getCount());
        alert('store count '+ storeA.getTotalCount());
    }

});