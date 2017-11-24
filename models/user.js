var connection = require('../connections/db-connect')

var Chat = require('./chat.js')
var DocumentsRel = require('./doc_rel.js')

var User = connection.orm.Model.extend({
    tableName: 'users',
    documents(){
        return this.hasMany(DocumentRel, 'uid')
    },
    chats(){
        return this.hasMany(Chat, 'uid')
    },
    fullInfo(){
        var ret = {}
        ret.name = this.get("name")
        ret.email = this.get("email")
        ret.username = this.get("username")
        ret.description = this.get("description")
        ret.profile_picture = this.get("profile_picture")
        ret.faculty = this.get("faculty")
        ret.spec = this.get("spec")
        ret.group = this.get("group")

        return ret
    }
})

module.exports = User