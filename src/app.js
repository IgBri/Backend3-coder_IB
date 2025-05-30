import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import config from './config/config.js';

import usersRouter from './routes/users.router.js';
import petsRouter from './routes/pets.router.js';
import adoptionsRouter from './routes/adoption.router.js';
import sessionsRouter from './routes/sessions.router.js';
import mocksRouter from './routes/mocks.router.js';

import { errorHandler } from './middlewares/errorHandler.js';
import { logger, middLogg } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 8080;
const connection = mongoose.connect(config.mongoURL)

//app.use(middLogg)
app.use(express.json());
app.use(cookieParser());

app.use("/api/mocks", mocksRouter)
app.use('/api/users', usersRouter);
app.use('/api/pets', petsRouter);
app.use('/api/adoptions', adoptionsRouter);
app.use('/api/sessions', sessionsRouter);

app.get("/loggerTest", (req, res) => {
    try {
        logger.fatal("Error FATAL");
        logger.error("Error ERROR");
        logger.warn("Error WARN");
        logger.info("Error INFO");
        logger.http("Error HTTP");
        logger.debug("Error DEBUG");

        res.send("Se ejecuto loggerTest")
    } catch (error) {
        logger.error("Error capturado en loggertest: ", error)
    }
});

//middleware de errores
app.use(errorHandler)

app.listen(PORT, () => logger.info(`Listening on ${PORT}`))

//Informacion secundaria
logger.info(`Modo de trabajo: ${config.enviroment}`)
logger.info(`Puerto utilizado: ${config.port}`)