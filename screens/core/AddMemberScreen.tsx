import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function AddMemberScreen() {
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
    { key: "name", label: "What is the member’s full name?" },
    { key: "age", label: "What is their age?" },
    { key: "gender", label: "What is their gender?" },
    { key: "bloodType", label: "What is their blood type?" },
    { key: "conditions", label: "Any existing medical conditions?" },
    { key: "medication", label: "Are they taking any medication?" },
    { key: "allergies", label: "Any allergies to note?" },
  ];

  const handleNext = async () => {
    if (!form[questions[step].key as keyof typeof form]) {
      Alert.alert("Please fill in this field before continuing.");
      return;
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      try {
        const existing = JSON.parse((await AsyncStorage.getItem("allProfiles")) || "[]");
        const newProfile = {
          id: Date.now().toString(),
          ...form,
          subtitle: "Family member",
        };
        const updated = [...existing, newProfile];
        await AsyncStorage.setItem("allProfiles", JSON.stringify(updated));

        Alert.alert("Profile added!", `${form.name}'s profile has been saved.`, [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      } catch (err) {
        console.error("❌ Error saving new member:", err);
        Alert.alert("Error", "Failed to save profile. Try again.");
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient colors={["#e7f6ff", "#f7fdff", "#e0fff6"]} style={s.bg}>
        <ScrollView contentContainerStyle={s.container}>
          <Text style={s.title}>Add Family Member</Text>
          <Text style={s.subtitle}>{questions[step].label}</Text>

          <TextInput
            style={s.input}
            placeholder="Type answer here..."
            value={form[questions[step].key as keyof typeof form]}
            onChangeText={(text) => setForm({ ...form, [questions[step].key]: text })}
          />
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.btn, s.btnGhost]}
            onPress={() => {
              if (step === 0) navigation.goBack();
              else setStep((i) => Math.max(0, i - 1));
            }}
          >
            <Ionicons name={step === 0 ? "close" : "chevron-back"} size={18} color="#1f4ab8" />
            <Text style={s.btnGhostTxt}>{step === 0 ? "Cancel" : "Back"}</Text>
          </TouchableOpacity>

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
  title: { fontSize: 26, fontWeight: "800", color: "#1565c0", marginBottom: 10 },
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
});
