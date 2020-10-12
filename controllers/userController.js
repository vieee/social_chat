// database requirements
const driver = require("../server").driver
const session = require("../server").session

exports.homeGetter = (req, res, next) => {
    session.run('MATCH (n) RETURN n')
        .then(result => {
            result.records.forEach(record => {
                console.log('record: ', record._fields[0])
            })
        })
        .catch(err => {
            console.log(err)
        })
    res.render("index")
}