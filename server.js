// add-on dependencies
const express = require("express")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")

// node dependencies
const path = require("path")

// File requirements
const userController = require("./controllers/userController")
const friendController = require("./controllers/friendController")
const driver = require("./util/Database").driver
const session = require("./util/Database").session


// setup the server
const app = express()


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
app.get("/", userController.homeGetter)

// add person route
app.post("/person/add", userController.personAdder)

// add location route
app.post("/location/add", userController.locationAdder)

// add friends connection
app.post("/friends/connect", friendController.friendConnector)

// add birthplace
app.post("/person/born/add", userController.birthplaceAdder)

// person route
app.get(`/person/:personId`, friendController.personalPager)

// start our app
app.listen(3000)

console.log("Server started on port 3000")
module.exports = {
    app: app,
    session: session,
    driver: driver
}
