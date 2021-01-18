import { Npm } from "../../src/controller/npm/Npm"


const npm = new Npm()
//TODO: this test accesses real-life npmjs,could think about mocking it,
//      if the CI machines etc don't have access to the internet
test("It should request data from npmjs",
    async () => {
        const dependencies = await npm.getDependencies("express")
        expect(dependencies.length).toBeGreaterThan(0)
        expect(dependencies).toContainEqual({ name: "cookie", version: "0.4.0" })
    })

const testDependencies = {
    "accepts": "~1.3.7",
    "array-flatten": "1.1.1",
    "body-parser": "1.19.0",
    "content-disposition": "0.5.3",
    "content-type": "~1.0.4",
    "cookie": "0.4.0",
    "cookie-signature": "1.0.6",
    "debug": "2.6.9",
    "depd": "~1.1.2",
    "encodeurl": "~1.0.2"
}