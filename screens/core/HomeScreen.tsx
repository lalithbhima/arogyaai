import React, { useRef, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Feather from "react-native-vector-icons/Feather";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen(): JSX.Element {
  const [userName, setUserName] = useState<string>("");

  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        try {
          const saved = await AsyncStorage.getItem("userProfile");
          if (saved) {
            const user = JSON.parse(saved);
            setUserName(user.name || "");
          } else {
            setUserName("");
          }
        } catch (e) {
          console.warn("Error loading user name:", e);
        }
      };
      loadProfile();
    }, [])
  );
  const navigation = useNavigation<any>();
  const greetAnim = useRef(new Animated.Value(0)).current;
  const [greeting, setGreeting] = useState("Welcome!");

  useEffect(() => {
    Animated.spring(greetAnim, { toValue: 1, useNativeDriver: true, friction: 7 }).start();
    const hour = new Date().getHours();
    if (hour < 5) setGreeting("Good night,");
    else if (hour < 12) setGreeting("Good morning,");
    else if (hour < 17) setGreeting("Good afternoon,");
    else if (hour < 21) setGreeting("Good evening,");
    else setGreeting("Good night,");
  }, []);

  return (
    <LinearGradient colors={["#e7f6ff", "#f7fdff", "#d2f4f6"]} style={styles.bg}>
      <SafeAreaView style={styles.safeArea}>
        {/* STICKY SETTINGS ICON */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate("Setting")}
          accessibilityLabel="Settings"
        >
          <Ionicons name="settings-outline" size={27} color="#5ab2e6" />
        </TouchableOpacity>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces
        >
          {/* Animated Greeting Card */}
          <Animated.View
            style={[
              styles.welcomeCard,
              {
                opacity: greetAnim,
                transform: [
                  { scale: greetAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }
                ],
                shadowOpacity: greetAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.19] }),
              },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="ArogyaAI Logo"
              />
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.greeting}>{greeting}</Text>
                <Text style={styles.title}>
                  Hi,{" "}
                  <Text style={{ color: "#2278f9" }}>
                    {userName ? userName.split(" ")[0] : "there"}
                  </Text>
                  !
                </Text>
                <Text style={styles.subText}>
                  I’m <Text style={{ color: "#19b7ae", fontWeight: "bold" }}>ArogyaAI</Text>. Your smart health companion.
                </Text>
              </View>
            </View>
            {/* Main CTA */}
            <TouchableOpacity
              style={styles.ctaBtn}
              activeOpacity={0.88}
              onPress={() => navigation.navigate("HealthAssistant")}
            >
              <Feather name="zap" size={20} color="#fff" style={{ marginRight: 7 }} />
              <Text style={styles.ctaBtnText}>Start Health Assistant</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Explore More section */}
          <Text style={styles.sectionHeader}>Explore Core Features</Text>

          <FeatureCard
            title="Track Your Symptoms"
            desc="Log and track your health symptoms, get instant AI feedback."
            iconBg="#d5f0ff"
            icon={<Ionicons name="pulse-outline" size={28} color="#3fa7fa" />}
            onPress={() => navigation.navigate("HealthAssistant")}
          />
          <FeatureCard
            title="Chat with ArogyaAI"
            desc="Ask any health question, anytime — powered by world-class AI."
            iconBg="#e2f9f4"
            icon={<Ionicons name="chatbubble-ellipses-outline" size={28} color="#18b883" />}
            onPress={() => navigation.navigate("ArogyaAIChat")}
          />
          <FeatureCard
            title="Medical Imaging"
            desc="Upload and enhance scans, X-rays, and more with AI."
            iconBg="#e5f7fa"
            icon={<Ionicons name="image-outline" size={28} color="#24c7b4" />}
            onPress={() => navigation.navigate("Imaging")}
          />
          <FeatureCard
            title="Calendar & Reminders"
            desc="Set reminders for medicine, checkups, and daily health tasks."
            iconBg="#eaf6ff"
            icon={<Ionicons name="calendar-outline" size={28} color="#2563eb" />}
            onPress={() => navigation.navigate("Calendar")}   // 👈 make sure your stack navigator has "Calendar" registered
          />          
          <FeatureCard
            title="Skin Cancer Analyzer"
            desc="Detect and monitor skin cancer risks with AI."
            iconBg="#f2f8ff"
            icon={<Ionicons name="aperture-outline" size={28} color="#4b9ef7" />}
            onPress={() => navigation.navigate("SkinCancerScreen")}
          />          
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// ---- Reusable Feature Card (with shadow and icon BG) ----
function FeatureCard({ title, desc, icon, iconBg, onPress }: any) {
  return (
    <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={{ width: "100%" }}>
      <View style={styles.featureCard}>
        <View style={[styles.featureIcon, { backgroundColor: iconBg || "#f4faff" }]}>
          {icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDesc}>{desc}</Text>
        </View>
        <Ionicons name="chevron-forward-circle-outline" size={26} color="#bddfff" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: "100%" },
  safeArea: { flex: 1, alignItems: "center", justifyContent: "flex-start" },
  settingsButton: {
    position: "absolute",
    top: 64,
    right: 24,
    zIndex: 99,
    backgroundColor: "#f4fbff",
    borderRadius: 16,
    padding: 5,
    elevation: 2,
  },
  scrollContent: {
    paddingBottom: 55,
    alignItems: "center",
    width: SCREEN_WIDTH * 0.99,
    paddingTop: 3,
  },
  welcomeCard: {
    width: SCREEN_WIDTH * 0.95,
    backgroundColor: "#e2f6ff",
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 22,
    shadowColor: "#78bffc",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.19,
    shadowRadius: 28,
    alignItems: "center",
    marginBottom: 25,
    marginTop: 14,
    elevation: 2,
  },
  logo: {
    width: 58, height: 58,
    borderRadius: 16,
    backgroundColor: "#d8f6ff",
    borderWidth: 1.7,
    borderColor: "#c3e5ff",
  },
  greeting: {
    fontSize: 17.3,
    color: "#2174bc",
    fontWeight: "700",
    marginBottom: 0,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  title: {
    fontSize: 24.2,
    fontWeight: "900",
    color: "#1b365d",
    marginBottom: 1,
    marginTop: 2,
    letterSpacing: -0.4,
  },
  subText: {
    fontSize: 15,
    color: "#23a7a0",
    marginTop: 2,
    fontWeight: "500",
    letterSpacing: -0.09,
  },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    alignSelf: "stretch",
    justifyContent: "center",
    backgroundColor: "#2176ff",
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: "#52cbfc",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
  },
  ctaBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2278f9",
    marginBottom: 4,
    marginTop: 12,
    alignSelf: "flex-start",
    paddingLeft: 11,
    letterSpacing: -0.11,
  },
  featureCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 17,
    paddingHorizontal: 14,
    borderRadius: 16,
    marginBottom: 13,
    width: "100%",
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#b3e7fa",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 9,
    borderWidth: 0.6,
    borderColor: "#f2f5fb",
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 17,
    shadowColor: "#d4f3fd",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  featureTitle: {
    fontSize: 17.6,
    fontWeight: "800",
    color: "#16518a",
    marginBottom: 2,
    letterSpacing: -0.15,
  },
  featureDesc: {
    fontSize: 14.2,
    color: "#527389",
    fontWeight: "500",
    marginTop: 0,
    marginBottom: 2,
  },
});
