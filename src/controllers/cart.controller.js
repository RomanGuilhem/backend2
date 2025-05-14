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

  console.log(`Verificando stock para ${producto.title} (stock actual: ${producto.stock}, cantidad solicitada: ${cantidad})`);

  if (producto.stock >= cantidad) {
    producto.stock -= cantidad;
    await producto.save();

    const subtotal = producto.price * cantidad;
    totalAmount += subtotal;

    productosComprados.push({
      nombre: producto.title,
      precio: producto.price,
      cantidad,
      subtotal,
    });

    console.log(`Producto comprado: ${producto.title}`);
  } else {
    productosNoProcesados.push(producto._id);
    console.log(`Producto sin stock suficiente: ${producto.title}`);
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
      message: "Proceso de compra finalizado",
      ticket,
      productosNoProcesados,
    });

  } catch (error) {
    console.error("Error al finalizar compra:", error);
    return res.status(500).json({ status: "error", message: "Error interno al finalizar la compra" });
  }
};
