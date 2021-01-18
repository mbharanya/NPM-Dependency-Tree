// import { IndexController } from '../../src/controller/IndexController'

// const indexController = new IndexController();

// test('Should call getMessage', () => {
//     indexController.getMessage({params: {message: 'foo'}}, {{}})
// })


import request from "supertest";
import DefaultServer from "../../src/server/Server";

const defaultServer = new DefaultServer();


describe("Test the root path", () => {
    test("It should respond to the GET method", async () => {
        const testMsg = "foo";
        const response = await request(defaultServer.app).get(`/api/${testMsg}`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe(testMsg)
    });
});
