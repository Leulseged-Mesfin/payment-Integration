import express from "express";
import { addProduct, getProducts } from "./productController.js";
const router = express.Router();

router.post("/products", addProduct);

router.get("/products", getProducts);

export default router;