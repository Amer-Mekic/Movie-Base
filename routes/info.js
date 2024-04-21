import express from "express";
import {getMovies, addMovie} from "../controllers/infoController.js";

const router = express.Router();

router.route("/").get(getMovies).post(addMovie);

export default router;