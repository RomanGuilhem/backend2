import * as ProductService from "../services/product.service.js";

export const getproducts = async (req, res) => {
  try {
    const data = await ProductService.getproducts(req.query);
    res.json({ status: "success", ...data });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const getById = async (req, res) => {
  try {
    const product = await ProductService.getById(req.params.pid);
    if (!product) {
      return res.status(404).json({ status: "error", error: "Producto no encontrado" });
    }
    res.json({ status: "success", product });
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json({ status: "success", product });
  } catch (error) {
    console.error("Error al crear producto:", error);
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const updated = await ProductService.updateProduct(req.params.pid, req.body);
    if (!updated) return res.status(404).json({ message: "Producto no encontrado" });
    res.json({ status: "success", product: updated });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res.status(500).json({ status: "error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deleted = await ProductService.deleteProduct(req.params.pid);
    if (!deleted) return res.status(404).json({ message: "Producto no encontrado" });
    res.json({ status: "success", message: "Producto eliminado" });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ status: "error", error: error.message });
  }
};
