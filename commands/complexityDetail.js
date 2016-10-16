const prettyjson = require('prettyjson');
const _ = require('lodash');

module.exports = {
    command: ['details:complexity <tag>', 
  'returns a formatted report on a submissions complexity / quality'],
    action: function(args, callback){
        this.db.each(`SELECT * FROM applicants WHERE tag=$tag`, {$tag: args.tag}, (err, row) => {
            if(err) console.log(err);
            let report = _.chain(JSON.parse(row.complexity))
              .pick(['methodAggregate', 'methodAverage', 'maintainability'])
              .value();
            delete report.methodAggregate.halstead.operands;
            delete report.methodAggregate.halstead.operators;
            console.log(prettyjson.render(report));
            return callback();
        });
    } 
};
