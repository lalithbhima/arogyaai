// screens/onboarding/WelcomeScreen.tsx
import React, { useRef, useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import i18n, { setI18nConfig } from "../../utils/i18n";

type Props = {
  onGetStarted?: () => void;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function WelcomeScreen({ onGetStarted }: Props) {
  const navigation = useNavigation<any>();
  const logoAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const btnSlideAnim = useRef(new Animated.Value(30)).current;
  const btnFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(logoAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 950,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(btnSlideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(btnFadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start();
    }, 1000);
  }, []);

  const handleGetStarted = async () => {
    console.log("✅ Get Started pressed");

    try {
      // 1️⃣ Check if user has already used the app before
      const isFirstTime = await AsyncStorage.getItem("isFirstTimeUser");

      // 2️⃣ If first time or not found → go to SIGNUP mode
      if (!isFirstTime || isFirstTime === "true") {
        await AsyncStorage.setItem("isFirstTimeUser", "false"); // mark as used
        navigation.navigate("Auth", { startMode: "signup" });
        return;
      }

      // 3️⃣ If returning user → go to LOGIN mode (biometric or email)
      navigation.navigate("Auth", { startMode: "login" });
    } catch (err) {
      console.warn("Error checking first-time status:", err);
      navigation.navigate("Auth", { startMode: "signup" }); // fallback
    }
  };

  return (
    <LinearGradient
      colors={["#d8f6ff", "#f4f9ff", "#d8fff2"]}
      style={[s.bg, { backgroundColor: "#d8f6ff" }]}
    >
      <SafeAreaView style={s.safeArea}>
        <Animated.View
          style={[
            s.logoContainer,
            {
              transform: [{ scale: Animated.multiply(logoAnim, pulseAnim) }],
            },
          ]}
        >
          <Image
            source={require("../../assets/logo.png")}
            style={s.logo}
            accessibilityLabel="ArogyaAI Logo"
          />
        </Animated.View>

        <Text style={s.title}>ArogyaAI</Text>
        <Text style={s.tagline}>
          Your AI-powered path to global wellness
        </Text>

        <View style={s.buttonOuter}>
          <Animated.View
            style={{
              opacity: btnFadeAnim,
              transform: [{ translateY: btnSlideAnim }],
              width: "100%",
            }}
          >
            <TouchableOpacity
              style={s.startBtn}
              activeOpacity={0.85}
              onPress={handleGetStarted}
            >
              <LinearGradient
                colors={["#22aaff", "#23c07e"]}
                style={s.startBtnGradient}
                start={{ x: 0.1, y: 0.5 }}
                end={{ x: 0.9, y: 0.5 }}
              >
                <Text style={s.startBtnText}>Get Started</Text>
                <MaterialIcons
                  name="arrow-forward-ios"
                  size={20}
                  color="#fff"
                  style={{ marginLeft: 7 }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, width: "100%", justifyContent: "center" },
  safeArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  logoContainer: {
    marginTop: SCREEN_WIDTH * 0.11,
    shadowColor: "#22a3ff",
    shadowOffset: { width: 0, height: 17 },
    shadowOpacity: 0.23,
    shadowRadius: 40,
    elevation: 24,
    borderRadius: 32,
    backgroundColor: "#eaf4fd",
    padding: 14,
  },
  logo: {
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_WIDTH * 0.3,
    resizeMode: "contain",
    borderRadius: 25,
    backgroundColor: "#eaf4fd",
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#15335d",
    textAlign: "center",
    marginTop: 36,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 17,
    color: "#23a7a0",
    marginVertical: 13,
    textAlign: "center",
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  buttonOuter: {
    width: "100%",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 36,
    overflow: "visible",
  },
  startBtn: {
    width: SCREEN_WIDTH * 0.83,
    borderRadius: 19,
    minHeight: 48,
    alignSelf: "center",
  },
  startBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: 48,
    paddingVertical: 2,
    paddingHorizontal: 18,
    borderRadius: 19,
    shadowColor: "#23a0c0",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.17,
    shadowRadius: 19,
  },
  startBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 20,
    letterSpacing: 1.2,
  },
});
