
exports.up = function(knex, Promise) {
    return knex.schema.withSchema( process.env.DB_NAME ).createTable( 'documents', function(table){
        table.increments('id')
        table.timestamps(true, true)

        //foreign keys
        table.integer('uid').unsigned().index().references('id').inTable('users')
        
        table.string('title', 100)
        table.float('size')
        table.string('thumbnail', 100)
        table.text('description' )
        table.float('rating')
        table.string('path', 200)
        table.json('comments').nullable()
    })  
};

exports.down = function(knex, Promise) {
    return knex.schema.withSchema( process.env.DB_NAME ).dropTable( 'documents' )
};
