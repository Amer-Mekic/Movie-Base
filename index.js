import express from "express";
import dotenv from "dotenv";
import dbRouter from "./routes/info.js";

dotenv.config();
const port = 3000;
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.use("/", dbRouter);

app.listen(port, () => {
    console.log("Server active on port "+port);
});