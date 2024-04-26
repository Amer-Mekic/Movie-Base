import express from "express";
import {getMovies, getMovieForm, addMovie, updateMovie, deleteMovie} from "../controllers/infoController.js";

const router = express.Router();

router.route("/").get(getMovies);
router.route("/add-movie").get(getMovieForm).post(addMovie);
router.route("/update").post(updateMovie,(req,res)=>{
    res.redirect("/");
});
router.route("/delete/:id").post(deleteMovie, (req,res)=>{
    res.redirect("/");
});

export default router;