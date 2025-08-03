# Ediky

Welcome to [Ediky](https://ediky.com/), your comprehensive hub for algorithms and machine learning resources.

## Features

* **Educational Content**: Access a wide range of tutorials and articles on algorithms and machine learning concepts.
* **Interactive Examples**: Engage with hands-on examples to deepen your understanding of complex topics.
* **Resource Library**: Explore a curated collection of books, research papers, and online courses to further your learning.
* **Community Forum**: Join discussions with fellow learners and experts to share knowledge and insights.

## Local Development Setup

To set up Ediky for local development, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/MLOrbit/MLOrbit-Website.git
   cd MLOrbit-Website
   ```

2. **Install Dependencies**:

   Ensure you have [Node.js](https://nodejs.org/) installed. Then, run:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:

   Create a `.env` file in the root directory and add your Firebase configuration:

   ```env
   REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
   REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
   REACT_APP_FIREBASE_APP_ID=your-firebase-app-id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your-firebase-measurement-id
   ```

   Replace the placeholder values with your actual Firebase project credentials.

4. **Start the Development Server**:

   ```bash
   npm start
   ```

   The application will run at [http://localhost:3000](http://localhost:3000).
