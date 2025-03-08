# ConnectKid

## Overview
ConnectKid is an application designed to help parents stay connected with their children. It provides real-time location tracking, messaging, and calling features, ensuring the safety of children at all times. The application also includes an emergency alert system that notifies parents when their child is in danger.

## Features
- **Text and Call**: Communicate with your children through text messages and calls.
- **Real-Time Location Tracking**: Track your child's location using a Raspberry Pi device.
- **Speed Monitoring**: If a child moves at an abnormally high speed, their location is highlighted in red on the map.
- **Emergency Alert**: Children can press an emergency button to notify their parents instantly.

## Platforms
- **Web Version**: Try ConnectKid on the web.
- **Android App**: Available for download on Android devices.

## Getting Started
### 1. Creating an Account
- Sign up for a ConnectKid account.
- You will receive a unique **pair ID**.

### 2. Adding Your Child
- Enter your child's **pair ID** to add them to your contact list.
- Once added, you can start a conversation with them.
- You can now view their real-time location on the map.
- Their marker will be:
  - **Green**: Normal speed.
  - **Red**: Abnormally high speed (possible danger).

### 3. Setting Up the Raspberry Pi Device
- The Raspberry Pi acts as a location tracker for your child.
- To pair it with an account:
  1. Input the **pair ID** of the child’s account into the Raspberry Pi setup.
  2. The pairing will be saved for future use.
  3. Once the application starts, it will send the child’s location **every second** for real-time tracking.
  4. The paired device can be deleted in the device section.

## Emergency Alert System
- If your child is in danger, they can press the **emergency button**.
- This sends an instant **alert notification** to your device.
- You will be able to view their location immediately.

## Installation
### Web Version
- Visit [ConnectKid Web](https://connectkidweb-56d2e5575ada.herokuapp.com/) to access the application online.

### Android Version
- Download the app from the Google Play Store (coming soon).

## Contribution
If you’d like to contribute to ConnectKid, feel free to fork the repository and submit pull requests.

## License
This project is licensed under the MIT License.

