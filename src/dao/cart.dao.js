import Cart from "./models/Cart.js";
import Product from "./models/Product.js";
import Ticket from "./models/Ticket.js";

class CartDAO {
  async getCartByUser(userId) {
    return Cart.findOne({ user: userId }).populate("products.product");
  }

  async createCart(userId) {
    return Cart.create({ user: userId, products: [] });
  }

  async addProductToCart(userId, productId, quantity = 1) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, products: [] });
    }

    const product = await Product.findById(productId);
    if (!product) return null;

    const index = cart.products.findIndex(p => p.product.toString() === productId);
    if (index !== -1) {
      cart.products[index].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    return cart.populate("products.product");
  }

  async removeProductFromCart(userId, productId) {
    return Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { products: { product: productId } } },
      { new: true }
    ).populate("products.product");
  }

  async clearCart(userId) {
    return Cart.findOneAndUpdate(
      { user: userId },
      { products: [] },
      { new: true }
    );
  }

  async updateCart(userId, products) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return null;

    cart.products = products;
    await cart.save();
    return cart.populate("products.product");
  }

  async getCartById(cartId) {
    return Cart.findById(cartId).populate("products.product");
  }

  async addProductToCartByCartId(cartId, productId, quantity = 1) {
    const cart = await Cart.findById(cartId);
    if (!cart) return null;

    const product = await Product.findById(productId);
    if (!product) return null;

    const index = cart.products.findIndex(p => p.product.toString() === productId);
    if (index !== -1) {
      cart.products[index].quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    return cart.populate("products.product");
  }

async finalizePurchase(user) {
  const cart = await Cart.findOne({ user: user._id }).populate("products.product");
  if (!cart || cart.products.length === 0) return { error: "empty" };

  let totalAmount = 0;
  const unprocessedProducts = [];
  const purchasedProducts = [];

  for (const item of cart.products) {
    const product = item.product;
    const quantity = item.quantity;

    if (!product || typeof product.stock !== "number") {
      if (product?._id) {
        unprocessedProducts.push(product._id.toString());
      }
      continue;
    }

    if (product.stock < quantity) {
      unprocessedProducts.push(product._id.toString());
      continue;
    }

    product.stock -= quantity;
    await product.save();

    const subtotal = product.price * quantity;
    totalAmount += subtotal;

    purchasedProducts.push({
      title: product.title,
      price: product.price,
      quantity,
      subtotal,
    });
  }

  let ticket = null;
  if (purchasedProducts.length > 0) {
    ticket = await Ticket.create({
      amount: totalAmount,
      purchaser: user.email,
      products: purchasedProducts,
    });
  }

  cart.products = cart.products.filter(item =>
    unprocessedProducts.includes(item.product?._id?.toString())
  );

  await cart.save();

  return {
    ticket,
    unprocessedProducts,
  };
}

}

export default new CartDAO();
