

exports.up = function(knex, Promise) {
    return knex.schema.table('documents', function(table){
        table.string('type', 100)
    })  
};

exports.down = function(knex, Promise) {
    return knex.schema.table('documents', function(table){
        table.dropColumn('type')
    })
};