import { Router } from "express";
import { optionalAuthenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  addToCartSchema,
  updateCartItemQuantitySchema,
  applyPromoSchema,
  calculateCartSchema,
} from "../validators/cart.validator";
import * as controller from "../controllers/cart.controller";

export const cartRouter = Router();

// ==========================================
// 1. Get Cart
// ==========================================
cartRouter.get("/", optionalAuthenticate, controller.getCart);

// ==========================================
// 2. Add to Cart
// ==========================================
cartRouter.post("/items", optionalAuthenticate, validate({ body: addToCartSchema }), controller.addToCart);
cartRouter.post("/", optionalAuthenticate, validate({ body: addToCartSchema }), controller.addToCart);

// ==========================================
// 3. Update Cart Item Quantity
// ==========================================
cartRouter.put("/items/:itemId", optionalAuthenticate, validate({ body: updateCartItemQuantitySchema }), controller.updateCartItemQuantity);
cartRouter.patch("/items/:itemId", optionalAuthenticate, validate({ body: updateCartItemQuantitySchema }), controller.updateCartItemQuantity);

// ==========================================
// 4. Remove Cart Item
// ==========================================
cartRouter.delete("/items/:itemId", optionalAuthenticate, controller.removeCartItem);

// ==========================================
// 5. Clear Cart
// ==========================================
cartRouter.delete("/", optionalAuthenticate, controller.clearCart);
cartRouter.delete("/items", optionalAuthenticate, controller.clearCart);
cartRouter.post("/clear", optionalAuthenticate, controller.clearCart);

// ==========================================
// 6. Calculate Subtotal and Total
// ==========================================
cartRouter.post("/calculate", optionalAuthenticate, validate({ body: calculateCartSchema }), controller.calculateTotals);

// ==========================================
// 7. Promo Code Management
// ==========================================
cartRouter.post("/promo", optionalAuthenticate, validate({ body: applyPromoSchema }), controller.applyPromoCode);
cartRouter.delete("/promo", optionalAuthenticate, controller.removePromoCode);
