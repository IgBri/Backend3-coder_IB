import { expect } from "chai";
import { after, describe, it } from "mocha";
import supertest from "supertest";
import mongoose, { isValidObjectId, mongo } from "mongoose";
import {generatePet} from "../../src/mocks/petMocks.js";

const requester = supertest("http://localhost:8080");

const connectDBtest = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/dev_enviroment-backend3");
    } catch (error) {
        console.log("Error al conectar a la bade de datos", error)
    }
};
await connectDBtest();

describe("Pets router TEST", function () {
    this.timeout(10_000);
    let petMock;

    before(async () => {
        petMock = generatePet();
    });
    after(async () => {
        await mongoose.connection.collection("pets").deleteMany({mock: true})
    });

    it("Test /api/pets - method GET - Validate response", async () => {
        let {body, status} = await requester.get("/api/pets");
        expect(body).to.has.property("status").and.to.be.eq("success");
        expect(body).to.has.property("payload");
        expect(Array.isArray(body.payload)).to.be.true;
        expect(status).to.be.equal(200);
        if(Array.isArray(body.payload) && body.payload.length > 0){
            expect(body.payload[0]).to.has.property("_id");
            expect(isValidObjectId(body.payload[0]._id)).to.be.true;
        };
    });

    it("Test /api/pets - method POST - Create valid pet", async () => {
        let {body, status} = await requester.post("/api/pets").send(petMock);
        expect(body).to.has.property("status").and.to.be.equal("success");
        expect(body).to.has.property("payload");
        expect(body.payload).to.has.property("name").to.be.a("string");
        expect(body.payload).to.has.property("specie").to.be.a("string");
        expect(body.payload).to.has.property("birthDate").to.be.a("string");
        expect(body.payload).to.has.property("adopted").to.be.a("boolean");
        expect(body.payload).to.has.property("image").to.be.a("string");
        expect(body.payload).to.has.property("_id").to.be.a("string");
        expect(body.payload).to.has.property("__v").to.be.a("number");
        expect(isValidObjectId(body.payload._id)).to.be.true;
        expect(status).to.be.eq(201);
    });
});