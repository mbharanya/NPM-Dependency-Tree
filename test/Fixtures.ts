export class Fixtures {
    static expressTestDependencies = [
        { name: "accepts", version: "~1.3.7" },
        { name: "array-flatten", version: "1.1.1" },
        { name: "body-parser", version: "1.19.0" },
        { name: "content-disposition", version: "0.5.3" },
        { name: "content-type", version: "~1.0.4" },
        { name: "cookie", version: "0.4.0" },
        { name: "cookie-signature", version: "1.0.6" },
        { name: "debug", version: "2.6.9" },
        { name: "depd", version: "~1.1.2" },
        { name: "encodeurl", version: "~1.0.2" }
    ]

    static expressDependencyExample = { name: "cookie", version: "0.4.0" }
    static expressDevDependencyExample = { name: "supertest", version: "3.3.0" }

    static setup(){
        require('dotenv').config()
    }
}
