import express from "express";
import { createOrder, getOrders, webhook, verifyPayment } from "./orderController.js";
const router = express.Router();

router.post("/orders", createOrder);
router.get("/orders", getOrders);

router.post("/verifyPayment", verifyPayment);



router.get('/my-webhook', webhook);


export default router;