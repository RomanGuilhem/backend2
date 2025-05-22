import { processPurchase } from "../services/cart.service.js";

const purchaseCart = async (req, res) => {
  try {
    const { ticket, productosNoProcesados } = await processPurchase(req.user);

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
