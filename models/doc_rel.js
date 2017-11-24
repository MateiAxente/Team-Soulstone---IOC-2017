var connection = require('../connections/db-connect')

var Document = require('./document.js')
var User = require('./user.js')

var DocumentRel = connection.orm.Model.extend({
    tableName: 'doc_user_rel',
    user(){
        return this.belongsTo(User, 'uid')
    },
    activity_type(){
        return this.belongsTo(Document, 'doc_id')
    },
    fullInfo(){
        var ret = {}
        ret.uid = this.get("uid")
        ret.docid = this.get("doc_id")

        return ret
    }
})

module.exports = DocumentRel