import { Router } from "express";
import prisma from "../prisma";
import auth, { AuthRequest } from "../middleware/auth";
const router = Router();

router.get("/me", auth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId }, include: { followers: true, following: true } });
  res.json(user);
});

router.get("/me", auth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  });

  res.json(user);
});


router.post("/:id/follow", auth, async (req: AuthRequest, res) => {
  const followingId = Number(req.params.id);
  const followerId = req.userId!;
  if(followingId === followerId) return res.status(400).json({ error: "Can't follow yourself" });
  try{
    await prisma.follow.create({ data: { followerId, followingId }});
    res.json({ ok: true });
  } catch(e){
    res.status(400).json({ error: "Already following or invalid" });
  }
});

router.post("/:id/unfollow", auth, async (req: AuthRequest, res) => {
  const followingId = Number(req.params.id);
  const followerId = req.userId!;
  await prisma.follow.deleteMany({ where: { followerId, followingId }});
  res.json({ ok: true });
});

export default router;
