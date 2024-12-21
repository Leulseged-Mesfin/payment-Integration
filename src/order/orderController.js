import axios from "axios";
import OrderCollection from "./orderModel.js";
import ProductCollection from "../product/productModel.js";
import { nanoid } from "nanoid";
import crypto from "crypto";

export const createOrder = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({
                msg: "productId is required",
            });
        }
        // fetching the product from our database
        const product = await ProductCollection.findOne({ _id: productId });
        if (!product) {
            return res.status(404).json({
                msg: "Product not found",
            });
        }
        // txRef is a unique identifier that will be sent to chapa and later get used to verify the payment transaction
        const txRef = nanoid();

        const order = {
            productId: product._id,
            productName: product.name,
            productPrice: product.price,
            txRef: txRef,
        };
        // creating our order
        await OrderCollection.create(order);

        // building the chapa request with the necessary data's
        // note that additional fields can be set as well, like phoneNumber, email ...
        let chapaRequestData = {
            amount: product.price,
            tx_ref: txRef,
            currency: "ETB",
        };

        // making a request to chapa server
        // if mobile device use = `https://api.chapa.co/v1/transaction/mobile-initialize`
        const response = await axios.post(
            `https://api.chapa.co/v1/transaction/initialize`,
            chapaRequestData,
            {
                headers: {
                    Authorization: "Bearer " + process.env.CHAPA_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        // check if succesful
        if (response.data["status"] == "success") {
            return res.json({
                msg: "Order created successfully. Perform payment.",
                paymentUrl: response.data["data"]["checkout_url"],
            });
        } else {
            return res.status(500).json({
                msg: "Something went wrong",
            });
        }
    } catch (error) {
        if (error.response) {
            return res.status(500).json({
                msg: error.response.data,
            });
        } else {
            return res.status(500).json({
                msg: error,
            });
        }
    }
};


export const getOrders = async (req, res) => {
    try {
        const orders = await OrderCollection.find({});
        return res.status(200).json({
            orders,
        });
    } catch (error) {
        return res.status(500).json({
            msg: error,
        });
    }
};

export const webhook = (req, res) => {
    // Log the payload to see what you receive
    console.log('Received payload:', req.body);

    // Respond with a success message
    res.status(200).send('Webhook received successfully');
}

export const verifyPayment = async (req, res) => {
    try {
        //validate that this was indeed sent by Chapa's server
        // this is where we use the Secret hash we saved in .env
        const hash = crypto
            .createHmac("sha256", process.env.CHAPA_WEBHOOK_SECRET)
            .update(JSON.stringify(req.body))
            .digest("hex");
        if (hash == req.headers["x-chapa-signature"]) {
            // Retrieve the request's body
            const event = req.body;

            const { tx_ref, status } = event;
            if (status == "success" && tx_ref) {
                // hit the verify endpoint to make sure a transaction with the given
                // tx_ref was successful
                const response = await axios.get(
                    `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,

                    {
                        headers: {
                            Authorization: "Bearer " + process.env.CHAPA_API_KEY,
                        },
                    }
                );
                if (response.status == 200) {
                    // if successful find the order
                    if (response.data["status"] == "success") {
                        let tx_ref = response.data["data"]["tx_ref"];
                        const order = await OrderCollection.findOne({
                            txRef: tx_ref,
                        });
                        // check if the order doesn't exist or payment status is not pending
                        if (!order || order.paymentStatus != "pending") {
                            // Return a response to acknowledge receipt of the event
                            return res.sendStatus(200);
                        }
                        // change payment status to completed
                        if (order.paymentStatus == "pending") {
                            order.paymentStatus = "completed";
                            await order.save();
                            // Return a response to acknowledge receipt of the event
                            return res.sendStatus(200);
                        }
                    }
                }
            }
        }
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
};