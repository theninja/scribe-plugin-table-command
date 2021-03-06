/**
 * Scribe Table Command.
 * This command lets users insert and perform edit operations on a table.
 *
 * Behavior:
 * Create a 3x3 table by default.
 * Right click context menu to perform transformations on table.
 *
 * TODO Make number of rows/columns configurable.
 */

var TableContextMenu = require('./TableContextMenu');
var TableUtils = require('./TableUtils');

module.exports = function() {
  return function(scribe) {
    var tableCommand = new scribe.api.Command('insertTable');
    var contextMenu = new TableContextMenu(scribe);

    tableCommand.nodeName = 'TABLE';

    tableCommand.execute = function() {
      var tableElement = TableUtils.createTable(3, 3);

      scribe.transactionManager.run(function() {
        var selection = new scribe.api.Selection();

        var el = findBlockContainer(selection.range.endContainer);
        var nextElement = el.nextSibling;

        if (nextElement) {
          // TODO Fix this
          scribe.el.insertBefore(tableElement, nextElement);
        } else {
          scribe.el.appendChild(tableElement);
          scribe.el.appendChild(document.createElement('p'));
        }

        var body = tableElement.childNodes[0];
        var firstRow = body.childNodes[0];
        var firstCell = firstRow.childNodes[0];

        TableUtils.select(scribe, firstCell);
      });
    };

    tableCommand.queryState = function() {
      var selection = new scribe.api.Selection();
      return selection.getContaining(function(node) {
        return (node.nodeName === this.nodeName);
      }.bind(this));
    };

    tableCommand.queryEnabled = function() {
      return true;
    };

    /**
     * Find block container for the given element.
     * @param {HTMLElement} el
     */
    function findBlockContainer(el) {
      while (el && !scribe.element.isBlockElement(el)) {
        el = el.parentNode;
      }

      return el;
    }

    /**
     * Handle right click inside the scribe editor.
     */
    function handleRightClick(event) {
      var target = event.target || event.toElement;

      if (!target) {
        return;
      }

      var tableCell = TableUtils.findTableCell(scribe, target);
      var table = TableUtils.findTable(scribe, tableCell);

      if (table) {
        event.preventDefault();
        event.stopPropagation();
        contextMenu.show(table, tableCell);
      }
    }
    
    scribe.el.addEventListener('contextmenu', handleRightClick);

    scribe.commands.table = tableCommand;
  };
};