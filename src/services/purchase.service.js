import Cart from "../dao/models/Cart.js";
import Ticket from "../dao/models/Ticket.js";

export const processPurchase = async (user, cartId) => {
  if (!user || !user._id) throw new Error("Usuario no autenticado");

  const cart = await Cart.findById(cartId).populate("products.product");
  if (!cart || String(cart.user) !== String(user._id)) {
    throw new Error("Carrito no encontrado o no pertenece al usuario");
  }

  if (cart.products.length === 0) return { ticket: null, productosNoProcesados: [] };

  let totalAmount = 0;
  const productosNoProcesados = [];
  const productosComprados = [];

  for (const item of cart.products) {
    const producto = item.product;
    const cantidad = Number(item.quantity);

    if (!producto || isNaN(producto.price) || isNaN(producto.stock) || isNaN(cantidad) || cantidad <= 0) {
      productosNoProcesados.push(producto?._id || null);
      continue;
    }

    if (producto.stock >= cantidad) {
      producto.stock -= cantidad;
      await producto.save();

      const subtotal = producto.price * cantidad;
      totalAmount += subtotal;

      productosComprados.push({ title: producto.title, price: producto.price, cantidad, subtotal });
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

  return { ticket, productosNoProcesados };
};