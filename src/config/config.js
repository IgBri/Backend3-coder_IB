import { Command } from "commander";
import dotenv from "dotenv";

const program = new Command();

program
    .option("--mode <mode>", "Modo de trabajo", "development")
    .option("-p <port>", "Puerto del servidor", 8080)
program.parse();

const enviroment = program.opts().mode;

dotenv.config({
    path: enviroment === "production" ? "./src/config/.env.production" : "./src/config/.env.development"
});

export default {
    enviroment: program.opts().mode,
    port: process.env.PORT,
    mongoURL: process.env.MONGO_URL
}