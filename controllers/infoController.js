import asyncHandler from "express-async-handler";
import pg from "pg";
import dotenv from "dotenv";
import axios from "axios";

// Load environment variables from .env file
dotenv.config();

// Create a new PostgreSQL client
const db = new pg.Client({
    user: process.env.USER,
    host:process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASS,
    port: process.env.PORT
});
db.connect();

/**
 * Checks if movies exist in the database.
 * @returns {Array} An array of movie objects.
 */
async function checkIfExists () {
    const result = await db.query("SELECT * FROM watched_movies");
    const movies = [];
    result.rows.forEach((movie) => {
        movies.push(movie);
    })
    return movies;
};

/**
 * Handler for getting a list of movies.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getMovies = asyncHandler( async (req, res) => {
    var movies = await checkIfExists();
    res.status(200).render("index.ejs", {movies});
});

/**
 * Handler for getting details of a specific movie.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getMovie = asyncHandler(async (req, res) => {
    const index = parseInt(req.params.id);
    var movies = await checkIfExists();
    const movie = movies[index];
    res.render("movieDetails.ejs", {movie,  index});
});

/**
 * Handler for rendering the movie form - where user adds movie.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getMovieForm = asyncHandler(async (req, res) => {
    res.render("newMovie.ejs");
});

/**
 * Handler for rendering the about page.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const getAboutPage = asyncHandler(async (req,res) => {
    res.render("about.ejs");
});

/**
 * Handler for adding a new movie to the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const addMovie = asyncHandler( async (req, res) => {
    const title = req.body.title;
    const year = req.body.year;
    try{
        // Fetch movie details from the OMDb API
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
    // Check if the movie already exists in the database
    if(db.query("SELECT EXISTS(SELECT 1 FROM watched_movies WHERE title=$1)",[TITLE])==true){
        return res.render("newMovie.ejs", {
            error: "Movie has already been added, try again.",
        });
    }
    else{
        try{
            // Fetch movie poster from The Movie Database API
            var posta = await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY2}&query=${TITLE}`);
            var poster = posta.data.results[0].poster_path;
            var POSTER = 'http://image.tmdb.org/t/p/w500'+poster;
            }
            catch(error){
                throw new Error("Error trying to get movie poster. Check your internet connection and try again");
            }
        
            try{
                // Insert movie details into the database
                await db.query("INSERT INTO watched_movies (title, release_year, imdb_rating, plot, poster) VALUES ($1, $2, $3, $4, $5)", [TITLE, YEAR, RATING, PLOT, POSTER]); 
            }
            catch(err){
                throw new Error("Error inserting movie into database.");
            }
    }
    // Redirect to the home page
    res.redirect("/");
});

/**
 * Handler for updating the contents of a specific movie.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const updateMovie = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    const newPlot = req.body.movieUpdated;
    try{
        // Fetch movies from the database
        const movies = await checkIfExists();
        var movie = movies[id];
    }
    catch(error){
        throw new Error({message: "An error occurred while trying to fetch resource from database, try again later"});
    }
    var title = movie.title;
    try{
        // Update the movie plot
        await db.query("UPDATE watched_movies SET plot=$1 WHERE title=$2", [newPlot, title]);
    }
    catch(error){
        throw new Error({message: "Error while updating movie"});
    }
    res.status(200).redirect("/view-details/"+id);
});

/**
 * Handler for deleting a movie from the database.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const deleteMovie = asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id);
    try{
        var movies = await checkIfExists();
        var movie = movies[id];
        var title = movie.title;
        // Delete the movie record
        await db.query("DELETE FROM watched_movies WHERE title=$1",[title]);
    }
    catch(error){
        throw new Error({message: "Error occurred in deleting record, try again later!"});
    }
    res.status(200).redirect("/");
});

// Export the handlers for use in other parts of app
export {
    getMovies,
    getMovieForm,
    addMovie,
    updateMovie,
    deleteMovie,
    getMovie,
    getAboutPage,
};