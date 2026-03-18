# Safe on Chat - Encrypted Messaging App

> A secure, cross-platform mobile messaging application featuring end-to-end encryption, real-time chat, and high-quality WebRTC calls.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.io-010101?&style=flat&logo=Socket.io&logoColor=white)

## Project Description

The FRL Encrypted Messaging App is a comprehensive solution designed to protect user privacy while offering a modern chat interface. It enables users to have completely secure, real-time conversations across Android and iOS devices.

- **What it does:** The application allows users to register securely, send encrypted chat messages, share media, and participate in peer-to-peer audio and video calls. It uses a combination of advanced cryptographic algorithms (including RSA, AES via Crypto-JS, and Twofish) for end-to-end data encryption. 
- **Why we used these technologies:** 
  - **React Native & Expo:** Selected for building a seamless, cross-platform mobile experience with a single codebase, allowing rapid shipping to both iOS and Android.
  - **Firebase (Auth & Firestore):** Provides a highly scalable, real-time NoSQL database and secure user authentication out-of-the-box.
  - **WebRTC & Socket.IO:** Essential for establishing fast, low-latency peer-to-peer secure connections for voice and video calling.
  - **React Native Gifted Chat:** Chosen to rapidly implement a highly customizable and modern conversational UI.
- **Challenges faced:** Implementing and managing complex encryption keys (public/private key pairs) across different platforms while ensuring low-latency message delivery was a significant hurdle. Furthermore, getting WebRTC and Socket.IO to communicate flawlessly behind the scenes required intricate signaling logic.
- **Future features:** We plan to implement disappearing messages (self-destructing text), multi-user group video calls, and an enhanced zero-knowledge proof authentication system.

## Table of Contents
- [How to Install and Run the Project](#how-to-install-and-run-the-project)
- [How to Use the Project](#how-to-use-the-project)
- [Include Credits](#include-credits)
- [Add a License](#add-a-license)

## How to Install and Run the Project

Follow these steps to set up the development environment on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- `npm` or `yarn` installed
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A [Firebase Account](https://firebase.google.com/) for backend configurations

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/frl-encrypted-messaging-crossplatform-mobile-app-rn-expo-firebase.git
   cd frl-encrypted-messaging-crossplatform-mobile-app-rn-expo-firebase
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables:**
   - Create a `.env` file in the root directory.
   - Add your Firebase and system configuration keys (e.g., API keys, auth domain, project ID).

4. **Run the application:**
   ```bash
   npx expo start
   ```
   - Press `a` to open on an Android emulator.
   - Press `i` to open on an iOS simulator.
   - Or scan the QR code with the Expo Go app on your physical device.

**(Note for physical device testing):** If you are running WebRTC, it is best to test on physical devices or robust emulators, as WebRTC features like cameras and microphones behave differently from standard UI.

## How to Use the Project

Once the application is running, here is how you can use the core features:

1. **Authentication:** 
   - Upon launching, you will be greeted by the secure login screen. If you are a new user, navigate to the Sign-Up page. 
   - *Example Credentials for testing:* `testuser@example.com` / `password123` (Note: Only valid if enabled in your Firebase console testing suite).
2. **Setting up PIN & Security:** You may optionally be prompted to secure the app with a Local PIN (`react-native-pin-view` and `expo-local-authentication`).
3. **Starting a Chat:**
   - Navigate to the contacts list to search for existing users.
   - Tap a user to open the `Gifted Chat` interface. Any message sent here is automatically encrypted before leaving your device and decrypted solely on the recipient's device.
4. **Making a Call:**
   - Inside an active chat screen, hit the video or phone icon in the header to initialize a WebRTC connection. Agree to device camera/microphone permissions when prompted.

*(Tip: Feel free to add interactive screenshots or GIFs of your messaging UI in this section!)*

## Credits

Creating this project was a huge learning experience made possible by the following amazing libraries and communities:

- [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) Teams
- [Firebase Documentation](https://firebase.google.com/docs) for their excellent backend guides
- [React Native Gifted Chat](https://github.com/FaridSafi/react-native-gifted-chat) by FaridSafi
- WebRTC documentation and the React Native WebRTC community.

**Contributors:** 
- Ijerson Lastimosa - Developer

*If you followed specific WebRTC signaling tutorials or cryptography guides, mention them here as a token of appreciation!*

## License

This project is licensed under the MIT License. 

You are free to use, modify, and distribute this software for personal and commercial purposes, provided that the original copyright notice is included. For more details, see the [`LICENSE`](LICENSE) file.
