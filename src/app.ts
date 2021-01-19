import DefaultServer from "./server/Server";

require('dotenv').config()

const defaultServer = new DefaultServer();
defaultServer.start(3000);