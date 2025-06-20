import { describe, it } from "mocha";
import { expect } from "chai";
import supertest from "supertest";
import mongoose, { isValidObjectId } from "mongoose";
import { generateUser } from "../../src/mocks/userMocks.js";
//import { logger } from "../../src/utils/logger.js";

const requester = supertest("http://localhost:8080");

try {
    await mongoose.connect("mongodb://localhost:27017/dev_enviroment-backend3");
} catch (error) {
    console.log("Error al conectar a la bade de datos", error)
}

describe("Sessions router TEST", function () {
    this.timeout(10_000);
    let cookie;
    let userMock;
    let loginUserMock;
    let InvalidUserMock = {
        first_name: "",
        last_name: "Perez",
        email: "test@test.com",
        password: "1234",
        role: "user"
    }
    let genericTestPassword = "coder123";
    before( async () => {
        userMock = await generateUser() 
        loginUserMock = {
            email: userMock.email,
            password: userMock.password
        };
    });
    after(async () => {
        await mongoose.connection.collection("users").deleteMany({email: userMock.email})
    });

    it("Test /api/sessions/register - method POST - Validate response", async () => {
        let {body, status} = await requester.post("/api/sessions/register").send(userMock);
        expect(body).to.has.property("status").and.to.be.eq("success");
        expect(body).to.has.property("status").and.to.not.equal("error");
        expect(body).to.has.property("payload");
        expect(isValidObjectId(body.payload)).to.be.true;
        expect(status).to.be.eq(200);
    });
    it("Test /api/sessions/login - method POST - Create cookie", async () => {
        let {body, status, headers} = await requester.post("/api/sessions/login").send(loginUserMock);
        
        cookie = headers["set-cookie"];
        let nombreCookie = cookie[0].split("=")[0];

        expect(nombreCookie).to.be.eq("coderCookie")
        expect(body).to.have.property("status").and.to.be.eq("success");
        expect(body).to.have.property("message").and.to.be.eq("Logged in");
        expect(nombreCookie).to.be.eq("coderCookie");
        expect(status).to.be.eq(200);
    });
    it("Test /api/sessions/current - method GET - Vallidate cookie", async () => {
        let {body, status} = await requester.get("/api/sessions/current").set("Cookie", cookie);

        expect(body).to.have.property("status").and.to.be.equal("success");
        expect(body).to.have.property("payload");
        expect(body.payload).to.have.property("name").to.be.eq(`${userMock.first_name} ${userMock.last_name}`);
        expect(body.payload).to.have.property("email").to.be.eq(userMock.email);
        expect(body.payload).to.have.property("role").to.be.eq(userMock.role);
        expect(status).to.be.eq(200);
    });  
});