const prettyjson = require('prettyjson');
const _ = require('lodash');

module.exports = {
    command: ['details:complexity <tag>', 
  'returns a formatted report on a submissions complexity / quality'],
    action: function(args, callback){
        this.db.each(`SELECT * FROM applicants WHERE tag='${args.tag}'`, (err, row) => {
            let report = _.pick(JSON.parse(row.complexity), ['methodAverage', 'maintainability']);
            console.log(prettyjson.render(report));
            return callback();
        });
    } 
};
