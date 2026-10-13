import type { Request, Response } from "express";
import * as userService from "../services/user.service";

export async function getProfile(req: Request, res: Response): Promise<void> {
  const profile = await userService.getProfile(req.auth!.user._id);
  res.json({
    success: true,
    user: profile,
    ...profile,
  });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const updated = await userService.updateProfile(req.auth!.user._id, req.body);
  res.json({
    success: true,
    message: "Profile updated successfully.",
    user: updated,
    ...updated,
  });
}

export async function updateAvatar(req: Request, res: Response): Promise<void> {
  const updated = await userService.updateAvatar(req.auth!.user._id, req.body.avatarUrl);
  res.json({
    success: true,
    message: "Avatar updated successfully.",
    user: updated,
    avatarUrl: updated.avatarUrl,
  });
}

export async function getAddresses(req: Request, res: Response): Promise<void> {
  const addresses = await userService.getAddresses(req.auth!.user._id);
  res.json(addresses);
}

export async function addAddress(req: Request, res: Response): Promise<void> {
  const addresses = await userService.addAddress(req.auth!.user._id, req.body);
  const newAddress = addresses[addresses.length - 1];
  res.status(201).json({
    success: true,
    message: "Address added successfully.",
    address: newAddress,
    addresses,
  });
}

export async function updateAddress(req: Request, res: Response): Promise<void> {
  const addressId = String(req.params.addressId || "");
  const addresses = await userService.updateAddress(req.auth!.user._id, addressId, req.body);
  const updatedAddress = addresses.find((a) => a.id === addressId);
  res.json({
    success: true,
    message: "Address updated successfully.",
    address: updatedAddress,
    addresses,
  });
}

export async function deleteAddress(req: Request, res: Response): Promise<void> {
  const addressId = String(req.params.addressId || "");
  const addresses = await userService.deleteAddress(req.auth!.user._id, addressId);
  res.json({
    success: true,
    message: "Address removed successfully.",
    addresses,
  });
}

export async function setDefaultAddress(req: Request, res: Response): Promise<void> {
  const addressId = String(req.params.addressId || "");
  const addresses = await userService.setDefaultAddress(req.auth!.user._id, addressId);
  res.json({
    success: true,
    message: "Default address set successfully.",
    addresses,
  });
}
