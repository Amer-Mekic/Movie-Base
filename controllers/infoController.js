import asyncHandler from "express-async-handler";
import pg from "pg";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const db = new pg.Client({
    user: process.env.USER,
    host:process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASS,
    port: process.env.PORT
});
db.connect();

async function checkIfExists () {
    const result = await db.query("SELECT * FROM watched_movies");
    const movies = [];
    result.rows.forEach((movie) => {
        movies.push(movie);
    })
    return movies;
};

const getMovies = asyncHandler( async (req, res) => {
    var movies = await checkIfExists();
    console.log(movies);
    res.status(200).render("index.ejs", {movies});
});

const addMovie = asyncHandler( async (req, res) => {
    const title = req.body.title;
    const year = req.body.year;
    if(!title){
        res.status(400);
        throw new Error("Must Enter valid title!");
    }
    try{
    var response = await axios.get(`http://www.omdbapi.com/?t=${title}&y=${year}&apikey=${process.env.API_KEY}`);
    }
    catch(err){
        throw new Error("Enter valid title and year. Check if your API key is active and verify internet connection");
    }
    const TITLE = response.data.Title;
    const YEAR = response.data.Year;
    const RATING = response.data.imdbRating || 0;
    const PLOT = response.data.Plot;
    try{
    var posta = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY2}&query=${TITLE}`);
    }
    catch(error){
        throw new Error("Error trying to get movie poster. Check your internet connection and try again");
    }
    const poster = posta.data.results[0].poster_path;
    console.log(posta.data.results[0].poster_path);
    const POSTER = 'http://image.tmdb.org/t/p/w500'+poster;

    try{
        await db.query("INSERT INTO watched_movies (title, release_year, imdb_rating, plot, poster) VALUES ($1, $2, $3, $4, $5)", [TITLE, YEAR, RATING, PLOT, POSTER]); 
    }
    catch(err){
        console.log(err);
        /*const movies = await checkIfExists();
        res.render("index.ejs", {
        movies: movies,
        error: "Movie has already been added, try again.",
      });*/
    }
    res.status(200);
});

const updateMovie = asyncHandler(async (req, res) => {
    const title = req.body.title;
    try{
    const plotQuery = await db.query("SELECT plot FROM watched_movies WHERE title=$1", [title]);
    const plot = plotQuery.rows;
    }
    catch(error){
        throw new Error({message: "An error occurred while trying to fetch resource from database, try again later"});
    }
    const input = "Ed Edd and Eddy";
    //const input = prompt("Write new plot:", plot);
    try{
    const updateDB = await db.query("UPDATE watched_movies SET plot=$1 WHERE title=$2", [input||plot, title]);
    }
    catch(error){
        throw new Error({message: "Error while updating movie"});
    }
    res.status(200);
});

const deleteMovie = asyncHandler(async (req, res) => {
    const title = req.body.title;
    try{
        await db.query("DELETE FROM watched_movies WHERE title=$1", [title]);
    }
    catch(error){
        throw new Error({message: "Error occurred in deleting record, try again later!"});
    }
    res.status(200);
});

export {getMovies};
export {addMovie};
export {updateMovie};
export {deleteMovie};