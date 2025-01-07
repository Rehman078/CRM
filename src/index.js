import express from "express";
import connectDB from "./config/dbConfig.js";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js"
import contactRoutes from "./routes/Contact/contactRoutes.js"
import fileRoutes from "./routes/File/fileRoutes.js"
import leadRoutes from "./routes/Lead/LeadRoutes.js"
import noteRoutes from "./routes/Note/noteRoutes.js"
dotenv.config();
const app = express();
const port = process.env.PORT || 3000
app.use(express.json());

//dbconnection
connectDB();
app.use("/src/public", express.static("src/public"));
// Routes
app.use("/api", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/notes", noteRoutes);
app.listen(port, () =>{
    console.log(`app is listen on ${port}`)
});

