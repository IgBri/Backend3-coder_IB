import PetDTO from "../dto/Pet.dto.js";
import { petsService } from "../services/index.js"
import __dirname from "../utils/index.js";

import { logger } from "../utils/logger.js";
import { errorTypes, errorTypesCodes } from "../middlewares/errorHandler.js";
import { CustomError } from "../utils/CustomError.js";
import mongoose from "mongoose";

const getAllPets = async (req, res, next) => {
    try {
        const pets = await petsService.getAll();
        if (!Array.isArray(pets) || pets.length === 0) {
            CustomError.generateError(errorTypes.GET_ERROR, "Error en la obtencion de documentos", "No se obtuvieron los documentos de la base de datos", errorTypesCodes.getError)
        }
        res.status(200).send({ status: "success", payload: pets })
    } catch (error) {
        logger.warn("Error capturado en getAllPets: ", error)
        next(error)
    };
};

const createPet = async (req, res, next) => {
    try {
        const { name, specie, birthDate } = req.body;
        const inputDate = new Date(birthDate);
        const todayDate = new Date();
        if (!name || !specie || !birthDate) {
            logger.warn("Campos incompletos")
            CustomError.generateError(errorTypes.PARAMS, "Debes pasar correctamente los datos para crear la mascota", "Los parametros recibidos en el req.body son invalidos o estan incompletos", errorTypesCodes.ARGUMENTOS_INVALIDOS)
        } else if (typeof name !== "string" || typeof specie !== "string" || typeof birthDate !== "string") {
            logger.warn("Tipo de dato invalido para los campos ingresados");
            CustomError.generateError(errorTypes.TYPE_DATA, "El tipo de dato de los campos ingresados no es de tipo String como deberia ser", "Los datos ingresados no con String", errorTypesCodes.DATA)
        } else if (inputDate > todayDate || isNaN(inputDate)) {
            logger.warn("Fecha invalida");
            CustomError.generateError(errorTypes.TYPE_DATA, "La fecha ingresada en el campo birthDate es invalida", "Fecha invalida", errorTypesCodes.DATA)
        }
        const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
        if (typeof pet.name !== "string" || typeof pet.specie !== "string" || typeof pet.birthDate !== "string" || typeof pet.adopted !== "boolean") {
            logger.warn("Error al generar el DTO de pet")
            CustomError.generateError(errorTypes.DTO, "Error en la creacion del DTO", "Error con el DTO", errorTypesCodes.DATA)
        }
        const result = await petsService.create(pet);
        if (!result) {
            logger.warn("Fallo la creacion de mascota")
            CustomError.generateError(errorTypes.CREATE, "HUbo un error en la creacion de la mascota", "Error en createPet", errorTypesCodes.createError)
        }
        res.status(201).send({ status: "success", payload: result })
    } catch (error) {
        logger.warn("Error capturado en createPet: ", error);
        next(error);
    };
};

const updatePet = async (req, res, next) => {
    try {
        const petUpdateBody = req.body;
        const petId = req.params.pid;
        const typePetId = mongoose.Types.ObjectId.isValid(petId);
        if (!petUpdateBody.name || !petUpdateBody.specie || !petUpdateBody.birthDate || !petId) {
            logger.warn("La informacion ingresada por los campos es incompleta para editar el documento")
            CustomError.generateError(errorTypes.UPDATE_ERROR, "Informacion para editar la mascota incompleta", "Faltan campos por completar", errorTypesCodes.ARGUMENTOS_INVALIDOS);
        };
        if (typeof petId !== "string" || typePetId === false) {
            logger.warn("El id ingresado es invalido")
            CustomError.generateError(errorTypes.PARAMS, "El id ingresado es invalido", "No es del typeof object", errorTypesCodes.TIPO_DE_DATOS);
        }
        const result = await petsService.update(petId, petUpdateBody);
        res.status(204).send({ status: "success", message: "pet updated" })
    } catch (error) {
        logger.error("Error capturado en updatePet: ", error);
        next(error);
    };
};

const deletePet = async (req, res, next) => {
    try {
        const petId = req.params.pid;
        if (!petId) {
            logger.warn("No se ha recibido un id");
            CustomError.generateError(errorTypes.PARAMS, "No se ha recibido el parametro id para buscar al documento", "No se recibio req.params.pid", errorTypesCodes.ARGUMENTOS_INVALIDOS);
        }
        const result = await petsService.delete(petId);
        if (result === null) {
            logger.warn("Error al eliminar el doucmento")
            CustomError.generateError(errorTypes.DELETE_ERROR, `Error en la eliminacion de la mascota con id ${petId}`)
        }
        res.status(200).send({ status: "success", message: "pet deleted" });
    } catch (error) {
        logger.error("Error capturado en deletePet");
        next(error);
    }
}

const createPetWithImage = async (req, res) => {
    try {
        const file = req.file;
        const { name, specie, birthDate } = req.body;
        if (!name || !specie || !birthDate || !file) {
            logger.warn("Campos incompletos")
            CustomError.generateError(errorTypes.ARGUMENTOS_INVALIDOS, "Campos incompletos para crear la mascota con imagen", "Campos vacios o incompletos", errorTypesCodes.CREATE)
        }
        const pet = PetDTO.getPetInputFrom({
            name,
            specie,
            birthDate,
            image: `${__dirname}/../public/img/${file.filename}`
        });
        if (typeof pet.name !== "string" || typeof pet.specie !== "string" || typeof pet.birthDate !== "string") {
            logger.warn("Error al generar el DTO de pet")
            CustomError.generateError(errorTypes.DTO, "Error en la creacion del DTO", "Error con el DTO", errorTypesCodes.DATA)
        }
        const result = await petsService.create(pet);
        if (!result) {
            logger.warn("Fallo la creacion de mascota")
            CustomError.generateError(errorTypes.CREATE, "Hubo un error en la creacion de la mascota", "Error en createPet", errorTypesCodes.createError)
        }
        res.status(201).send({ status: "success", payload: result })
    } catch (error) {
        logger.warn("Error capturado en createPet: ", error);
        next(error);
    };
};

export default {
    getAllPets,
    createPet,
    updatePet,
    deletePet,
    createPetWithImage
};