import ProductCollection from "./productModel.js";

export const addProduct = async (req, res) => {
    try {
        const { products } = req.body;
        for (const product of products) {
            await ProductCollection.create(product);
        }
        return res.status(200).json({
            msg: "Products added successfully",
        });
    } catch (error) {
        return res.status(500).json({
            msg: error,
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await ProductCollection.find({});
        return res.status(200).json({
            products,
        });
    } catch (error) {
        return res.status(500).json({
            msg: error,
        });
    }
};