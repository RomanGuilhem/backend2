import { Router } from "express";
import passport from "passport";
import { authorize } from "../middleware/authorization.js";
import * as cartController from "../controllers/cart.controller.js";

const cartRouter = Router();
const auth = passport.authenticate("jwt", { session: false });
cartRouter.get("/:cid", auth, authorize("user"), cartController.getCartById);
cartRouter.get("/", auth, authorize("user"), cartController.getUserCart);
cartRouter.post("/", auth, authorize("user"), cartController.createCart);
cartRouter.post("/products/:pid", auth, authorize("user"), cartController.addProductToCart);
cartRouter.delete("/:cid/product/:pid", auth, authorize("user"), cartController.removeProductFromCart);
cartRouter.delete("/", auth, authorize("user"), cartController.clearCart);
cartRouter.put("/", auth, authorize("user"), cartController.updateCart);
cartRouter.put("/:cid", auth, authorize("user"), cartController.updateCart);
cartRouter.post("/:cid/purchase", auth, authorize("user"), cartController.finalizePurchase);
cartRouter.post("/:cid/product/:pid", auth, authorize("user"), cartController.addProductToCartById);

export default cartRouter;
