# Social App - Backend

Instructions:

1. Copy .env.example to .env and set DATABASE_URL and JWT_SECRET.
2. Install dependencies: `npm install`
3. Run prisma migrate and generate:
   - `npx prisma migrate dev --name init`
   - `npx prisma generate`
4. Start server: `npm run dev`
5. API endpoints:
   - POST /api/auth/register { name, email, password }
   - POST /api/auth/login { email, password }
   - GET /api/posts/feed (auth)
   - POST /api/posts { content } (auth)
   - POST /api/posts/:postId/like (auth)
   - POST /api/posts/:postId/unlike (auth)
   - POST /api/posts/:postId/comment { content } (auth)
   - POST /api/users/:id/follow (auth)
   - POST /api/users/:id/unfollow (auth)
