export const finalizarCompra = async (req, res) => {
  const user = req.user;

  try {
    const cart = await Cart.findOne({ user: user._id }).populate("products.product");

    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ status: "error", message: "El carrito está vacío" });
    }

    let totalAmount = 0;
    const productosNoProcesados = [];
    const productosComprados = [];

for (const item of cart.products) {
  const producto = item.product;
  const cantidad = item.quantity;

    if (!producto) {
    console.log(`Producto no encontrado en BD. ID: ${item.product}`);
    productosNoProcesados.push(item.product);
    continue;
  }
  console.log(`Verificando stock para ${producto.nombre} (stock actual: ${producto.stock}, cantidad solicitada: ${cantidad})`);

  if (producto.stock >= cantidad) {
    producto.stock -= cantidad;
    await producto.save();

    const subtotal = producto.precio * cantidad;
    totalAmount += subtotal;

    productosComprados.push({
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad,
      subtotal,
    });

    console.log(`Producto comprado: ${producto.nombre}`);
  } else {
    productosNoProcesados.push(producto._id);
    console.log(`Producto sin stock suficiente: ${producto.nombre}`);
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

cart.products = cart.products.filter(item => {
  const id = item.product?._id || item.product; 
  return productosNoProcesados.includes(id);
});

    await cart.save();

    return res.status(200).json({
      status: "success",
      message: "Proceso de compra finalizado",
      ticket,
      productosNoProcesados,
    });

  } catch (error) {
    console.error("Error al finalizar compra:", error);
    return res.status(500).json({ status: "error", message: "Error interno al finalizar la compra" });
  }
};
