import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function SettingScreen() {
  const navigation = useNavigation<any>();

  const renderItem = (title: string) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.8}
      onPress={() => navigation.navigate("SettingsDetailScreen", { sectionId: title })}
    >
      <Text style={styles.itemText}>{title}</Text>
      <Ionicons name="chevron-forward-outline" size={20} color="#94a3b8" />
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#e7f6ff", "#f7fdff", "#e0fff6"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* Back Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#1565c0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* --- Account Settings Section --- */}
          <Text style={styles.sectionHeader}>Account Settings</Text>
          <View style={styles.sectionBox}>
            {renderItem("Account Login")}
            {renderItem("Privacy and Notifications")}
            {renderItem("Language")}
          </View>

          {/* --- Support Section --- */}
          <Text style={styles.sectionHeader}>Support</Text>
          <View style={styles.sectionBox}>
            {renderItem("About ArogyaAI")}
            {renderItem("Safety Information")}
            {renderItem("Rate ArogyaAI")}
          </View>

          {/* --- Log Out Button --- */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={async () => {
              try {
                // ✅ Optional: clear only auth session, not stored credentials or biometrics
                await AsyncStorage.removeItem("sessionActive");

                // ✅ Navigate back cleanly to WelcomeScreen
                navigation.reset({
                  index: 0,
                  routes: [{ name: "Welcome" }],
                });
              } catch (e) {
                console.error("❌ Logout error:", e);
              }
            }}
          >
            <Text style={styles.logoutTxt}>Log out</Text>
          </TouchableOpacity>

          {/* --- App Version --- */}
          <Text style={styles.version}>Version 1.0.0 (ArogyaAI)</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    marginBottom: 8,
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 20,
    padding: 4,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0d47a1",
  },
  sectionHeader: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "700",
    textTransform: "uppercase",
    marginTop: 18,
    marginBottom: 6,
    letterSpacing: 0.5,
    paddingLeft: 15,
  },
  sectionBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0efff",
    shadowColor: "#b3e7fa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
    marginHorizontal: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 22,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
    logoutBtn: {
    marginTop: 26,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#dbeafe", // ✅ soft light-blue background
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#93c5fd", // ✅ medium pastel blue border
    },
    logoutTxt: {
    color: "#1e40af", // ✅ deep but calm navy-blue text (readable + elegant)
    fontSize: 16,
    fontWeight: "700",
    },
  version: {
    textAlign: "center",
    marginTop: 18,
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "500",
  },
});
