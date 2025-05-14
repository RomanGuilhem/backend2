import Cart from "../dao/models/Cart.js"; 
import Ticket from "../dao/models/Ticket.js";

const purchaseCart = async (req, res) => {
  try {
    const user = req.user;
    const cart = await Cart.findOne({ user: user._id }).populate("products.product");

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ status: "error", message: "El carrito está vacío o no existe" });
    }

    let totalAmount = 0;
    const productosNoProcesados = [];
    const productosComprados = [];

    for (const item of cart.products) {
      const producto = item.product;
      const cantidad = item.quantity;

      if (!producto || isNaN(producto.price)) {
        productosNoProcesados.push(producto?._id);
        continue;
      }

      if (producto.stock >= cantidad) {
        producto.stock -= cantidad;
        await producto.save();

        const subtotal = Number(producto.price) * Number(cantidad);
        totalAmount += subtotal;

        productosComprados.push({
          nombre: producto.title,
          precio: Number(producto.price),
          cantidad: Number(cantidad),
          subtotal,
        });
      } else {
        productosNoProcesados.push(producto._id);
      }
    }

    let ticket = null;
    if (productosComprados.length > 0) {
      ticket = await Ticket.create({
        amount: totalAmount,
        purchaser: user.email,
        products: productosComprados,
      });
    }

    cart.products = cart.products.filter(item =>
      productosNoProcesados.includes(item.product._id)
    );
    await cart.save();

    return res.status(200).json({
      status: "success",
      message: "Compra procesada",
      ticket,
      productosNoProcesados,
    });
  } catch (error) {
    console.error("Error al finalizar la compra:", error);
    return res.status(500).json({ status: "error", message: "Error al finalizar la compra" });
  }
};

export default purchaseCart;
