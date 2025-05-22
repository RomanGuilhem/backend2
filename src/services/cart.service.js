import cartRepository from "../repositories/cart.repository.js";
import cartDao from "../dao/cart.dao.js";

class CartService {
  async getUserCart(userId) {
    return cartRepository.getCartByUser(userId);
  }

  async getCartById(cartId) {
    return cartDao.getCartById(cartId);
  }

  async createCart(userId) {
    return cartRepository.createCart(userId);
  }

  async addProductToCart(userId, productId, quantity) {
    const updatedCart = await cartRepository.addProductToCart(userId, productId, quantity);
    if (!updatedCart) throw new Error("Producto no encontrado o error al agregar");
    return updatedCart;
  }

  async removeProductFromCart(userId, productId) {
    return cartRepository.removeProductFromCart(userId, productId);
  }

  async clearCart(userId) {
    return cartRepository.clearCart(userId);
  }

  async updateCart(userId, products) {
    const cart = await cartRepository.updateCart(userId, products);
    if (!cart) throw new Error("Carrito no encontrado");
    return cart;
  }

  async finalizePurchase(user) {
    const result = await cartRepository.finalizePurchase(user);
    if (result?.error === "empty") {
      throw new Error("El carrito está vacío");
    }
    return result;
  }

  async isCartOwnedByUser(cartId, userId) {
    const cart = await cartDao.getCartById(cartId);
    return cart && cart.user.toString() === userId;
  }

  async addProductToCartById(cartId, productId) {
    return cartDao.addProductToCartByCartId(cartId, productId);
  }
}

const cartService = new CartService();
export default cartService;
