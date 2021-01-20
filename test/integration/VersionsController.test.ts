import request from "supertest";
import DefaultServer from "../../src/server/Server";
import { Fixtures } from "../Fixtures";

Fixtures.setup()

const defaultServer = new DefaultServer();

test("It should return a list of versions for a valid package", async () => {
    const packageName = "express";
    const response = await request(defaultServer.app).get(`/api/version/${packageName}`);
    expect(response.status).toBe(200);
    expect(response.body.versions).toContainEqual("0.14.0")
});

test("It should return a 404 for an invalid package", async () => {
    const packageName = "this-is-not-a-valid-package";
    const response = await request(defaultServer.app).get(`/api/version/${packageName}`);
    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
});

test("It should return an error for an invalid package name", async () => {
    const packageName = " .for-sure not valid";
    const response = await request(defaultServer.app).get(`/api/version/${packageName}`);
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
    expect(response.body.error).toContain("package name cannot start with a dot nor underscore");
});