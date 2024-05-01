import express from "express";
import dotenv from "dotenv";
import dbRouter from "./routes/info.js";

// Load environment variables from .env file
dotenv.config();
// Set the port for the Express server
const port = 3000;
// Create an Express app
const app = express();

// Serve static files from the "public" directory
app.use(express.static("public"));
// Parse incoming requests with URL-encoded payloads
app.use(express.urlencoded({extended:true}));
// Use the defined routes from the dbRouter
app.use("/", dbRouter);

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log("Server active on port "+port);
});