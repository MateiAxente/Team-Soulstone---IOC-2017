
exports.up = function(knex, Promise) {
    return knex.schema.withSchema( process.env.DB_NAME ).createTable( 'users', function(table){
        table.increments('id')
        table.timestamps(true, true)
        table.string('username', 45)
        table.string('profile_picture', 100)
        table.text('description' )
        table.string('pass', 50)
    })  
};

exports.down = function(knex, Promise) {
    return knex.schema.withSchema( process.env.DB_NAME ).dropTable( 'users' )
};
