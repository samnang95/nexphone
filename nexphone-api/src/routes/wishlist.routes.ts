import { Router } from "express";
import { optionalAuthenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { addToWishlistSchema, toggleWishlistSchema } from "../validators/wishlist.validator";
import * as controller from "../controllers/wishlist.controller";

export const wishlistRouter = Router();

// ==========================================
// 1. Get Wishlist
// ==========================================
wishlistRouter.get("/", optionalAuthenticate, controller.getWishlist);

// ==========================================
// 2. Add Phone to Wishlist
// ==========================================
wishlistRouter.post("/items", optionalAuthenticate, validate({ body: addToWishlistSchema }), controller.addToWishlist);
wishlistRouter.post("/", optionalAuthenticate, validate({ body: addToWishlistSchema }), controller.addToWishlist);

// ==========================================
// 3. Toggle Phone in Wishlist
// ==========================================
wishlistRouter.post("/toggle", optionalAuthenticate, validate({ body: toggleWishlistSchema }), controller.toggleWishlist);

// ==========================================
// 4. Check if Phone is in Wishlist
// ==========================================
wishlistRouter.get("/check/:productId", optionalAuthenticate, controller.checkWishlist);

// ==========================================
// 5. Remove Phone from Wishlist
// ==========================================
wishlistRouter.delete("/items/:productId", optionalAuthenticate, controller.removeFromWishlist);
wishlistRouter.delete("/:productId", optionalAuthenticate, controller.removeFromWishlist);

// ==========================================
// 6. Clear Wishlist
// ==========================================
wishlistRouter.delete("/", optionalAuthenticate, controller.clearWishlist);
wishlistRouter.delete("/items", optionalAuthenticate, controller.clearWishlist);
wishlistRouter.post("/clear", optionalAuthenticate, controller.clearWishlist);
