import { Types } from "mongoose";
import { HttpError } from "../utils/httpError";
import { User, type AddressItem, type UserDocument } from "../models/user.model";
import { serializeAuthUser } from "./auth.service";
import type { AddressInput, UpdateProfileInput } from "../schemas/user.schemas";

export function serializeUserProfile(user: UserDocument) {
  const base = serializeAuthUser(user);
  return {
    ...base,
    addresses: user.addresses || [],
  };
}

export async function getProfile(userId: unknown) {
  const user = await User.findById(userId);
  if (!user) throw HttpError.unauthorized("User session not found.", "USER_NOT_FOUND");
  if (user.status === "disabled") throw HttpError.forbidden("Account suspended.", "ACCOUNT_DISABLED");
  return serializeUserProfile(user);
}

export async function updateProfile(userId: unknown, input: UpdateProfileInput) {
  const user = await User.findById(userId);
  if (!user) throw HttpError.unauthorized("User session not found.", "USER_NOT_FOUND");
  if (user.status === "disabled") throw HttpError.forbidden("Account suspended.", "ACCOUNT_DISABLED");

  if (input.name !== undefined) user.name = input.name;
  if (input.phone !== undefined) {
    user.phone = input.phone;
    user.phoneNormalized = input.phone ? input.phone.replace(/\D/g, "") : undefined;
  }
  if (input.company !== undefined) user.company = input.company;

  await user.save();
  return serializeUserProfile(user);
}

export async function updateAvatar(userId: unknown, avatarUrl: string) {
  const user = await User.findById(userId);
  if (!user) throw HttpError.unauthorized("User session not found.", "USER_NOT_FOUND");
  if (user.status === "disabled") throw HttpError.forbidden("Account suspended.", "ACCOUNT_DISABLED");

  user.avatarUrl = avatarUrl.trim();
  await user.save();
  return serializeUserProfile(user);
}

function normalizeDefaultAddress(list: AddressItem[]): AddressItem[] {
  if (list.length === 0) return list;
  const defaultIdx = list.findIndex((a) => a.isDefault);
  const targetIdx = defaultIdx === -1 ? 0 : defaultIdx;
  return list.map((a, idx) => ({
    ...a,
    isDefault: idx === targetIdx,
  }));
}

export async function getAddresses(userId: unknown): Promise<AddressItem[]> {
  const user = await User.findById(userId);
  if (!user) throw HttpError.unauthorized("User session not found.", "USER_NOT_FOUND");
  return (user.addresses || []) as AddressItem[];
}

export async function addAddress(userId: unknown, input: AddressInput): Promise<AddressItem[]> {
  const user = await User.findById(userId);
  if (!user) throw HttpError.unauthorized("User session not found.", "USER_NOT_FOUND");
  if (user.status === "disabled") throw HttpError.forbidden("Account suspended.", "ACCOUNT_DISABLED");

  const current = (user.addresses || []) as AddressItem[];
  const makeDefault = Boolean(input.isDefault) || current.length === 0;

  const newAddress: AddressItem = {
    ...input,
    id: `addr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    isDefault: makeDefault,
    createdAt: new Date(),
  };

  const updatedAddresses = current.map((a) => (makeDefault ? { ...a, isDefault: false } : a));
  updatedAddresses.push(newAddress);

  user.addresses = normalizeDefaultAddress(updatedAddresses) as any;
  await user.save();
  return user.addresses as AddressItem[];
}

export async function updateAddress(
  userId: unknown,
  addressId: string,
  input: Partial<AddressInput>
): Promise<AddressItem[]> {
  const user = await User.findById(userId);
  if (!user) throw HttpError.unauthorized("User session not found.", "USER_NOT_FOUND");
  if (user.status === "disabled") throw HttpError.forbidden("Account suspended.", "ACCOUNT_DISABLED");

  const current = (user.addresses || []) as AddressItem[];
  const exists = current.some((a) => a.id === addressId);
  if (!exists) throw HttpError.notFound("Delivery address not found.", "ADDRESS_NOT_FOUND");

  const makeDefault = Boolean(input.isDefault);
  const next = current.map((a) => {
    if (a.id === addressId) {
      return { ...a, ...input, isDefault: makeDefault ? true : (input.isDefault === false ? false : a.isDefault) };
    }
    return makeDefault ? { ...a, isDefault: false } : a;
  });

  user.addresses = normalizeDefaultAddress(next) as any;
  await user.save();
  return user.addresses as AddressItem[];
}

export async function deleteAddress(userId: unknown, addressId: string): Promise<AddressItem[]> {
  const user = await User.findById(userId);
  if (!user) throw HttpError.unauthorized("User session not found.", "USER_NOT_FOUND");
  if (user.status === "disabled") throw HttpError.forbidden("Account suspended.", "ACCOUNT_DISABLED");

  const current = (user.addresses || []) as AddressItem[];
  const target = current.find((a) => a.id === addressId);
  if (!target) throw HttpError.notFound("Delivery address not found.", "ADDRESS_NOT_FOUND");

  const remaining = current.filter((a) => a.id !== addressId);
  user.addresses = normalizeDefaultAddress(remaining) as any;
  await user.save();
  return user.addresses as AddressItem[];
}

export async function setDefaultAddress(userId: unknown, addressId: string): Promise<AddressItem[]> {
  const user = await User.findById(userId);
  if (!user) throw HttpError.unauthorized("User session not found.", "USER_NOT_FOUND");
  if (user.status === "disabled") throw HttpError.forbidden("Account suspended.", "ACCOUNT_DISABLED");

  const current = (user.addresses || []) as AddressItem[];
  const exists = current.some((a) => a.id === addressId);
  if (!exists) throw HttpError.notFound("Delivery address not found.", "ADDRESS_NOT_FOUND");

  const next = current.map((a) => ({ ...a, isDefault: a.id === addressId }));
  user.addresses = next as any;
  await user.save();
  return user.addresses as AddressItem[];
}
