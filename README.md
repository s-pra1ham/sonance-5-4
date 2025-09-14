# Sonance - Modern Music Streaming Web App

A sleek, modern music streaming web application built with Next.js and React, featuring a responsive UI and advanced music playback capabilities.

## 🎵 Features

- **Music Player**: Full-featured music player with controls for play/pause, skip, volume, and progress tracking
- **Responsive Design**: Beautiful UI that adapts seamlessly across desktop, tablet, and mobile devices
- **Music Library**: Browse through songs, albums, playlists, and genres
- **Personalized Experience**: Recently played tracks, liked songs, and saved content
- **Expanded Views**: Detailed song cards with lyrics, artist info, and similar tracks
- **Modern UI**: Sleek animations, transitions, and intuitive navigation

## 🛠️ Tech Stack

- **Frontend Framework**: [Next.js 15](https://nextjs.org/) (with App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [React Icons](https://react-icons.github.io/react-icons/)
- **TypeScript**: Type-safe code for better development experience
- **Turbopack**: Enhanced development performance

## 🤖 AI Integration

This Web app was developed with the assistance of open source LLM models including:

- **Qwen**: Used during development for codebase generation and architecture design
- **Llama**: Used during development for UI/UX improvements and feature implementation
- **Deepseek**: Used during development for code optimization and technical documentation

## 🏆 Hackathon Submission

This project was created for the Frontend UI Hackathon 2025 #2, showcasing advanced UI/UX techniques and integration of modern technologies in web development.

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your configuration
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📦 Deployment

### Vercel (Recommended)

The easiest way to deploy this app is using [Vercel](https://vercel.com/):

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in Vercel
3. Set your environment variables in the Vercel dashboard
4. Deploy

### Docker Deployment

This app can be deployed using Docker:

1. Build the Docker image:
   ```bash
   docker build -t sonance-app .
   ```
2. Run the container:
   ```bash
   docker run -p 3000:3000 -e NODE_ENV=production sonance-app
   ```

### Self-Hosting

1. Build for production:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

The app is configured for production with:

- Standalone output mode for easy deployment
- Image optimization and caching
- Gzip compression
- Security headers

## 🏭 Production Readiness

Before deploying to production, follow these steps for optimal performance and stability:

### Image Optimization

- Use the `OptimizedImage` component for all images (src/app/components/common/OptimizedImage.tsx)
- Verify all `<img>` tags have been replaced with Next.js `<Image>` components
- Check next.config.js for proper image domain configurations

### Code Quality

- Fix React Hook dependency warnings (see scripts/prod-ready.js for checklist)
- Address all TypeScript errors (temporarily disabled in next.config.js)
- Replace JavaScript-style comments in JSX with proper JSX comments
- Use proper JSX escaping for apostrophes and quotes: &apos; &quot;

### Performance

- Enable production build optimizations:
  ```bash
  npm run build
  ```
- Check Lighthouse scores and address any issues
- Review bundle size and implement code-splitting where necessary
- Implement lazy loading for non-critical components

### Security

- Remove temporary configuration options from next.config.js:
  ```js
  // Remove these once issues are fixed
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
  ```
- Add Content-Security-Policy headers
- Implement proper error handling

### Testing

- Run thorough testing across different devices and browsers
- Test keyboard navigation and screen reader accessibility
- Verify all user flows work as expected

For a complete production readiness checklist, see `scripts/prod-ready.js`.

## 🧩 Project Structure

- `src/app/`: Main application code
  - `components/`: UI components (MusicCard, NowPlayingBar, etc.)
  - `hooks/`: Custom React hooks
  - `data/`: Data models and sample content
  - `utils/`: Utility functions
  - `context/`: React context providers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
