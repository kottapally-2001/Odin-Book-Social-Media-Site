import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "secret";
export interface AuthRequest extends Request {
  file: any; userId?: number 
}
export default function auth(req: AuthRequest, res: Response, next: NextFunction){
  const authHeader = req.headers.authorization;
  if(!authHeader) return res.status(401).json({error:"Missing token"});
  const token = authHeader.split(" ")[1];
  try{
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.userId = payload.userId;
    next();
  } catch(e){
    return res.status(401).json({error:"Invalid token"});
  }
}
