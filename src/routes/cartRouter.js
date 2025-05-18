import { Router } from "express";
import mongoose from "mongoose";
import Cart from "../dao/models/Cart.js";
import Product from "../dao/models/Product.js";
import passport from "passport";
import { authorize } from "../midleware/authorization.js";
import Ticket from "../dao/models/Ticket.js";
import purchaseCart from "../controllers/purchase.controller.js";

const cartRouter = Router();
const auth = [passport.authenticate("jwt", { session: false })];

cartRouter.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId }).populate("products.product");

    if (!cart) {
      cart = await Cart.create({ user: userId, products: [] });
    }

    res.json({ status: "success", cart });
  } catch (error) {
    console.error("Error obteniendo el carrito:", error);
    res.status(500).json({ status: "error", message: "Error interno del servidor" });
  }
});

cartRouter.post("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    let existingCart = await Cart.findOne({ user: userId });

    if (existingCart) {
      return res.status(200).json({ status: "success", cartId: existingCart._id });
    }

    const newCart = await Cart.create({ user: userId, products: [] });

    res.status(201).json({ status: "success", cartId: newCart._id });
  } catch (error) {
    console.error("Error creando el carrito:", error);
    res.status(500).json({ status: "error", message: "No se pudo crear el carrito." });
  }
});

cartRouter.post("/products/:pid", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { pid } = req.params;
    const { quantity = 1 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ status: "error", message: "ID de producto inválido" });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, products: [] });
    }

    const product = await Product.findById(pid);
    if (!product) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }

    const existingProductIndex = cart.products.findIndex(p => p.product.toString() === pid);
    if (existingProductIndex !== -1) {
      cart.products[existingProductIndex].quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }

    const updatedCart = await cart.save();
    await updatedCart.populate("products.product");

    res.json({ status: "success", message: "Producto agregado al carrito", cart: updatedCart });
  } catch (error) {
    console.error("Error agregando producto al carrito:", error);
    res.status(500).json({ status: "error", message: "Error interno del servidor" });
  }
});

cartRouter.delete("/products/:pid", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { pid } = req.params;

    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ status: "error", message: "ID de producto inválido" });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { products: { product: pid } } },
      { new: true }
    ).populate("products.product");
console.log("Carrito encontrado:", JSON.stringify(cart, null, 2));

    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    res.json({ status: "success", message: "Producto eliminado del carrito", cart });
  } catch (error) {
    console.error("Error eliminando producto del carrito:", error);
    res.status(500).json({ status: "error", message: "Error interno del servidor" });
  }
});

cartRouter.delete("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { products: [] },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    res.json({ status: "success", message: "Carrito vaciado correctamente", cart });
  } catch (error) {
    console.error("Error vaciando el carrito:", error);
    res.status(500).json({ status: "error", message: "Error interno del servidor" });
  }
});

cartRouter.post("/purchase", auth, purchaseCart);


cartRouter.put("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { products } = req.body; 

    if (!Array.isArray(products)) {
      return res.status(400).json({ status: "error", message: "El formato de productos es inválido" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }

    for (const item of products) {
      const productExists = await Product.findById(item.product);
      if (!productExists) {
        return res.status(404).json({ status: "error", message: `Producto no encontrado: ${item.product}` });
      }
    }

    cart.products = products;
    await cart.save();
    await cart.populate("products.product");

    res.json({ status: "success", message: "Carrito actualizado", cart });
  } catch (error) {
    console.error("Error actualizando el carrito:", error);
    res.status(500).json({ status: "error", message: "Error interno del servidor" });
  }
});

export default cartRouter;
