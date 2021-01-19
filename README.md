# NPM Dependency tree

## Requirements
1. Create a working application that, given the name of a published npm package, returns
the entire set of dependencies for the package.
2. Present the dependencies in a tree view.
3. We require tests. It’s up to you what style and how exhaustive these are.
4. Account for asynchronous fetching of dependencies as you see fit.
5. Consider caching relevant data so that repeated requests resolve with minimum latency.

## Considerations
### Caching
Options:
- Redis, or other http-level caches
- In-Memory, fast easy, clears when server dies
    - Create db with dependencies, update if version changes -> also update all dependencies

### Dependency tree
Tree will only be built in frontend, api provides packagename -> dependency list

### Security
- Should have some basic validation on package name, to not pass it directly to npmjs

### Testing
I opted for mostly integration tests, as the API is the best way to test the functionality directly. It actually spins up the same express server to run the tests on.

### Versions
Versions will always evaluate to their minimum viable version, as this is the only way to guarantee that a possible version can be fetched (without querying npmjs multiple times per request)
Versions like "*" will evaluate to "latest"

## Installation
### Building
### Running tests
## Deploying, running

docker run -p 127.0.0.1:6379:6379/tcp --name redis redis

Basic setup by:
https://levelup.gitconnected.com/setup-express-with-typescript-in-3-easy-steps-484772062e01

http://json2ts.com/