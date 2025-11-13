# Portfolio 2026

Professional portfolio website built with Next.js 16, featuring interactive animations powered by GSAP and anime.js.

## 🚀 Live Site

Visit the live site at: [portfolio-2026.vercel.app](https://portfolio-2026.vercel.app)

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4
- **Animations:** GSAP 3.13, anime.js 4.2
- **Language:** TypeScript 5
- **Deployment:** Vercel
- **CI/CD:** GitHub Actions + Vercel Integration

## 📦 Project Structure

```
Portfolio2026/
├── next/                    # Next.js application
│   ├── app/
│   │   ├── components/     # React components
│   │   │   ├── Hero.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Projects.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── LogoOverlay.tsx
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useHeroAnimation.ts
│   │   │   ├── useHeroCanvas.ts
│   │   │   ├── useLogoScrollAnimation.ts
│   │   │   ├── useProjectAnimations.ts
│   │   │   ├── useTileAnimations.ts
│   │   │   ├── useAnimeInteractions.ts
│   │   │   └── useDockNavigation.ts
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── public/             # Static assets
│   ├── package.json
│   └── tsconfig.json
├── .github/
│   └── workflows/
│       └── vercel-deploy.yml  # CI/CD workflow
├── vercel.json             # Vercel configuration
└── README.md
```

## 🏃 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/behrensd/portfolio-2026.git
   cd portfolio-2026
   ```

2. **Install dependencies:**
   ```bash
   cd next
   npm install
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🚢 Deployment

### Automatic Deployment (Recommended)

The project is configured for automatic deployment:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Vercel Integration:**
   - Vercel automatically detects the push
   - Builds the project
   - Deploys to production
   - Updates the live site

### Manual Deployment

If you need to deploy manually:

```bash
vercel --prod
```

## 📊 CI/CD Pipeline

The project uses a hybrid CI/CD approach:

1. **GitHub Actions** - Runs on every push:
   - Checks out code
   - Installs dependencies
   - Runs linter
   - Builds the project

2. **Vercel Integration** - Automatic deployment:
   - Triggered on push to main branch
   - Handles preview deployments for PRs
   - Manages production deployments
   - Provides deployment URLs and logs

## 🔗 Links

- **Live Site:** https://portfolio-2026.vercel.app
- **GitHub Repository:** https://github.com/behrensd/portfolio-2026
- **Vercel Dashboard:** https://vercel.com/behrensds-projects/portfolio-2026

## 📝 Features

- ✨ Interactive particle system with scroll-reactive behaviors
- 🎨 Smooth scroll animations using GSAP ScrollTrigger
- 📱 Fully responsive design
- 🌐 macOS-style dock navigation
- 🎭 Dynamic logo overlay with scroll effects
- 🚀 Optimized performance with Next.js 16
- 🎪 Project showcase with animated mockups

## 🤝 Contributing

This is a personal portfolio project, but feel free to fork and use it as inspiration for your own portfolio!

## 📄 License

MIT License - feel free to use this project for your own portfolio.

## 👨‍💻 Author

**Dom Behrens**
- Website: [BAI Solutions](https://portfolio-2026.vercel.app)
- Location: Hamburg, Germany

---

Built with ❤️ using Next.js and deployed on Vercel
