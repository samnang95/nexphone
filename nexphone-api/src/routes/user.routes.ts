import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireDatabase } from "../middleware/requireDatabase";
import { validate } from "../middleware/validate";
import * as controller from "../controllers/user.controller";
import * as uploadController from "../controllers/upload.controller";
import { imageUpload } from "../middleware/upload";
import { addressInputSchema, updateAddressSchema, updateAvatarSchema, updateProfileSchema } from "../validators/user.validator";

export const userRouter = Router();

userRouter.use(requireDatabase);
userRouter.use(authenticate);

// Profile
userRouter.get(["/profile", "/me"], controller.getProfile);
userRouter.put("/profile", validate({ body: updateProfileSchema }), controller.updateProfile);
userRouter.patch("/profile", validate({ body: updateProfileSchema }), controller.updateProfile);

// Avatar
userRouter.post("/avatar", validate({ body: updateAvatarSchema }), controller.updateAvatar);
userRouter.put("/avatar", validate({ body: updateAvatarSchema }), controller.updateAvatar);
userRouter.post("/avatar/upload", imageUpload.single("avatar"), uploadController.uploadUserAvatar);

// Delivery Addresses
userRouter.get("/addresses", controller.getAddresses);
userRouter.post("/addresses", validate({ body: addressInputSchema }), controller.addAddress);
userRouter.put("/addresses/:addressId", validate({ body: updateAddressSchema }), controller.updateAddress);
userRouter.patch("/addresses/:addressId", validate({ body: updateAddressSchema }), controller.updateAddress);
userRouter.delete("/addresses/:addressId", controller.deleteAddress);
userRouter.patch("/addresses/:addressId/default", controller.setDefaultAddress);
userRouter.post("/addresses/:addressId/default", controller.setDefaultAddress);
