# EdikyStudio — Website

This repository hosts the public website for **EdikyStudio**, an AI-powered, minimalist video editor.

* **Website:** [https://ediky.com](https://ediky.com/)
* **Contact:** [bisoyi7004@gmail.com](mailto:bisoyi7004@gmail.com)

---

## Overview

EdikyStudio combines professional editing capabilities with a clean, creator-focused design. While the website lives here, the core editor and related services are maintained in separate repositories.

### Key Features

* **GPU-accelerated playback and export** (Metal / Vulkan)
* **AI-assisted editing** — e.g., automatic captions
* Minimal, distraction-free interface
* Professional export formats: H.264, HEVC, ProRes, image sequences
* Supports **4K** resolution and **10-bit color**

---

## Tech Stack

* **Frontend:** React + React Router
* **Styling:** Custom CSS with Bootstrap utilities
* **Auth:** Firebase Authentication (optional, for gated content)

---

## Requirements

* Node.js **18+**
* npm **9+**

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/EdikyLab/ediky-website.git
cd ediky-website

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Update values as needed

# Run development server
npm start
# Visit http://localhost:3000
```

---

## Environment Variables

If you are not using Firebase authentication, leave these blank and remove related code.

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
```

---

## NPM Scripts

```bash
npm start      # Start dev server
npm run build  # Create production build
```

---

## Development Guidelines

* Use branch names like `feat/*`, `fix/*`, `docs/*`, `chore/*`
* Follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat: add hero section`)
* Keep PRs focused and small
* Ensure builds pass before merging

---

## Contributing

1. Open an issue for significant changes.
2. Fork and branch from `main`.
3. Keep commits clear and meaningful.
4. For UI changes, include screenshots in the PR description.

Small fixes and improvements are welcome.

---

## Website Roadmap

* Achieve **95+ Lighthouse score**
* Add i18n and improve WCAG 2.1 AA accessibility
* Add blog/changelog section
* Auto-detect OS on download page
* Minimal dashboard with release notes and early builds

---

## License

© 2025 Ediky Labs. All rights reserved.
For commercial or redistribution inquiries: [bisoyi7004@gmail.com](mailto:bisoyi7004@gmail.com)

---

## Acknowledgements

* Icon and illustration credits (if any) in `/public/attribution.json`
* Thanks to all contributors
