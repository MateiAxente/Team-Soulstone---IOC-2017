
exports.up = function(knex, Promise) {
    return knex.schema.withSchema( process.env.DB_NAME ).createTable( 'chats', function(table){
        table.increments('id')
        table.timestamps(true, true)

        //foreign keys
        table.integer('uid1').unsigned().index().references('id').inTable('users')
        table.integer('uid2').unsigned().index().references('id').inTable('users')
        
        table.json('messages').nullable()
    })  
};

exports.down = function(knex, Promise) {
    return knex.schema.withSchema( process.env.DB_NAME ).dropTable( 'chats' )
};
