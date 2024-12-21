# CoList

## 📋 Overview

CoList is a **Progressive Web App (PWA)** built using **Svelte** with **Firebase Authentication** and **Firestore**.

It allows users to create and manage collaborative checklists, making it easy to share tasks and keep track of progress.

Users can register, create lists, and share them with others, enabling effective teamwork and organization.

## ⭐ Features

- **User Authentication**: Secure registration and login using Firebase Authentication.
- **Collaborative Lists**: Create checklists that can be shared with other users or kept private.
- **List Management**: Add and delete lists and items within them.
- **Swipe Actions**: Swipe left on list items to reveal a delete option.
- **Dark Mode**: Toggle between light and dark modes.

## 🌐 How It Works

- **User Registration**: New users can sign up and create an account.
- **My Lists**: After logging in, users are presented with their lists and those shared with them.
- **Add List**: Users can create new lists and choose to share them with specific users or keep them private.
- **Add Items**: Users can add items to their lists. Items can be checked off when completed and edited.
- **Delete Lists/Items**: Users can swipe on specific items or lists to delete them. If the list is shared, this action will propagate to the other users.

## 📦 Tech Stack

- **Frontend**: Sveltekit with Tailwind CSS.
- **Backend**: Firebase for authentication and Firestore for data storage.

## 🚀 Getting Started

To get started with this app, follow these steps:

1. **Clone the Repository**

   Clone the repository and navigate to the project directory:

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install Dependencies**

   Install the required dependencies using Yarn:

   ```bash
   yarn install
   ```

3. **Set Up Firebase**

   Create a Firebase project in the Firebase Console.
   Set up Firestore and Authentication.
   Obtain your Firebase configuration values and add them to your .env file:

   ```bash
   VITE_FIREBASE_API_KEY=<your-api-key>
   VITE_FIREBASE_AUTH_DOMAIN=<your-auth-domain>
   VITE_FIREBASE_PROJECT_ID=<your-project-id>
   VITE_FIREBASE_STORAGE_BUCKET=<your-storage-bucket>
   VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
   VITE_FIREBASE_APP_ID=<your-app-id>
   ```

4. **Run locally**

   To run the development server, use the following command:

   ```bash
   yarn dev
   ```

## 🌍 Deployment

This app is setup to be deployed on Vercel, using Svelte's Vercel adapter.
You can choose your preferred hosting platform.

## 📄 License

This project is licensed under the MIT License. See the [license](.license) file for details.
