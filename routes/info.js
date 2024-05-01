import express from "express";
import {getMovies, getMovie, getMovieForm, addMovie, updateMovie, deleteMovie, getAboutPage} from "../controllers/infoController.js";

const router = express.Router();

router.route("/").get(getMovies)
router.route("/about").get(getAboutPage);
router.route("/view-details/:id").get(getMovie);
router.route("/add-movie").get(getMovieForm).post(addMovie);
router.route("/update/:id").post(updateMovie);
router.route("/delete/:id").post(deleteMovie);

export default router;