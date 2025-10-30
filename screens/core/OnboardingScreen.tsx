// screens/core/OnboardingScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    bloodType: "",
    conditions: "",
    medication: "",
    allergies: "",
  });

  const questions = [
    { key: "name", label: "What is your full name?" },
    { key: "age", label: "What is your age?" },
    { key: "gender", label: "What is your gender?" },
    { key: "bloodType", label: "What is your blood type?" },
    { key: "conditions", label: "Any existing medical conditions?" },
    { key: "medication", label: "Are you currently taking any medication?" },
    { key: "allergies", label: "Any allergies we should note?" },
  ];

  const handleNext = async () => {
    if (!form[questions[step].key as keyof typeof form]) {
      Alert.alert("Please fill in your answer before continuing.");
      return;
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      try {
        await AsyncStorage.setItem("userProfile", JSON.stringify(form));
        await AsyncStorage.setItem("isFirstTimeUser", "false");

        Alert.alert("Profile saved!", "Welcome to ArogyaAI 🎉", [
          {
            text: "Continue",
            onPress: () => {
              navigation.navigate("Main", { screen: "Home" });
            },
          },
        ]);
      } catch (error) {
        console.error("❌ Error saving user profile:", error);
        Alert.alert("Error", "Failed to save your profile. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#e7f6ff", "#f7fdff", "#e0fff6"]} style={s.bg}>
        <ScrollView contentContainerStyle={s.container}>
          <View style={s.logoContainer}>
            <Image
              source={require("../../assets/logo.png")}
              style={s.logo}
              accessibilityLabel="ArogyaAI Logo"
            />
          </View>

          <Text style={s.title}>Let's get to know you</Text>
          <Text style={s.subtitle}>{questions[step].label}</Text>

          <TextInput
            style={s.input}
            placeholder="Type your answer here..."
            value={form[questions[step].key as keyof typeof form]}
            onChangeText={(text) =>
              setForm({ ...form, [questions[step].key]: text })
            }
          />
        </ScrollView>

        {/* ✅ Footer outside ScrollView */}
        <View style={s.footer}>
          {step > 0 ? (
            <TouchableOpacity
              style={[s.btn, s.btnGhost]}
              onPress={() => setStep((i) => Math.max(0, i - 1))}
            >
              <Ionicons name="chevron-back" size={18} color="#1f4ab8" />
              <Text style={s.btnGhostTxt}>Back</Text>
            </TouchableOpacity>
          ) : (
            // Empty placeholder keeps layout balanced
            <View style={{ width: 90 }} />
          )}

          <TouchableOpacity style={[s.btn, s.btnPrimary]} onPress={handleNext}>
            <Text style={s.btnPrimaryTxt}>
              {step === questions.length - 1 ? "Finish" : "Next"}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: { fontSize: 28, fontWeight: "800", color: "#1565c0", marginBottom: 10 },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#374151",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: "#bde0fe",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    fontSize: 17,
    marginBottom: 30,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  btnGhost: { backgroundColor: "#f1f5f9" },
  btnGhostTxt: {
    color: "#1f4ab8",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  btnPrimary: { backgroundColor: "#2563eb" },
  btnPrimaryTxt: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 6,
  },
  logoContainer: {
    alignSelf: "center",
    marginBottom: 25,
    backgroundColor: "#eaf4fd",
    borderRadius: 32,
    padding: 14,
    shadowColor: "#22a3ff",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  logo: {
    width: 110,
    height: 110,
    resizeMode: "contain",
    borderRadius: 25,
    backgroundColor: "#eaf4fd",
  },
});
