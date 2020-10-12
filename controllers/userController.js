// database requirements
const driver = require("../util/Database").driver
const session = require("../util/Database").session


// home route
exports.homeGetter = (req, res, next) => {
    session.run('MATCH (n:Person) RETURN n')
        .then(resultPersons => {
            // console.log("record yaha hai..!")
            let personArray = []
            // console.log(resultPersons)
            resultPersons.records.forEach(record => {
                // console.log('record: ', record._fields[0])
                personArray.push({
                    id: record._fields[0].identity.low,
                    name: record._fields[0].properties.name
                })
            })

            session.run(`MATCH (n:Location) RETURN n`)
                .then(resultLocations => {
                    let locationArray = []

                    resultLocations.records.forEach(record => {
                        // console.log('record: ', record._fields[0])
                        locationArray.push(record._fields[0].properties)
                    })
                    res.render("index", {
                        persons: personArray,
                        locations: locationArray
                    })
                })

            // console.log(personArray) It works!

        })
        .catch(err => {
            console.log(err)
        })
}

// add person route
exports.personAdder = (req, res, next) => {
    const name = req.body.name

    session.run(`CREATE (n:Person {name: $nameParameter}) RETURN n.name`, { nameParameter: name })
        .then(result => {
            res.redirect("/")
            // session.close()
        })
        .catch(err => console.log(err))
}

// add location route
exports.locationAdder = (req, res, next) => {
    const city = req.body.city
    const state = req.body.state

    session.run(`CREATE (n:Location {city: $cityParameter, state: $stateParameter}) RETURN n`, { cityParameter: city, stateParameter: state })
        .then(result => {
            res.redirect("/")
            // session.close()
        })
        .catch(err => console.log(err))
}


// add birthplace route
exports.birthplaceAdder = (req, res, next) => {
    const name = req.body.name
    const location = req.body.location
    const year = req.body.year
    const id = req.body.id

    session.run(`MATCH (a:Person {name: $nameParameter}), (b:Location {city: $locationParameter}) MERGE (a)-[r:BORN_IN {year: $yearParameter}]->(b) RETURN a, b`, { nameParameter: name, locationParameter: location, yearParameter: year })
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
