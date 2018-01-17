var connection = require('../connections/db-connect')

var User = require('./user.js')

var Chat = connection.orm.Model.extend({
    tableName: 'chats',
    first_user(){
        return this.belongsTo(User, 'uid1')
    },
    second_user(){
        return this.belongsTo(User, 'uid2')
    },
    fullInfo(){
        var ret = {}
        ret.messages = this.get("messages")

        return ret
    }
})

module.exports = Chat