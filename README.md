# EdikyStudio

**AI-powered, minimalist video editor.**
This repository contains the public website for EdikyStudio.

* Website: [https://ediky.com](https://ediky.com)
* Contact: [contact@edikylabs.dev](mailto:contact@edikylabs.dev)

## Product highlights

* GPU-accelerated playback and export (Metal/Vulkan)
* AI-assisted editing and auto-captioning
* Minimal, creator-first interface
* Pro exports: H.264, HEVC, ProRes, image sequences
* 4K and 10-bit color support

## Tech stack (website)

* React + React Router
* CSS (custom) and Bootstrap utilities
* Firebase Authentication (optional)

## Requirements

* Node.js 18+ and npm 9+

## Getting started

```bash
git clone https://github.com/EdikyLab/ediky-website.git
cd ediky-website
npm install
cp .env.example .env   # create your env file
npm start
```

The site runs at [http://localhost:3000](http://localhost:3000).

## Environment variables

Create a `.env` in the project root:

```env
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
```

If you don’t use Firebase auth, leave these unset and remove the auth components.

## Scripts

```bash
npm start   # run dev server
npm run build  # production build
```

## Contributing

Please open an issue before submitting large changes. Small fixes and improvements are welcome.

## License

© 2025 Ediky Labs. All rights reserved.
