import { describe, it } from "mocha";
import { expect } from "chai";
import supertest from "supertest";
import mongoose, { isValidObjectId } from "mongoose";
import { generateUser } from "../../src/mocks/userMocks.js";
import config from "../../src/config/config.js";

const requester = supertest("http://localhost:8080");

try {
    //await mongoose.connect("mongodb://localhost:27017/dev_enviroment-backend3");
    await mongoose.connect(config.mongoURL);
} catch (error) {
    console.log("Error al conectar a la bade de datos", error)
};

console.log(config.mongoURL)

describe("Users router TEST", function () {
    this.timeout(10_000);

    let userMock;
    let userMockId;

    before(async () => {
        let user = await generateUser();
        userMock = {
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
        };
    });

    it("Test /api/users - method GET - Validate response all users", async () => {
        let { body, status } = await requester.get("/api/users");

        expect(status).to.be.eq(200);
        expect(body).to.has.property("status").and.to.be.eq("success");
        expect(body).to.has.property("payload");
        expect(Array.isArray(body.payload)).to.be.true;
        if (body.payload.lenght > 0) {
            expect(body.payload[0]).to.has.property("_id").and.to.be.a("string");
            expect(isValidObjectId(body.payload[0]._id)).to.be.true;
            expect(body.payload[0]).to.has.property("first_name").and.to.be.a("string");
            expect(body.payload[0]).to.has.property("last_name").and.to.be.a("string");
            expect(body.payload[0]).to.has.property("email").and.to.be.a("string");
            expect(body.payload[0]).to.has.property("password").and.to.be.a("string");
            expect(body.payload[0]).to.has.property("role").and.to.be.a("string");
            expect(body.payload[0]).to.has.property("pets").and.to.be.a("array");
            expect(body.payload[0]).to.has.property("__v").and.to.be.a("number");
        };

        userMockId = body.payload[0]._id

        // else if(body.payload[0] === 0){

        // }
    });

    it("Test /api/users/:uid - method GET - Validate response one user", async () => {
        let { body, status } = await requester.get(`/api/users/${userMockId}`);

        expect(status).to.be.eq(200);
        expect(body).to.has.property("status").and.to.be.eq("success");
        expect(body).to.has.property("payload").to.be.an("object");
    });
    it("Test /api/users/:uid - method PUT - Validate custom one user", async () => {
        let { body, status } = await requester.put(`/api/users/${userMockId}`).send(userMock);
        
        expect(status).to.be.eq(200);
        expect(body).to.has.property("status").and.to.be.eq("success").and.to.be.a("string");
        expect(body).to.has.property("message").and.to.be.a("string");
    });
    it("Test /api/users/:uid - method DELETE - Validate delete one user", async () => {
        let { body, status } = await requester.delete(`/api/users/${userMockId}`);

        console.log("body: ", body)
        console.log("status ", status)
            
        expect(status).to.be.eq(200);
        expect(body).to.has.property("status").and.to.be.eq("success").and.to.be.a("string");
        expect(body).to.has.property("message").and.to.be.eq("User deleted").and.to.be.a("string");
    });
});