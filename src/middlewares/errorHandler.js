import { logger } from "../utils/logger.js";

//Enum
export const errorTypes = {
    _ID_VALIDATE: "INVALID_PARAM",
    _QUANTITY_DATA: "INVALID_QUANTITY_DATA"
}; 

export const errorHandler = async (error, req, res, next) => {
    logger.info("Se ejecuta el errorHandler")

    if (!error) next();
    logger.warn("Hubo un error", {error});
    res.status(400).send(error)
};