import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Image Transformation Schema
export const transformationSchema = z.object({
  imageData: z.string(),
});

// Image Transformation Response Schema
export const transformationResponseSchema = z.object({
  transformedImage: z.string(),
  success: z.boolean(),
  message: z.string().optional(),
  method: z.enum(['client-side', 'huggingface', 'openai', 'ai']).optional(),
});

export type TransformationRequest = z.infer<typeof transformationSchema>;
export type TransformationResponse = z.infer<typeof transformationResponseSchema>;
