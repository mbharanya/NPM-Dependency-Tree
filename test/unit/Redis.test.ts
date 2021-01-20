import { Redis } from '../../src/controller/cache/Redis'
import { Fixtures } from '../Fixtures'

const redis = new Redis(process.env.REDIS_HOST || 'localhost', parseInt(process.env.REDIS_PORT || "6379"))

test("It should fetch some keys from redis", async () => {
    const testPkg = { name: "test", version: "1.0.0" }
    redis.cacheDependency(testPkg, {
        dependencies: Fixtures.expressTestDependencies,
        devDependencies: [Fixtures.expressDevDependencyExample]
    })
    const allKeys = await redis.getAllKeys()
    expect(allKeys).toContainEqual(redis.dependency2Key(testPkg))
})

test("Return cached dependencies from redis", async () => {
    const testPkg = { name: "test", version: "1.0.0" }
    const deps = {
        dependencies: Fixtures.expressTestDependencies,
        devDependencies: [Fixtures.expressDevDependencyExample]
    }
    redis.cacheDependency(testPkg, deps)
    const retrievedFromCache = (await redis.getDependency(testPkg)) || ""
    expect(JSON.parse(retrievedFromCache)).toEqual(deps)
})