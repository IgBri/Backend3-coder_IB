import Users from "../../src/dao/Users.dao.js"
import {describe, it} from "mocha";
import Assert from "assert";
import mongoose from "mongoose";
//import config from "../../src/config/config.js"
import {logger} from "../../src/utils/logger.js"
import { createHash } from "../../src/utils/index.js";

const assert = Assert.strict;

const connectDBtest = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/dev_enviroment-backend3");
    } catch (error) {
        console.log("Error al conectar a la bade de datos", error)
    }
};
await connectDBtest();

describe("Users DAO Test", function(){
    this.timeout(10_000);

    before(function() {
        this.usersDAO = new Users();
        this.userMock = {
            first_name: "test",
            last_name: "test",
            email: "test@test.com",
            password: "test123",
            role: "test"
        }
    });

    after(async () => {
        await mongoose.connection.collection("users").deleteMany({email: "test@test.com"})
    });

    it("get method test - Obtencion de usuarios", async function () {
        logger.debug("Iniciando GET test")
        let resultado = await this.usersDAO.get();

        assert.equal(Array.isArray(resultado), true);

        if(resultado.length !== 0){
            logger.debug("El array Users contiene usuarios");
            resultado.forEach(user => {
                assert.ok(user._id)
                assert.ok(user.first_name)
                assert.ok(user.last_name)
                assert.ok(user.email)
                assert.ok(user.password)
                assert.ok(user.role)
                assert.ok(user.pets)
            });
        } else {
            logger.debug("El array Users esta vacio");
            assert.ok(resultado.length >= 0);
        };
    });

    it("save method test - Guardado de usuario", async function () {
        logger.debug("Iniciando SAVE test")

        let copyMock = {...this.userMock};
        copyMock.password = await createHash(this.userMock.password);

        let resultado = await this.usersDAO.save(copyMock);

        assert.ok(resultado._id)
        assert.ok(mongoose.isValidObjectId(resultado._id))
        assert.ok(resultado.first_name)
        assert.ok(resultado.last_name)
        assert.ok(resultado.email)
        assert.ok(resultado.password)
        assert.ok(resultado.role)
        assert.ok(resultado.pets)

        assert.equal(resultado.first_name, this.userMock.first_name)
        assert.equal(resultado.first_name, this.userMock.first_name)
        assert.equal(resultado.email, this.userMock.email)
        assert.notEqual(resultado.password, this.userMock.password)
    });
}) 