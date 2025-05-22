import { Router } from "express";
import {
  getproducts,
  getById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import passport from "passport";
import { authorize } from "../middleware/authorization.js";

const router = Router();

router.get("/", passport.authenticate("jwt", { session: false }),
  authorize(["admin"]), getproducts);
router.get("/:pid", passport.authenticate("jwt", { session: false }),
  authorize(["admin"]), getById);
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  authorize(["admin"]),
  createProduct
);
router.put(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  authorize(["admin"]),
  updateProduct
);
router.delete(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  authorize(["admin"]),
  deleteProduct
);

export default router;
