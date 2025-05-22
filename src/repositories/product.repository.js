import ProductDAO from "../dao/product.dao.js";

class ProductRepository {
  async getproducts(filters) {
    return await ProductDAO.getproducts(filters);
  }

  async getById(id) {
    return await ProductDAO.getById(id);
  }

  async createProduct(productData) {
    return await ProductDAO.createProduct(productData);
  }

  async updateProduct(id, updateData) {
    return await ProductDAO.updateProduct(id, updateData);
  }

  async deleteProduct(id) {
    return await ProductDAO.deleteProduct(id);
  }
}

export default new ProductRepository();
