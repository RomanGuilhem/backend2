import CartDAO from "../dao/cart.dao.js";

class CartRepository {
  async getCartByUser(userId) {
    return await CartDAO.getCartByUser(userId);
  }

  async createCart(userId) {
    return await CartDAO.createCart(userId);
  }

  async addProductToCart(userId, productId, quantity) {
    return await CartDAO.addProductToCart(userId, productId, quantity);
  }

  async removeProductFromCart(userId, productId) {
    return await CartDAO.removeProductFromCart(userId, productId);
  }

  async clearCart(userId) {
    return await CartDAO.clearCart(userId);
  }

  async updateCart(userId, products) {
    return await CartDAO.updateCart(userId, products);
  }

async finalizePurchase(cartId, user) {
    return await CartDAO.finalizePurchase(cartId, user);
  }
}

export default new CartRepository();
