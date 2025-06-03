# Project Title: WebTracker Chrome Extension
**Year:** 2025  
**By:** Vincent Perez  
**From:** Philippines  

#### Video Demo: https://youtu.be/QQQ-PpHYtZ4

#### Description:

WebTracker is a Chrome extension designed to help users monitor and manage their time spent on various websites. By providing detailed insights into browsing habits, the extension empowers users to make informed decisions about their online activities. The extension features a user-friendly interface, real-time data visualization, and customizable options for tracking and displaying information.

### Features

- **Time Tracking**: Automatically tracks the time spent on each website.
- **Data Visualization**: Displays time data in a visually appealing doughnut chart using Chart.js.
- **Top Sites List**: Shows a list of the most visited websites along with the time spent on each.
- **Reset Functionality**: Allows users to clear all tracked data and start fresh.
- **Real-Time Updates**: Periodically updates the chart and top sites list to ensure data accuracy.

### File Overview

#### `manifest.json`
This file contains the metadata for the Chrome extension, including its name, version, permissions, and background scripts. It serves as the entry point for the browser to recognize and load the extension.

#### `src/background/background.js`
The background script handles the core logic for tracking website activity. It listens for browser events and updates the local storage with time data for each domain.

#### `src/popup/popup.js`
This script manages the functionality of the popup interface. It retrieves data from local storage, updates the chart and top sites list, and handles user interactions like resetting data.

#### `src/popup/popup.html`
The HTML file defines the structure of the popup interface. It includes elements like buttons, charts, and lists that are dynamically updated by `popup.js`.

#### `src/popup/popup.css`
This file contains the styling for the popup interface, ensuring a clean and modern look.

#### `src/assets/`
This folder contains images and icons used in the extension, such as the logo and empty state illustrations.

#### `src/popup/chart.min.js`
A minified version of Chart.js, a JavaScript library used for creating the doughnut chart in the popup interface.

### Design Choices

One of the key design decisions was to use Chart.js for data visualization. This library was chosen for its simplicity, flexibility, and ability to create visually appealing charts. The doughnut chart provides an intuitive way to represent time spent on different websites, making it easy for users to understand their browsing habits at a glance.

The extension also utilizes local storage to persist data across browser sessions, allowing users to retain their browsing history without relying on external servers. This approach enhances privacy and ensures that users have control over their data.

The extension was designed with performance in mind, using efficient data retrieval and update mechanisms to minimize resource usage. The periodic updates for the chart and top sites list were carefully timed to balance real-time accuracy with system efficiency.

### Future Improvements

- **Customizable Settings**: Allow users to set tracking preferences, such as excluding specific domains or adjusting update intervals.
- **Export Data**: Provide options to export time data for further analysis.
- **Advanced Analytics**: Include additional charts and metrics to give users deeper insights into their browsing habits.

WebTracker is a powerful tool for anyone looking to take control of their online time. With its intuitive interface and robust functionality, it aims to make time management easier and more effective.