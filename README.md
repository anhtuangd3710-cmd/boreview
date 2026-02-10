# Blog Website with Admin Dashboard

A production-ready blog website built with Next.js 14 (App Router), featuring an admin dashboard, SEO optimization, and Google AdSense compliance.

## 🚀 Features

### Public Features
- 📝 Blog listing with pagination and search
- 📖 Article detail pages with YouTube video support
- 🏷️ Categories and tags
- 🌙 Dark mode support
- 📱 Mobile responsive design
- 🔍 SEO optimized with meta tags, sitemap, and Schema.org markup

### Admin Features
- 🔐 Secure authentication with NextAuth
- 📊 Dashboard with statistics
- ✏️ Rich text editor (TipTap)
- 📸 YouTube video embedding
- 💾 Draft and publish mode
- 🗂️ Category management

### SEO & AdSense Ready
- Dynamic metadata generation
- Auto-generated sitemap.xml and robots.txt
- Schema.org Article markup
- Google AdSense integration slots
- Required policy pages (About, Contact, Privacy Policy, Terms)

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with header/footer
│   ├── page.tsx            # Homepage
│   ├── globals.css         # Global styles
│   ├── sitemap.ts          # Auto-generated sitemap
│   ├── robots.ts           # Robots.txt config
│   ├── blog/
│   │   ├── page.tsx        # Blog listing
│   │   └── [slug]/page.tsx # Article detail
│   ├── admin/
│   │   ├── layout.tsx      # Admin layout
│   │   ├── login/page.tsx  # Login page
│   │   ├── dashboard/page.tsx
│   │   └── posts/          # Posts CRUD
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── privacy-policy/page.tsx
│   └── terms/page.tsx
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── posts/route.ts
│   └── posts/[id]/route.ts
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── PostCard.tsx
│   ├── RichEditor.tsx
│   ├── AdSense.tsx
│   ├── Pagination.tsx
│   └── SearchBar.tsx
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── seo.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── middleware.ts
```

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **ORM:** Prisma
- **Auth:** NextAuth.js
- **Editor:** TipTap

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd bowebsite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed the database (creates admin user)**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open the application**
   - Website: http://localhost:3000
   - Admin: http://localhost:3000/admin/login
   - Default credentials: admin@example.com / Admin123!

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"    # SQLite for dev
# DATABASE_URL="postgresql://..."  # PostgreSQL for prod

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key"

# Admin (for seeding)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"

# Google AdSense (optional)
NEXT_PUBLIC_ADSENSE_ID="ca-pub-XXXXXXXXXXXXXXXX"

# Site Config
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
NEXT_PUBLIC_SITE_NAME="My Blog"
NEXT_PUBLIC_SITE_DESCRIPTION="Your blog description"
```

## 🚢 Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. For PostgreSQL, use Vercel Postgres or external provider
5. Deploy!

### Production Database Setup

Update `prisma/schema.prisma` for PostgreSQL:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 💰 Google AdSense Setup

1. Apply for AdSense at https://adsense.google.com
2. Add your publisher ID to `NEXT_PUBLIC_ADSENSE_ID`
3. Replace slot IDs in `components/AdSense.tsx`
4. Ensure compliance with AdSense policies

## 📝 Content Guidelines

For AdSense approval:
- ✅ Original content (minimum 600 words per article)
- ✅ No copyrighted material
- ✅ Only embed your own YouTube videos
- ✅ No adult/violent content
- ✅ No misleading clickbait
- ✅ Include About, Contact, Privacy Policy, Terms pages

## 📄 License

MIT License

