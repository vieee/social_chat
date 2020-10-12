// add-on dependencies
const express = require("express")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const neo4j = require('neo4j-driver')

// node dependencies
const path = require("path")

// File requirements
const controller = require("./controllers/userController")
const DB_PASSWORD = require("./util/STORE").DB_PASSWORD


// setup the server
const app = express()

// set up database drivers
const driver = neo4j.driver("bolt://localhost:11013", neo4j.auth.basic("neo4j", DB_PASSWORD))
const session = driver.session()

// setup portions
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")

// middlewares
app.use(logger("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

// routes
// home route
app.get("/", (req, res, next) => {
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
})


// add person route
app.post("/person/add", (req, res, next) => {
    const name = req.body.name

    session.run(`CREATE (n:Person {name: $nameParameter}) RETURN n.name`, { nameParameter: name })
        .then(result => {
            res.redirect("/")
            // session.close()
        })
        .catch(err => console.log(err))
})

// add location route
app.post("/location/add", (req, res, next) => {
    const city = req.body.city
    const state = req.body.state

    session.run(`CREATE (n:Location {city: $cityParameter, state: $stateParameter}) RETURN n`, { cityParameter: city, stateParameter: state })
        .then(result => {
            res.redirect("/")
            // session.close()
        })
        .catch(err => console.log(err))
})

// add friends connection
app.post("/friends/connect", (req, res, next) => {
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
})

// add birthplace
app.post("/person/born/add", (req, res, next) => {
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
})

// person route
app.get(`/person/:personId`, (req, res, next) => {
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
})

// start our app
app.listen(3000)

console.log("Server started on port 3000")
module.exports = {
    app: app,
    session: session,
    driver: driver
}
