import { logger } from "../utils/logger.js";

//Enum

export const errorTypesCodes={
    TIPO_DE_DATOS: 400, 
    ARGUMENTOS_INVALIDOS: 400, 
    AUTENTICACION: 401, 
    AUTORIZACION: 403, 
    NOT_FOUND: 404, 
    INTERNAL_SERVER_ERROR: 500,
    DATA: 400,

    getError: 404,
    createError: 400
}
export const errorTypes = {
    PARAMS: "INVALID_PARAMS",
    TYPE_DATA: "DATA_INVALID",
    DTO: "ERROR_DTO",
    _QUANTITY_DATA: "INVALID_QUANTITY_DATA",
    _EMPTY_ARRAY: "EMPTY_ARRAY",

    GET_ERROR: "getError",
    UPDATE_ERROR: "updateError",
    PUT_ERROR: "putError",
    DELETE_ERROR: "deleteError",

    CREATE: "createError",
    DATA_REPEAT: "repeateadData"
}; 

export const errorHandler = async (error, req, res, next) => {
    logger.error("Error capturado en el errorHandler: ", error)

    if(error.custom){
        logger.debug("El error es customizado")
        res.status(error.code).send({status: "error", errorName: error.name, message: error.message })
    }else {
        res.status(500).send({status: "error", message: "Error interno del servidor",payload: error.stack} || "Error interno del servidor")
    }
};