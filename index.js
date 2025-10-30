/**
 * @format
 */
import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";

import PushNotification from "react-native-push-notification";
import PushNotificationIOS from "@react-native-community/push-notification-ios";

// 🔹 Configure push notifications (runs once on startup)
PushNotification.configure({
  onRegister: function (token) {
    console.log("TOKEN:", token);
  },
  onNotification: function (notification) {
    console.log("NOTIFICATION:", notification);
    // Required for iOS
    notification.finish(PushNotificationIOS.FetchResult.NoData);
  },
  requestPermissions: true, // iOS will prompt automatically
});

// 🔹 Register the app entry point
AppRegistry.registerComponent(appName, () => App);
