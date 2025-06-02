import mongoose from "mongoose";
import { usersService } from "../services/index.js";
import { logger } from "../utils/logger.js";
import { errorTypes, errorTypesCodes } from "../middlewares/errorHandler.js";
import { CustomError } from "../utils/CustomError.js";

const getAllUsers = async (req, res, next) => {
    try {
        const users = await usersService.getAll();
        if (users.length === 0) {
            logger.warn("No hay usuarios cargados")
            CustomError.generateError(errorTypes.GET_ERROR, "No hay usuarios guadados en la base de datos", "Coleccion de usuarios vacia", errorTypesCodes.getError);
        };
        res.status(200).send({ status: "success", payload: users });
    } catch (error) {
        logger.error("Error capturado en getAllUsers");
        next(error);
    };
}

const getUser = async (req, res, next) => {
    try {
        const userId = req.params.uid;
        const typeUserId = mongoose.Types.ObjectId.isValid(userId);
        if (typeUserId === false) {
            logger.warn("Id invalido para buscar usuario");
            CustomError.generateError(errorTypes.PARAMS, "El id ingresado es invalido", "El id ingresado no es un _id de Mongo", errorTypesCodes.getError)
        };
        const user = await usersService.getUserById(userId);
        if (!user) {
            logger.warn(`No se ha encontrado un usuario con id ${userId}`);
            CustomError.generateError(errorTypes.GET_ERROR, "No se ha encontrado usuario que coincida con el id", "El usuario no existe en la base de datos", errorTypesCodes.getError)
        };
        res.status(200).send({ status: "success", payload: user });
    } catch (error) {
        logger.error("Error capturado en getUser: ", error);
        next(error);
    };
}

const updateUser = async (req, res, next) => {
    try {
        const updateBody = req.body;
        const userId = req.params.uid;
        const typeUserId = mongoose.Types.ObjectId.isValid(userId);
        if (!userId || !updateBody.first_name || !updateBody.last_name || !updateBody.role) {
            logger.warn("Campos incompletos");
            CustomError.generateError(errorTypes.PARAMS, "Campos incompletos para editar al usuario", "Campos incompletos", errorTypesCodes.ARGUMENTOS_INVALIDOS)
        };
        if (typeUserId === false || typeof userId !== "string") {
            logger.warn("Id invalido para buscar usuario");
            CustomError.generateError(errorTypes.PARAMS, "El id ingresado es invalido", "El id ingresado no es un _id de Mongo", errorTypesCodes.getError);
        };
        if (typeof updateBody.first_name !== "string" || typeof updateBody.last_name !== "string" || typeof updateBody.email !== "string" || typeof updateBody.password !== "string" || typeof updateBody.role !== "string") {
            logger.warn("Tipo de datos de los campos ingresados es invalido");
            CustomError.generateError(errorTypes.TYPE_DATA, "Campos ingresados invalidos", "Los tipos de datos de los campos ingresados no son validos", errorTypesCodes.TIPO_DE_DATOS);
        };
        const user = await usersService.getUserById(userId);
        if (!user) {
            logger.warn("Usuario no encontrado");
            CustomError.generateError(errorTypes.GET_ERROR, "Usuario no encontrado", `No hay usuario con id ${userId} almacenado en la base de datos`, errorTypesCodes.NOT_FOUND);
        };
        const result = await usersService.update(userId, updateBody);
        res.status(204).send({ status: "success", message: "User updated" })
    } catch (error) {
        logger.error("Error capturado en updateUser", error);
        next(error);
    };
}

const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.uid;
        const typeUserId = mongoose.Types.ObjectId.isValid(userId);
        if(typeUserId === false){
            logger.warn("Id de usuario invalido");
            CustomError.generateError(errorTypes.PARAMS, "El id ingresado es invalido", "El id ingresado no corresponde a un ObjectId de Mongo", errorTypesCodes.ARGUMENTOS_INVALIDOS);
        };
        const result = await usersService.delete(userId);
        if(result === null) {
            logger.warn("No se ha podido eliminar el usuario");
            CustomError.generateError(errorTypes.DELETE_ERROR, "No se pudo eliminar al usuario", "El usuario no se encontraba registrado en la base de datos", errorTypesCodes.NOT_FOUND);
        }
        res.send({ status: "success", message: "User deleted" })
    } catch (error) {
        logger.error("Error capturado en deleteUser: ", error);
        next(error);
    };
};

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser
}