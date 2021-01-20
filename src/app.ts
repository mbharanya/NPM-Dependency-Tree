import DefaultServer from "./server/Server";

require('dotenv').config()

const defaultServer = new DefaultServer();
defaultServer.start(parseInt(process.env.EXPRESS_PORT || "3000"));