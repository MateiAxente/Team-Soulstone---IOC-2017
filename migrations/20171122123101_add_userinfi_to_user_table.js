

exports.up = function(knex, Promise) {
    return knex.schema.table('users', function(table){
        table.string('faculty', 100)
        table.string('spec', 100)
        table.string('group', 100)
    })  
};

exports.down = function(knex, Promise) {
    return knex.schema.table('users', function(table){
        table.dropColumn('faculty')
        table.dropColumn('spec')
        table.dropColumn('group')
    })
};