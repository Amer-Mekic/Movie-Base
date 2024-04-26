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
    res.status(200).render("index.ejs", {movies});
});

const getMovieForm = asyncHandler(async (req, res) => {
    res.render("newMovie.ejs");
});

const addMovie = asyncHandler( async (req, res) => {
    const title = req.body.title;
    const year = req.body.year;
    try{
    var response = await axios.get(`http://www.omdbapi.com/?t=${title}&y=${year}&apikey=${process.env.API_KEY}`);
    if(response.data.Error){
        return res.render("newMovie.ejs", {
            error: response.data.Error,
        });
    }
    else{
        var TITLE = response.data.Title;
        var YEAR = response.data.Year;
        var RATING = response.data.imdbRating || 0;
        var PLOT = response.data.Plot;
    }
    } catch(err){
        throw new Error("Error fetching resource. Check Interet or API key.")
    }
    if(db.query("SELECT EXISTS(SELECT 1 FROM watched_movies WHERE title=$1)",[TITLE])==true){
        return res.render("newMovie.ejs", {
            error: "Movie has already been added, try again.",
        });
    }
    else{
        try{
            var posta = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY2}&query=${TITLE}`);
            var poster = posta.data.results[0].poster_path;
            var POSTER = 'http://image.tmdb.org/t/p/w500'+poster;
            }
            catch(error){
                throw new Error("Error trying to get movie poster. Check your internet connection and try again");
            }
        
            try{
                await db.query("INSERT INTO watched_movies (title, release_year, imdb_rating, plot, poster) VALUES ($1, $2, $3, $4, $5)", [TITLE, YEAR, RATING, PLOT, POSTER]); 
            }
            catch(err){
                throw new Error("Error inserting movie into database.");
            }
    }
    res.redirect("/");
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
    const input = "Paranormal investigators Ed and Lorraine Warren work to help a family terrorized by a dark presence.";
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
export {getMovieForm};
export {addMovie};
export {updateMovie};
export {deleteMovie};