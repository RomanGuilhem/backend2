import Cart from "../dao/models/Cart.js";
import Ticket from "../dao/models/Ticket.js";

const purchaseCart = async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user._id) {
      return res.status(401).json({ status: "error", message: "Usuario no autenticado" });
    }

    const cart = await Cart.findOne({ user: user._id }).populate("products.product");

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ status: "error", message: "El carrito está vacío o no existe" });
    }

    let totalAmount = 0;
    const productosNoProcesados = [];
    const productosComprados = [];

    for (const item of cart.products) {
      const producto = item.product;
      const cantidad = Number(item.quantity);

      if (!producto || !producto._id) {
        console.warn("Producto inválido o no encontrado en base de datos");
        continue;
      }

      console.log({
        nombre: producto.nombre,
        precio: producto.precio,
        stock: producto.stock,
        cantidadSolicitada: cantidad,
      });

      const precio = Number(producto.precio);
      const stock = Number(producto.stock);

      if (isNaN(precio) || isNaN(stock) || isNaN(cantidad) || cantidad <= 0) {
        console.warn("Valores inválidos detectados");
        productosNoProcesados.push(producto._id);
        continue;
      }

      if (stock >= cantidad) {
        producto.stock = stock - cantidad;

        try {
          await producto.save();
        } catch (err) {
          console.error("Error al guardar el producto:", err);
          productosNoProcesados.push(producto._id);
          continue;
        }

        const subtotal = precio * cantidad;
        totalAmount += subtotal;

        productosComprados.push({
          nombre: producto.nombre,
          precio,
          cantidad,
          subtotal,
        });

        console.log(`Producto comprado: ${producto.nombre}`);
      } else {
        console.log(`Stock insuficiente para: ${producto.nombre}`);
        productosNoProcesados.push(producto._id);
      }
    }

    console.log("productosComprados:", productosComprados);
    console.log("productosNoProcesados:", productosNoProcesados);

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

    if (!ticket) {
      return res.status(400).json({
        status: "success",
        message: "No se pudo generar un ticket porque no hay productos con stock suficiente.",
        ticket: null,
        productosNoProcesados,
      });
    }

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
