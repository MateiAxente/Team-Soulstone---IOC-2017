var connection = require('../connections/db-connect')

var User = require('./user.js')
var Chat = require('./chat.js')
var DocumentRel = require('./doc_rel.js')

var Document = connection.orm.Model.extend({
    tableName: 'documents',
    user(){
        return this.belongsTo(User, 'uid')
    },
    fullInfo(){
        var ret = {}
        ret.uid = this.get("uid")
        ret.title = this.get("title")
        ret.size = this.get("size")
        ret.thumbnail = this.get("thumbnail")
        ret.description = this.get("description")
        ret.comments = this.get("comments")
        ret.rating = this.get("rating")
        ret.source = this.get("path")

        return ret
    }
})

module.exports = Document