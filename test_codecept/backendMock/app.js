

const express = require('express');
var bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const minimist = require('minimist');
const fs = require('fs');
const axios = require('axios');
const http = axios.create({})
axios.defaults.headers.common['Content-Type'] = 'application/json'

const taskApi = require('./services/task-management-api/routes')
const workTypeRoutes = require('./services/task-management-api/workTypeRoutes')


const locationRoutes = require('./services/rdLocation/routes')
const caseworkerRoutes = require('./services/rdCaseworker/routes')
const judicialRoutes = require('./services/rdJudicial/routes')

const roleAssignmentRoutes = require('./services/roleAssignments/routes')
const bookingRoutes = require('./services/roleAssignments/bookingRoutes')
const ccdRoutes = require('./services/ccd/routes')
const ccdApi = require('./services/ccd/index')

const idamOpenId = require('./services/idam/routes')
const sessionRoutes = require('./services/session/routes')

const users = require('./services/users');

class MockApp {

    constructor() {
        this.logMessageCallback = null;
        this.logJSONCallback = null;
        this.routesLogFile = `${__dirname}/RUNTIME_ROUTES.txt`;
        this.uniqueRoutesCalled = new Set();
    }


    init(clientPortStart) {
      
    }


    logRequestDetails(req) {
        this.logMessage(`${req.method} : ${req.originalUrl}`);
        if (req.method === 'POST' || req.method === 'PUT') {
            this.logJSON(req.body);
        }
    }

    getCookieFromRequest(req, cookieName) {
        const cookie = req.cookies[cookieName];
        this.scenarios[cookie] = this.scenarios[cookie] ? this.scenarios[cookie] : "";
        return cookie;
    }

    async startServer() {

        const app = express();
        app.disable('etag');
        app.use(bodyParser.urlencoded({ extended: false }));

        app.use(bodyParser.json());
        app.use(cookieParser());
        app.use(express.json({ type: '*/*' })); 

        app.use((req,res,next) => {
            // console.log(`${req.method} : ${req.url}`);
            next();
        })

        app.use('/client', sessionRoutes)

        app.use('/', idamOpenId)
        app.use('/task', taskApi)
        app.use('/work-types', workTypeRoutes)
        app.use('/refdata/location', locationRoutes)
        app.use('/refdata/case-worker', caseworkerRoutes )
        app.use('/refdata/judicial', judicialRoutes )
        app.use('/am/role-assignments', roleAssignmentRoutes)
        app.use('/am/bookings', bookingRoutes)
        
        
        app.post('/searchCases', (req,res) => {
            const cases = ccdApi.getSearchCases(req,res)
            res.send(cases)
        })


        app.use('/', ccdRoutes )



        // await this.stopServer();
        this.server = await app.listen(8080);

        console.log("mock server started on port : " + this.serverPort);
        // return "Mock started successfully"

    }

    async stopServer() {
        if (this.server) {
            await this.server.close();
            this.server = null;
            console.log("Mock server stopped");

        } else {
            console.log("Mock server is null or undefined");
        }
    }


}


const mockInstance = new MockApp();
module.exports = mockInstance;

const args = minimist(process.argv)
if (args.standalone) {
    // mockInstance.setServerPort(8080);
    mockInstance.init();
    // nodeAppMock.userDetails = nodeAppMock.getMockLoginUserWithidentifierAndRoles("IAC_CaseOfficer_R2", "caseworker-ia,caseworker-ia-caseofficer,caseworker-ia-admofficer,task-supervisor,case-allocator");
    // bookingsMockData.bookingResponse = [];
    // setUpcaseConfig();
    // getDLCaseConfig();
    // collectionDynamicListeventConfig()
    // createCustomCaseDetails();
    mockInstance.startServer()
}
