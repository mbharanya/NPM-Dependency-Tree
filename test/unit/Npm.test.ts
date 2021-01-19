import { Npm } from "../../src/controller/npm/Npm"
import { Fixtures } from "../Fixtures"


const npm = new Npm()
//TODO: this test accesses real-life npmjs,could think about mocking it,
//      if the CI machines etc don't have access to the internet or the versions change
test("It should request data from npmjs",
    async () => {
        const dependencies = await npm.getDependencies("express")
        expect(dependencies.dependencies.length).toBeGreaterThan(0)
        expect(dependencies.devDependencies.length).toBeGreaterThan(0)
        expect(dependencies.dependencies).toContainEqual(Fixtures.expressDependencyExample)
        expect(dependencies.devDependencies).toContainEqual(Fixtures.expressDevDependencyExample)
    })

