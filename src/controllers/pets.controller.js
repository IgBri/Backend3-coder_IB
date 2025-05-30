import PetDTO from "../dto/Pet.dto.js";
import { petsService } from "../services/index.js"
import __dirname from "../utils/index.js";

import { logger } from "../utils/logger.js";
import { errorTypes } from "../middlewares/errorHandler.js";

const getAllPets = async (req, res, next) => {
    try {
        const pets = await petsService.getAll();
        if (!Array.isArray(pets) || pets.length === 0) {
            throw new Error(errorTypes._EMPTY_ARRAY)
        }
        res.send({ status: "success", payload: pets })
    } catch (error) {
        logger.warn("Error capturado en getAllPets: ", error)
        next(error)
    }
}

const createPet = async (req, res, next) => {
    try {
        const { name, specie, birthDate } = req.body;
        if (!name || !specie || !birthDate) {
            //return res.status(400).send({ status: "error", error: "Incomplete values" })
            throw new Error(errorTypes._ID_VALIDATE)
        }
        const pet = PetDTO.getPetInputFrom({ name, specie, birthDate });
        const result = await petsService.create(pet);
        if (!result) {
            throw new Error("Error en la creacion del objeto pet");
        }
        res.send({ status: "success", payload: result })
    } catch (error) {
        logger.warn("Error capturado en createPet: ", error);
        next(error);
    }
}

const updatePet = async (req, res) => {
    try {
        const petUpdateBody = req.body;
        const petId = req.params.pid;
        const result = await petsService.update(petId, petUpdateBody);
        res.send({ status: "success", message: "pet updated" })
    } catch (error) {
        logger.warn("Error capturado en updatePet: ", error);
        next(error);
    }
}

const deletePet = async (req, res) => {
    const petId = req.params.pid;
    const result = await petsService.delete(petId);
    res.send({ status: "success", message: "pet deleted" });
}

const createPetWithImage = async (req, res) => {
    const file = req.file;
    const { name, specie, birthDate } = req.body;
    if (!name || !specie || !birthDate) return res.status(400).send({ status: "error", error: "Incomplete values" })
    console.log(file);
    const pet = PetDTO.getPetInputFrom({
        name,
        specie,
        birthDate,
        image: `${__dirname}/../public/img/${file.filename}`
    });
    console.log(pet);
    const result = await petsService.create(pet);
    res.send({ status: "success", payload: result })
}
export default {
    getAllPets,
    createPet,
    updatePet,
    deletePet,
    createPetWithImage
}