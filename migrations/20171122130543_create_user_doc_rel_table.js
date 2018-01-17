
exports.up = function(knex, Promise) {
    return knex.schema.withSchema( process.env.DB_NAME ).createTable( 'doc_user_rel', function(table){
        table.increments('id')
        table.timestamps(true, true)

        //foreign keys
        table.integer('uid').unsigned().index().references('id').inTable('users')
        table.integer('doc_id').unsigned().index().references('id').inTable('documents')
    })  
};

exports.down = function(knex, Promise) {
    return knex.schema.withSchema( process.env.DB_NAME ).dropTable( 'doc_user_rel' )
};
