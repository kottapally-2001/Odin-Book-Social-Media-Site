import { Router } from "express";
import prisma from "../prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || Math.random().toString(36).slice(2);


router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if(!email || !password || !name) return res.status(400).json({error:"Missing fields"});
  const existing = await prisma.user.findUnique({ where: { email }});
  if(existing) return res.status(400).json({error:"Email already in use"});
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hashed }});
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email }});
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({error:"Missing fields"});
  const user = await prisma.user.findUnique({ where: { email }});
  if(!user) return res.status(400).json({error:"Invalid credentials"});
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({error:"Invalid credentials"});
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email }});
});

export default router;
