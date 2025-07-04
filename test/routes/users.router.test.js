import { describe, it } from "mocha";
import { expect } from "chai";
import supertest from "supertest";
import mongoose, { isValidObjectId } from "mongoose";
import { generateUser } from "../../src/mocks/userMocks.js";
import { connectDBtest } from "../utils/utils_test.js";
import { logger } from "../../src/utils/logger.js";

process.loadEnvFile("./src/config/.env.test");
const requester = supertest(`http://localhost:${process.env.PORT}`);

describe("Users router TEST", function () {
    this.timeout(10_000);
    this.userMock;
    this.userMockId;

    before(async function () {
        try {
            await connectDBtest(process.env.MONGO_URL);
            let {body} = await requester.post("/api/sessions/register").send(await generateUser()); 
            this.userMockId = body.payload;       
            logger.debug("COMENZANDO CICLO DE TEST");
        } catch (error) {
            logger.error("Error en before users router test", error);
        };
    });
    after(async function () {
        try {
            // await mongoose.connection.collection("users").deleteMany();
            await mongoose.connection.close();
            logger.debug("CICLO DE TEST FINALIZADO");
        } catch (error) {
            logger.error("Error en after - users router test");
        }
    });

    it("Test /api/users - method GET - Validate response all users", async function () {
        logger.info("Iniciando getAllUsers method test");
        let { body, status } = await requester.get("/api/users");

        expect(status).to.be.eq(200);
        expect(body).to.has.property("status").and.to.be.eq("success");
        expect(body).to.has.property("payload");
        expect(Array.isArray(body.payload)).to.be.true;
        if (body.payload.lenght > 0) {
            body.payload.forEach((user) => {
                expect(user).to.has.property("_id").and.to.be.a("string");
                expect(isValidObjectId(user._id)).to.be.true;
                expect(user).to.has.property("first_name").and.to.be.a("string");
                expect(user).to.has.property("last_name").and.to.be.a("string");
                expect(user).to.has.property("email").and.to.be.a("string");
                expect(user).to.has.property("password").and.to.be.a("string");
                expect(user).to.has.property("role").and.to.be.a("string");
                expect(user).to.has.property("pets").and.to.be.a("array");
                expect(user).to.has.property("__v").and.to.be.a("number");
            });
        };
    });

    it("Test /api/users/:uid - method GET - Validate response one user", async function () {
        logger.info("Iniciando getUser method test")
        let { body, status } = await requester.get(`/api/users/${this.userMockId}`);
        this.userMock = {
            first_name: `${body.payload.first_name} - TEST`,
            last_name:`${body.payload.last_name} - TEST`,
            role:`${body.payload.role} - TEST`
        }

        expect(status).to.be.eq(200);
        expect(body).to.has.property("status").and.to.be.eq("success");
        expect(body).to.has.property("payload").to.be.an("object");
        expect(body.payload).to.has.property("_id").and.to.be.a("string");
        expect(isValidObjectId(body.payload._id)).to.be.true;
        expect(body.payload).to.has.property("first_name").and.to.be.a("string");
        expect(body.payload).to.has.property("last_name").and.to.be.a("string");
        expect(body.payload).to.has.property("email").and.to.be.a("string");
        expect(body.payload).to.has.property("password").and.to.be.a("string");
        expect(body.payload).to.has.property("role").and.to.be.a("string");
        expect(body.payload).to.has.property("pets").and.to.be.a("array");
        expect(body.payload).to.has.property("__v").and.to.be.a("number");
    });
    it("Test /api/users/:uid - method PUT - Validate custom one user", async function ()  {
        logger.info("Iniciando updateUser method test");
        let { body, status } = await requester.put(`/api/users/${this.userMockId}`).send(this.userMock);
        
        expect(status).to.be.eq(200);
        expect(body).to.has.property("status").and.to.be.eq("success").and.to.be.a("string");
        expect(body).to.has.property("message").and.to.be.a("string");
    });
    it("Test /api/users/:uid/documents - method POST - Validate uploader files", async function () {
        logger.info("Iniciando uploaderDocument method test");
        let {body, status, headers} = await requester.post(`/api/users/${this.userMockId}/documents`).attach("userDocument", "test/filesTest/collie_prueba.webp");

        expect(body).to.has.property("status").and.to.be.eq("success");
        expect(body).to.has.property("message").and.to.be.eq("added document");
        expect(body).to.has.property("qtyDocs").and.to.be.a("number");
        expect(body.qtyDocs).to.be.above(0)
        expect(status).to.be.eq(200);
    });
    it("Test /api/users/:uid - method DELETE - Validate delete one user", async function () {
        logger.info("Iniciando deleteUser method test");
        let { body, status } = await requester.delete(`/api/users/${this.userMockId}`);
            
        expect(status).to.be.eq(200);
        expect(body).to.has.property("status").and.to.be.eq("success").and.to.be.a("string");
        expect(body).to.has.property("message").and.to.be.eq("User deleted").and.to.be.a("string");
    });
});
