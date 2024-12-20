import express from "express";
import connectDB from "./config/dbConfig.js";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"


dotenv.config();
const app = express();
const port = process.env.PORT || 3000
app.use(express.json());

//dbconnection
connectDB();
// Routes
app.use("/api", userRoutes);
app.use("/api", adminRoutes)

app.listen(port, () =>{
    console.log(`app is listen on ${port}`)
});

