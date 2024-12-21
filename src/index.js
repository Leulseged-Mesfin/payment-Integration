import express from 'express'
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import productRoute from "./product/productRoute.js";
import orderRoute from "./order/orderRoute.js";



dotenv.config();
const app = express();
app.use(cors({ credentials: true }));
app.use(express.json());

app.use("/api", productRoute);
app.use("/api", orderRoute);

//db connection
mongoose
    .connect("mongodb://localhost:27017/chapa-integration", {
        useNewUrlParser: true,
    })
    .then(() => console.log("Connected to db"))
    .catch((error) => {
        console.log(error);
    });

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});