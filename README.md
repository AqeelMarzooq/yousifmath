# YousifMath — CR7 Mode ⚽

Year 5 British National Curriculum Math Learning Platform.

## Quick Start

```bash
npm install
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

## Login Credentials

| Role    | Username | Password    |
|---------|----------|-------------|
| Student | yousif   | Yousif@123! |
| Parent  | parent   | Parent@123! |

## .env.local

```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="yousifmath-cr7-secret-key-super-secure-2024"
NEXTAUTH_URL="http://localhost:3000"
```
