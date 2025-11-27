import { Router } from "express";
import prisma from "../prisma";
import auth, { AuthRequest } from "../middleware/auth";
import { upload } from "../utils/multer";
import cloudinary from "../utils/cloudinary";

const router = Router();

/* ---------------------- CREATE POST (TEXT + IMAGE) ---------------------- */
router.post("/", auth, upload.single("image"), async (req: AuthRequest, res) => {
  const { content } = req.body;
  let imageUrl = null;

  if (req.file) {
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "minisocial" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    imageUrl = result.secure_url;
  }

  const post = await prisma.post.create({
    data: {
      content,
      imageUrl,
      authorId: req.userId!,
    },
    include: { author: true, likes: true, comments: { include: { author: true } } }
  });

  res.json(post);
});

/* ---------------------- GET FEED ---------------------- */
router.get("/feed", auth, async (req: AuthRequest, res) => {
  const posts = await prisma.post.findMany({
    include: {
      author: true,
      likes: true,
      comments: { include: { author: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json(posts);
});

/* ---------------------- LIKE POST ---------------------- */
router.post("/:postId/like", auth, async (req: AuthRequest, res) => {
  const postId = Number(req.params.postId);
  const userId = req.userId!;

  try {
    await prisma.like.create({
      data: { postId, userId }
    });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: "Already liked or invalid" });
  }
});

/* ---------------------- UNLIKE POST ---------------------- */
router.post("/:postId/unlike", auth, async (req: AuthRequest, res) => {
  const postId = Number(req.params.postId);
  const userId = req.userId!;

  await prisma.like.deleteMany({
    where: { postId, userId }
  });

  res.json({ ok: true });
});

/* ---------------------- COMMENT ON POST ---------------------- */
router.post("/:postId/comment", auth, async (req: AuthRequest, res) => {
  const postId = Number(req.params.postId);
  const { content } = req.body;

  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId: req.userId!,
      content
    },
    include: { author: true }
  });

  res.json(comment);
});

/* ---------------------- DELETE POST ---------------------- */
router.delete("/:postId", auth, async (req: AuthRequest, res) => {
  const postId = Number(req.params.postId);
  const userId = req.userId!;

  const post = await prisma.post.findUnique({ where: { id: postId } });

  if (!post) return res.status(404).json({ error: "Post not found" });
  if (post.authorId !== userId) return res.status(403).json({ error: "Not allowed" });

  await prisma.like.deleteMany({ where: { postId } });
  await prisma.comment.deleteMany({ where: { postId } });
  await prisma.post.delete({ where: { id: postId } });

  res.json({ ok: true });
});

export default router;
