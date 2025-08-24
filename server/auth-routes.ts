import { loginSchema, registerSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import type { Express } from "express";
import jwt from "jsonwebtoken";
import type { IStorage } from "./storage";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export function registerAuthRoutes(app: Express, storage: IStorage) {
  // Register route
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);

      // Create user
      const user = await storage.createUser({
        email: validatedData.email,
        password: hashedPassword,
        firstName: "", // Default empty value
        lastName: "", // Default empty value
        companyName: "", // Default empty value
        phone: "", // Default empty value
        isActive: "true",
      });

      // Don't return the password in the response
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword,
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid input data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user by email
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Check if user is active
      if (user.isActive !== "true") {
        return res.status(401).json({ message: "Account is deactivated" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Don't return the password in the response
      const { password, ...userWithoutPassword } = user;

      res.json({
        message: "Login successful",
        token,
        user: userWithoutPassword,
      });
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid input data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Verify token route (for checking if user is still authenticated)
  app.get("/api/auth/verify", authenticateToken, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const user = await storage.getUser(userId);

      if (!user || user.isActive !== "true") {
        return res.status(401).json({ message: "User not found or inactive" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout route (client-side handles token removal, but we can add server-side logic if needed)
  app.post("/api/auth/logout", authenticateToken, (req, res) => {
    res.json({ message: "Logout successful" });
  });
}

// Middleware to authenticate JWT token
export function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}
