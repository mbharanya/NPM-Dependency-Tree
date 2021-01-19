import { Npm, PackageDependencies } from "../../src/controller/npm/Npm"
import { Fixtures } from "../Fixtures"


const npm = new Npm()
//TODO: this test accesses real-life npmjs,could think about mocking it,
//      if the CI machines etc don't have access to the internet or the versions change
test("It should request data from npmjs",
    async () => {
        const dependencies = await npm.getDependencies("express")
        isValidPackageDependencies(dependencies)
    })


test("It should be able to handle vague versions",
    async () => {
        isValidPackageDependencies(await npm.getDependencies("express", "*"))
        isValidPackageDependencies(await npm.getDependencies("express", ">4.17.0"))
        isValidPackageDependencies(await npm.getDependencies("express", "~4.17.0"))
    })


function isValidPackageDependencies(response: PackageDependencies) {
    expect(response.dependencies.length).toBeGreaterThan(0)
    expect(response.devDependencies.length).toBeGreaterThan(0)
    expect(response.dependencies).toContainEqual(Fixtures.expressDependencyExample)
    expect(response.devDependencies).toContainEqual(Fixtures.expressDevDependencyExample)
}