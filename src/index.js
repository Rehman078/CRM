import express from "express";
import connectDB from "./config/dbConfig.js";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js"
import contactRoutes from "./routes/contactRoutes.js"
import fileRoutes from "./routes/fileRoutes.js"
import contacFileRoutes from "./routes/contactfileRoutes.js"
dotenv.config();
const app = express();
const port = process.env.PORT || 3000
app.use(express.json());

//dbconnection
connectDB();
// Routes
app.use("/api", userRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/files", fileRoutes);
app.use("/api", contacFileRoutes)

app.listen(port, () =>{
    console.log(`app is listen on ${port}`)
});

