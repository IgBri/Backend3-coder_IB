import mongoose from "mongoose";
import { usersService } from "../services/index.js";
import { logger } from "../utils/logger.js";
import { errorTypes } from "../middlewares/errorHandler.js";

const getAllUsers = async(req,res)=>{
    const users = await usersService.getAll();
    if(users.length === 0){
        logger.warn("No hay usuarios cargados")
    };
    res.send({status:"success",payload:users})
}

const getUser = async(req,res)=> {
    const userId = req.params.uid;

    // Gestion del error
    const typeUserId = mongoose.Types.ObjectId.isValid(userId);
    if(typeUserId === false){
        let error = errorTypes._ID_VALIDATE;
        logger.warn("El tipo no es ObjectId", {error});
        return res.status(400).send(error);
    };

    const user = await usersService.getUserById(userId);
    if(!user) return res.status(404).send({status:"error",error:"User not found"});
    logger.info(`Usuario ${user.first_name} ${user.last_name} encontrado`)
    res.send({status:"success",payload:user})
}

const updateUser =async(req,res)=>{
    const updateBody = req.body;
    const userId = req.params.uid;
    const user = await usersService.getUserById(userId);
    if(!user) return res.status(404).send({status:"error", error:"User not found"})
    const result = await usersService.update(userId,updateBody);
    res.send({status:"success",message:"User updated"})
}

const deleteUser = async(req,res) =>{
    const userId = req.params.uid;
    const result = await usersService.getUserById(userId);
    res.send({status:"success",message:"User deleted"})
}

export default {
    deleteUser,
    getAllUsers,
    getUser,
    updateUser
}