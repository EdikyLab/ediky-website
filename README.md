# EdikyStudio — Website

This repository contains the public website for EdikyStudio, an AI-powered, minimalist video editor.

- Website: [https://ediky.com](https://ediky.com/)
- Contact: [bisoyi7004@gmail.com](mailto:bisoyi7004@gmail.com)

---

## Product Highlights

* GPU-accelerated playback and export (Metal / Vulkan)
* AI-assisted editing features such as auto-captions
* Minimal, creator-focused interface
* Professional export formats: H.264, HEVC, ProRes, image sequences
* Supports 4K and 10-bit color

> Note: This repository is only for the website. Core editor applications and services are in separate repositories.


## Technology Stack

* React with React Router
* Custom CSS with Bootstrap utilities
* Firebase Authentication (optional, for gated pages like a dashboard)


## Requirements

* Node.js 18+
* npm 9+

---

## Getting Started

```bash
# Clone repository
git clone https://github.com/EdikyLab/ediky-website.git
cd ediky-website

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in values as needed

# Start development server
npm start
# Open http://localhost:3000 in your browser
```

## Environment Variables

Create a `.env` file based on `.env.example`. If you are not using Firebase authentication, you can leave these blank and remove related code.

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
```


## NPM Scripts

```bash
npm start      # Start development server
npm run build  # Create production build
```


## Development Guidelines

* Use branch naming like `feat/*`, `fix/*`, `docs/*`, `chore/*`
* Follow Conventional Commits (e.g., `feat: add hero section`)
* Keep pull requests small and focused
* Ensure builds pass before merging


## Contributing

1. Open an issue for significant changes.
2. Fork the repository and create a feature branch.
3. Keep commits concise and meaningful.
4. Submit a pull request with a clear description and screenshots for UI changes.

Small contributions and fixes are welcome.


## Roadmap for Website

* Improve performance (Lighthouse score 95+)
* Add internationalization (i18n) and improve accessibility (WCAG 2.1 AA)
* Introduce a blog/changelog section
* Detect operating system automatically on the download page
* Add a minimal dashboard with release notes and early access builds



## License

© 2025 Ediky Labs. All rights reserved.

For commercial or redistribution inquiries, contact: [bisoyi7004@gmail.com](mailto:bisoyi7004@gmail.com)


## Acknowledgements

* Credits for icons and illustrations are in `/public/attribution.json` (if applicable)
* Thanks to all contributors
