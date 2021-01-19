import { Npm } from "../../src/controller/npm/Npm"
import { Fixtures } from "../Fixtures"


const npm = new Npm()
//TODO: this test accesses real-life npmjs,could think about mocking it,
//      if the CI machines etc don't have access to the internet
test("It should request data from npmjs",
    async () => {
        const dependencies = await npm.getDependencies("express")
        expect(dependencies.length).toBeGreaterThan(0)
        expect(dependencies).toContainEqual(Fixtures.expressDependencyExample)
    })

