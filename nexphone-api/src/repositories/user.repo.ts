import { isValidObjectId } from "mongoose";
import { User, type UserAttrs, type UserDocument } from "../models/user.model";

export const userRepo = {
  async findById(id: unknown, selectSecrets = false): Promise<UserDocument | null> {
    if (!isValidObjectId(id)) return null;
    const query = User.findById(id);
    if (selectSecrets) {
      query.select("+passwordHash +passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts");
    }
    return query;
  },

  async findByEmail(email: string, selectSecrets = false): Promise<UserDocument | null> {
    const query = User.findOne({ email: email.toLowerCase() });
    if (selectSecrets) {
      query.select("+passwordHash +passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts");
    }
    return query;
  },

  async findByPhone(phoneNormalized: string, selectSecrets = false): Promise<UserDocument | null> {
    const query = User.findOne({ phoneNormalized });
    if (selectSecrets) {
      query.select("+passwordHash +passwordResetCodeHash +passwordResetExpiresAt +passwordResetAttempts");
    }
    return query;
  },

  async create(data: Partial<UserAttrs>): Promise<UserDocument> {
    return User.create(data);
  },

  async bumpTokenVersion(userId: unknown): Promise<void> {
    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
  },

  async count(filter: Record<string, any> = {}): Promise<number> {
    return User.countDocuments(filter);
  },

  async find(filter: Record<string, any> = {}, sort: Record<string, any> = { createdAt: -1 }): Promise<UserDocument[]> {
    return User.find(filter).sort(sort as any);
  },
};
