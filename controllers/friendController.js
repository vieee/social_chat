// database requirements
const driver = require("../util/Database").driver
const session = require("../util/Database").session



// add friends connection
exports.friendConnector = (req, res, next) => {
    const name1 = req.body.name1
    const name2 = req.body.name2
    const id = req.body.id;

    session.run(`MATCH (a:Person {name: $nameParameter1}), (b:Person {name: $nameParameter2}) MERGE (a)-[r:FRIENDS]->(b) RETURN a, b`, { nameParameter1: name1, nameParameter2: name2 })
        .then(result => {
            if (id && id != null) {
                res.redirect('/person/' + id);
            } else {
                res.redirect('/');
            }
            // session.close()
        })
        .catch(err => console.log(err))
}

// person route
exports.personalPager = (req, res, next) => {
    const personID = req.params.personId

    session.run("MATCH (a:Person) WHERE id(a)=toInteger($personID) RETURN a.name AS name", { personID: personID })
        .then(resultName => {
            console.log(resultName)
            const name = resultName.records[0].get("name")

            session.run("OPTIONAL MATCH (a:Person)-[r:BORN_IN]->(b:Location) WHERE id(a) = toInteger($personID) RETURN b.city AS city, b.state AS state", { personID: personID })
                .then(resultLocations => {
                    const city = resultLocations.records[0].get("city")
                    const state = resultLocations.records[0].get("state")

                    session.run("OPTIONAL MATCH (a:Person)-[r:FRIENDS]-(b:Person) WHERE id(a) = toInteger($personID) RETURN b", { personID: personID })
                        .then(resultFriends => {
                            let friendsArray = []

                            resultFriends.records.forEach(record => {
                                if (record._fields[0] != null) {
                                    friendsArray.push({
                                        id: record._fields[0].identity.low,
                                        name: record._fields[0].properties.name
                                    })
                                }
                            })
                            res.render("person", {
                                id: personID,
                                name: name,
                                city: city,
                                state: state,
                                friends: friendsArray
                            })
                        })
                        .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
} 