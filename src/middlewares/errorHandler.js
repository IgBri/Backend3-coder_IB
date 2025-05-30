import { logger } from "../utils/logger.js";

//Enum
export const errorTypes = {
    _ID_VALIDATE: "INVALID_PARAM",
    _QUANTITY_DATA: "INVALID_QUANTITY_DATA",
    _EMPTY_ARRAY: "EMPTY_ARRAY"
}; 

export const errorHandler = async (error, req, res, next) => {
    logger.error("Error capturado en el errorHandler: ", error)
    res.status(500).send({status: "error", message: error.message, payloadError: error.stack} || "Error capturado en errorHandler")
};