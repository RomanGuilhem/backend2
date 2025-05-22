import Product from "./models/Product.js";

class ProductDAO {
  static async getproducts({ limit = 10, page = 1, sort, query, category, disponible }) {
    let filter = {};
    if (query) filter.title = { $regex: query, $options: "i" };
    if (category && category !== "todas") filter.category = category;

    if (disponible !== undefined && disponible !== "todas") {
      const disponibleBool = disponible === "true";
      filter.stock = disponibleBool ? { $gt: 0 } : { $lte: 0 };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort && sort !== "none" ? { price: sort === "asc" ? 1 : -1 } : {},
      lean: true,
    };

    const result = await Product.paginate(filter, options);

    const productosConDisponibilidad = result.docs.map((producto) => ({
      ...producto,
      disponible: producto.stock > 0,
    }));

    return {
      payload: productosConDisponibilidad,
      totalPages: result.totalPages,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.hasPrevPage ? result.prevPage : null,
      nextPage: result.hasNextPage ? result.nextPage : null,
    };
  }

  static async getById(id) {
    return await Product.findById(id).lean();
  }

  static async createProduct(data) {
    const product = new Product(data);
    return await product.save();
  }

  static async updateProduct(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  }

  static async deleteProduct(id) {
    return await Product.findByIdAndDelete(id);
  }
}

export default ProductDAO;
