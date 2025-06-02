import { usersService } from "../services/index.js";
import { createHash, passwordValidation } from "../utils/index.js";
import jwt from 'jsonwebtoken';
import UserDTO from '../dto/User.dto.js';
import { logger } from "../utils/logger.js";
import { errorTypes, errorTypesCodes } from "../middlewares/errorHandler.js";

import { CustomError } from "../utils/CustomError.js";

const register = async (req, res, next) => {
    try {
        const { first_name, last_name, email, password } = req.body;
        if (!first_name || !last_name || !email || !password) {
            logger.warn("Campos incompletos");
            CustomError.generateError(errorTypes.PARAMS, "Se deben completar todos los campos", "Campos incompletos", errorTypesCodes.ARGUMENTOS_INVALIDOS);
        } else if (typeof first_name !== "string" || typeof last_name !== "string" || typeof email !== "string") {
            logger.warn("Tipo de datos ingresados invalido");
            CustomError.generateError(errorTypes.TYPE_DATA, "El tipo de datos ingresados es invalido", "Los datos no cumplen con los requisitos de tipo", errorTypesCodes.TIPO_DE_DATOS);
        };
        const exists = await usersService.getUserByEmail(email);
        if (exists) {
            logger.warn("Correo electronico en uso")
            CustomError.generateError(errorTypes.DATA_REPEAT, "El correo electronico ya se encuentra en uso", "Dato repetido", errorTypesCodes.ARGUMENTOS_INVALIDOS);
        };
        const hashedPassword = await createHash(password);
        const user = {
            first_name,
            last_name,
            email,
            password: hashedPassword
        }
        let result = await usersService.create(user);
        if (!result) {
            logger.warn("Error al registrar al usuario");
            CustomError.generateError(errorTypes.CREATE, "Error al registrar al usuario", "Error en la creacion del usuario", errorTypesCodes.createError);
        }
        res.send({ status: "success", payload: result._id });
    } catch (error) {
        logger.error("Error capturado en register: ", error);
        next(error);
    };
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password){
            logger.warn("Campos incompletos");
            CustomError.generateError(errorTypes.PARAMS, "Campos incompletos para login", "Los campos ingresados en el login estan incompletos", errorTypesCodes.ARGUMENTOS_INVALIDOS);
        };
        const user = await usersService.getUserByEmail(email);
        if (!user) return res.status(404).send({ status: "error", error: "User doesn't exist" });
        const isValidPassword = await passwordValidation(user, password);
        if (!isValidPassword) return res.status(400).send({ status: "error", error: "Incorrect password" });
        const userDto = UserDTO.getUserTokenFrom(user);
        const token = jwt.sign(userDto, 'tokenSecretJWT', { expiresIn: "1h" });
        res.cookie('coderCookie', token, { maxAge: 3600000 }).send({ status: "success", message: "Logged in" })
    } catch (error) {
        logger.error("Error capturado en login: ", error)
        next(error);
    };
};

const current = async (req, res) => {
    const cookie = req.cookies['coderCookie']
    const user = jwt.verify(cookie, 'tokenSecretJWT');
    if (user)
        return res.send({ status: "success", payload: user })
}

const unprotectedLogin = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send({ status: "error", error: "Incomplete values" });
    const user = await usersService.getUserByEmail(email);
    if (!user) return res.status(404).send({ status: "error", error: "User doesn't exist" });
    const isValidPassword = await passwordValidation(user, password);
    if (!isValidPassword) return res.status(400).send({ status: "error", error: "Incorrect password" });
    const token = jwt.sign(user, 'tokenSecretJWT', { expiresIn: "1h" });
    res.cookie('unprotectedCookie', token, { maxAge: 3600000 }).send({ status: "success", message: "Unprotected Logged in" })
}
const unprotectedCurrent = async (req, res) => {
    const cookie = req.cookies['unprotectedCookie']
    const user = jwt.verify(cookie, 'tokenSecretJWT');
    if (user)
        return res.send({ status: "success", payload: user })
}
export default {
    current,
    login,
    register,
    current,
    unprotectedLogin,
    unprotectedCurrent
}