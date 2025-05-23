import cartService from "../services/cart.service.js";

export const getUserCart = async (req, res) => {
  try {
    const cart = await cartService.getUserCart(req.user._id);
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }
    res.status(200).json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const getCartById = async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartService.getCartById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", message: "Carrito no encontrado" });
    }
    res.status(200).json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const createCart = async (req, res) => {
  try {
    const cart = await cartService.createCart(req.user._id);
    res.status(201).json({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const addProductToCart = async (req, res) => {
  try {
    const { pid } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        status: "error",
        message: "La cantidad debe ser mayor a cero.",
      });
    }

    const updatedCart = await cartService.addProductToCart(req.user._id, pid, quantity);
    if (!updatedCart) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }

    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const addProductToCartById = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { cid: cartId, pid: productId } = req.params;

    const isOwner = await cartService.isCartOwnedByUser(cartId, userId);
    if (!isOwner) {
      return res.status(403).json({
        status: "error",
        message: "No tienes permiso para modificar este carrito.",
      });
    }

    const updatedCart = await cartService.addProductToCartById(cartId, productId);
    if (!updatedCart) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }

    res.status(200).json({
      status: "success",
      message: "Producto agregado correctamente al carrito.",
      payload: updatedCart,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "No se pudo agregar el producto al carrito.",
    });
  }
};

export const removeProductFromCart = async (req, res) => {
  try {
    const { pid } = req.params;
    const updatedCart = await cartService.removeProductFromCart(req.user._id, pid);
    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const clearedCart = await cartService.clearCart(req.user._id);
    res.status(200).json({ status: "success", payload: clearedCart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const updateCart = async (req, res) => {
  try {
    const { products } = req.body;
    const updatedCart = await cartService.updateCart(req.user._id, products);
    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const finalizePurchase = async (req, res) => {
  const cartId = req.params.cid;
  const user = req.user;

  try {
    const result = await cartService.finalizePurchase(cartId, user);

    if (result.error === "Cart is empty or not found") {
      return res.status(400).json({
        status: "error",
        message: "El carrito está vacío o no se encontró. No se puede finalizar la compra.",
      });
    }

    if (!result.ticket) {
      return res.status(400).json({
        status: "error",
        message: "No se pudo procesar ningún producto. No se generó ticket.",
        unprocessedProducts: result.unprocessedProducts || [],
      });
    }

    res.status(200).json({
      status: "success",
      message: "Compra finalizada correctamente.",
      ticket: result.ticket,
      unprocessedProducts: result.unprocessedProducts || [],
    });
  } catch (err) {
    console.error("Error en finalizePurchase:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
};

