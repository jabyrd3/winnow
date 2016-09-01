var _ = require('lodash');
// utils
var calcColumns = function(rows) {
    var widths = [],
        widthMatrix = _.chain(rows).map((keys, val) => {
            return _.map(keys, (innerval, innerkey) => {
                return innerval.length;
            });
        }).value();
    for (var i = 0; i < widthMatrix[0].length; i++) {
        widthMatrix.forEach(row => {
            // console.log(row);
            if ((widths[i] && widths[i] < row[i]) || !widths[i]) {
                widths[i] = row[i];
            }
        });
    }
    // console.log(widths);
    return widths;
};
// ctrl
var renderVTable = function(collection) {
    // debug
    if (!collection) {
        var collection = [{ tag: 'self', passed: 'never', failed: 'never' },
            { tag: 'jbyrd', passed: 'never', failed: 'adsfasdfasdfasdf' },
            { tag: 'jbyrd', passed: 'never', failed: 'adsfasdfasdfasdf' },
            { tag: 'jbyr123123d', passed: 'never', failed: 'adsfasdfasdfasdf' },
        ];
    }
    var headers = Object.keys(collection[0]);
    var rows = [headers];
    console.log('rows', rows);
    collection.forEach((item) => {
        rows.push(_.map(item, (val, key) => {
            return val;
        }));
    });
    console.log('rows', rows);
    var columnWidths = calcColumns(rows);
    var barWidth = _.sum(columnWidths) + (2 * columnWidths.length) + columnWidths.length + 1;
    var middlebit = '';
    columnWidths.forEach((item, index) => {
        if (index !== columnWidths.length - 1) {
            middlebit += `${'─'.repeat(item + 2)}┬`;
        } else {
            middlebit += '─'.repeat(item + 2);
        }
    });
    var bar = '┌' + middlebit + '┐';
    console.log(bar);
    // iterate rows, including the header
    rows.forEach((item, index) => {
        var row = '';
        // iterarte fields in rows.
        item.forEach((inner, innrdx) => {
            // first and last get thik lines
            if (innrdx === 0 || innrdx === columnWidths.length - 1) {
                var sc = '│';
            } else {
                var sc = '│';
            }
            var totalWidth = columnWidths[innrdx] + 2;
            var padding = Math.floor((totalWidth - inner.length) / 2);
            if (innrdx === 0) {
                row += sc;
            } else {
                row += '│';
            }
            if (columnWidths[innrdx] % 2 !== inner.length % 2) {
                row += ' ';
            }
            row += ' '.repeat(padding) + inner + ' '.repeat(padding);
            // console.log('jab', inner.length, columnWidths[index]);
            // if (inner.length % 2) {
            //     row += ' ';
            // }
            if (innrdx === columnWidths.length - 1) {
                row += sc;
            }
        });
        console.log(row);
        // header separator
        if (index === 0) {
            var midBar = '├';
            columnWidths.forEach((item, index) => {
                midBar += '─'.repeat(item + 2);
                if (index !== columnWidths.length - 1) {
                    midBar += '┼';
                } else {
                    midBar += '┤';
                }
            });
            // console.log(`┠${'─'.repeat(barWidth-2)}┨`);
            console.log(midBar);
        }
        // enclose after last row
        // console.log(index, columnWidths.length - 2);
        if (index === rows.length - 1) {
            var bottomBar = '└';
            columnWidths.forEach((item, index) => {

                bottomBar += '─'.repeat(item + 2);
                if (index !== columnWidths.length - 1) {
                    bottomBar += '┴';
                } else {
                    bottomBar += '┘';
                }
            });
            console.log(bottomBar);
        }
    });

};
// renderVTable();
module.exports = renderVTable;
