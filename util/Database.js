const neo4j = require('neo4j-driver')
const DB_PASSWORD = require("./STORE").DB_PASSWORD

// set up database drivers
const driver = neo4j.driver("bolt://localhost:11021", neo4j.auth.basic("neo4j", DB_PASSWORD))
const session = driver.session()

module.exports = {
    driver: driver,
    session: session
}