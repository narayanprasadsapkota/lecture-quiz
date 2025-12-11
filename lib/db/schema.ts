import { pgTable, text, timestamp, serial, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Password is required
  createdAt: timestamp("created_at").defaultNow(),
});

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subjectId: integer("subject_id").references(() => subjects.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id, {
    onDelete: "cascade",
  }),
  text: text("text").notNull(),
  options: text("options").array().notNull(), // Array of 4 options
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation").notNull(),
  order: integer("order").notNull().default(0), // Order of question appearance
  createdAt: timestamp("created_at").defaultNow(),
});
