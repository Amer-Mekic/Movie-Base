import express from "express";
import {getMovies, addMovie, updateMovie, deleteMovie} from "../controllers/infoController.js";

const router = express.Router();

router.route("/").get(getMovies)
router.route("/add").post(addMovie,(req,res)=>{
    res.redirect("/");
})
router.route("/update/:id").post(updateMovie,(req,res)=>{
    res.redirect("/");
});
router.route("/delete/:id").post(deleteMovie, (req,res)=>{
    res.redirect("/");
});

export default router;