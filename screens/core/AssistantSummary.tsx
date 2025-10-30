// src/screens/core/AssistantSummary.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
// ------------------------------------------------------------------
// RATIONALE LIBRARY – Auto-generated guidance per detected topic
// ------------------------------------------------------------------
const TOPIC_RATIONALE: Record<string, string[]> = {
  fever_infection: [
    "Fever usually signals the body’s immune response to an infection.",
    "Stay hydrated and rest; avoid over-exertion.",
    "If fever persists beyond 3 days, or is above 103°F (39.4°C), seek medical care.",
    "Antipyretics such as acetaminophen or ibuprofen may help lower temperature.",
  ],
  chest_pain: [
    "Chest pain can have cardiac, pulmonary, or musculoskeletal causes.",
    "Pain spreading to the arm, neck, or jaw suggests possible heart involvement.",
    "If pain occurs with exertion, sweating, or shortness of breath — treat as emergency.",
    "Avoid exertion and seek ECG evaluation immediately if severe.",
  ],
  shortness_breath: [
    "Shortness of breath may arise from asthma, infection, heart failure, or anxiety.",
    "Note when symptoms occur — during rest or activity — to help diagnosis.",
    "If you cannot speak full sentences or notice blue lips, seek emergency help.",
  ],
  anxiety_mood: [
    "Anxiety and mood disorders are common and treatable.",
    "Breathing exercises and mindfulness can reduce short-term symptoms.",
    "Persistent sadness or suicidal thoughts warrant immediate professional help.",
    "Cognitive-behavioral therapy and medications can be highly effective.",
  ],
  headache_neuro: [
    "Headaches often result from tension, migraine, or dehydration.",
    "Sudden severe headache with vision change or weakness requires emergency care.",
    "Adequate hydration, sleep, and stress control may reduce recurrence.",
  ],
  abdominal_gi: [
    "Abdominal pain may indicate gastritis, infection, or intestinal inflammation.",
    "Pain after meals may suggest reflux or ulcer.",
    "Seek urgent care if pain is severe, persistent, or associated with vomiting blood.",
  ],
  rash_skin: [
    "Skin rashes can result from infection, allergy, or autoimmune causes.",
    "Track triggers such as new soaps, foods, or medications.",
    "Apply mild moisturizers; avoid scratching to prevent infection.",
  ],
  diabetes: [
    "Maintain fasting glucose between 80–130 mg/dL and HbA1c <7%.",
    "Regular exercise and balanced diet stabilize blood sugar.",
    "Report frequent hypoglycemia or blurred vision to your clinician.",
  ],
  thyroid: [
    "Thyroid imbalance can alter metabolism and energy levels.",
    "Fatigue, weight change, and intolerance to heat/cold are key clues.",
    "TSH and T4 tests confirm diagnosis; medication adjustment may be needed.",
  ],
  pregnancy: [
    "Regular prenatal visits are vital for maternal and fetal health.",
    "Eat balanced meals with folic acid, iron, and calcium supplements.",
    "Report abdominal pain or bleeding to your obstetrician promptly.",
  ],
  msk_pain: [
    "Muscle or joint pain often follows strain, poor posture, or arthritis.",
    "Rest, gentle stretching, and anti-inflammatory medication can help.",
    "Seek imaging if pain persists >2 weeks or after trauma.",
  ],
  uti: [
    "Urinary tract infections are common, especially in women.",
    "Drink plenty of fluids and avoid holding urine.",
    "Antibiotics are usually required; finish the prescribed course.",
  ],
  allergy: [
    "Allergies are immune over-reactions to harmless substances.",
    "Avoid known triggers and use antihistamines as needed.",
    "Severe reactions with throat swelling need immediate epinephrine and ER care.",
  ],
  covid_long: [
    "Post-COVID fatigue and brain fog may last weeks to months.",
    "Gradual exercise and consistent sleep aid recovery.",
    "Seek evaluation if new chest pain or palpitations develop.",
  ],
  trauma: [
    "Assess for bleeding, deformity, or loss of consciousness.",
    "Immobilize injured limbs and apply pressure to control bleeding.",
    "Severe injuries require emergency transport.",
  ],
  cancer: [
    "Unexplained weight loss, fatigue, or lumps should be evaluated promptly.",
    "Early detection greatly improves treatment outcomes.",
    "Follow oncology appointments and report new symptoms.",
  ],
  pediatrics: [
    "Monitor growth, feeding, and developmental milestones.",
    "Ensure immunizations are up-to-date.",
    "Persistent fever, dehydration, or lethargy require pediatric assessment.",
  ],
  elderly: [
    "Older adults are prone to falls, medication interactions, and dehydration.",
    "Regular check-ups and medication review prevent complications.",
    "Encourage physical activity and social engagement.",
  ],
  nutrition: [
    "A balanced diet supports immune and metabolic health.",
    "Include fruits, vegetables, whole grains, lean proteins, and adequate hydration.",
    "Limit processed foods and excess sugar.",
  ],
  exercise: [
    "Regular moderate exercise improves cardiovascular and mental health.",
    "Warm-up and cool-down reduce injury risk.",
    "Start slow if new to exercise; consistency matters more than intensity.",
  ],
  sleep: [
    "Adults need 7–9 hours of sleep per night.",
    "Avoid caffeine, heavy meals, and screens before bed.",
    "If snoring or pauses in breathing occur, screen for sleep apnea.",
  ],
  stress: [
    "Chronic stress can raise blood pressure and impair immunity.",
    "Practice deep breathing, time management, and regular breaks.",
    "If anxiety interferes with daily life, seek counseling.",
  ],
  hypertension: [
    "Keep blood pressure below 130/80 mmHg through lifestyle and medication.",
    "Reduce salt, avoid tobacco, and exercise regularly.",
    "Check BP at home weekly and log results for your doctor.",
  ],
  dehydration: [
    "Dehydration causes fatigue, dizziness, and dark urine.",
    "Increase water intake; include oral rehydration if severe.",
    "Seek care if unable to keep fluids down or confusion develops.",
  ],
  default: [
    "Your responses have been recorded.",
    "Continue monitoring symptoms and maintain a healthy lifestyle.",
    "Seek care if symptoms worsen or new issues appear.",
  ],
};
export default function AssistantSummary({ route, navigation }: any) {
  const { responses, plan } = route.params || {};
  const { triage, triage_message, risk_score, topic, rationale } = plan || {};
  // 🔹 Auto-generate rationale text based on detected topic
  const topicRationale =
    TOPIC_RATIONALE[topic as keyof typeof TOPIC_RATIONALE] ||
    TOPIC_RATIONALE.default;

  const triageColor =
    triage === "EMERGENCY"
      ? "#dc2626"
      : triage === "URGENT"
      ? "#f59e0b"
      : "#16a34a";

  const triageIcon =
    triage === "EMERGENCY"
      ? "alert-circle"
      : triage === "URGENT"
      ? "warning"
      : "checkmark-circle";
      
  const handleHomePress = async () => {
    try {
      // Load any existing saved passport records
      const saved = await AsyncStorage.getItem("passport_records");
      const records = saved ? JSON.parse(saved) : [];

      // Create a new record entry
      const newRecord = {
        id: Date.now(),
        date: new Date().toISOString(),
        responses,
        plan,
      };

      // Save the new record (prepend newest)
      await AsyncStorage.setItem(
        "passport_records",
        JSON.stringify([newRecord, ...records])
      );

      // Clear old assistant session so next visit starts fresh
      await AsyncStorage.removeItem("assistant_state_v2");

      // Go back to home
      Alert.alert("Saved!", "Your health summary has been added to your Health Passport.");
      navigation.navigate("Home");
    } catch (err) {
      console.error("Error saving passport record", err);
      Alert.alert("Error", "Could not save your health summary.");
    }
  };
  return (
    <LinearGradient
      colors={["#e6f1ff", "#f7fbff", "#ebf9f3"]}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={s.container}>
        <ScrollView contentContainerStyle={s.body}>
          <Text style={s.header}>Your Health Summary</Text>

          {/* TRIAGE CARD */}
          <View style={[s.card, { borderColor: triageColor }]}>
            <View style={s.row}>
              <Ionicons name={triageIcon} size={28} color={triageColor} />
              <Text style={[s.triage, { color: triageColor }]}>
                {triage?.toUpperCase() || "ROUTINE"}
              </Text>
            </View>
            <Text style={s.triageMsg}>{triage_message}</Text>
            <View style={s.riskBarWrap}>
              <View style={[s.riskBarBg]}>
                <View
                  style={[
                    s.riskBarFill,
                    { width: `${(risk_score ?? 0) * 100}%`, backgroundColor: triageColor },
                  ]}
                />
              </View>
              <Text style={s.riskTxt}>
                Risk Score: {(risk_score * 100).toFixed(0)}%
              </Text>
            </View>
          </View>

          {/* PATIENT SNAPSHOT */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Patient Overview</Text>
            <View style={s.infoItem}>
              <Text style={s.infoKey}>Age:</Text>
              <Text style={s.infoVal}>{responses.age ?? "N/A"}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoKey}>Sex:</Text>
              <Text style={s.infoVal}>{responses.sex ?? "N/A"}</Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoKey}>Concern Severity (1–10):</Text>
              <Text style={s.infoVal}>
                {responses.concern_severity ?? "N/A"}
              </Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoKey}>Detected Topic:</Text>
              <Text style={[s.infoVal, { textTransform: "capitalize" }]}>
                {(topic || "general").replace(/_/g, " ")}
              </Text>
            </View>
            <View style={s.infoItem}>
              <Text style={s.infoKey}>Chief Concern:</Text>
              <Text style={s.infoVal}>{responses.chief || "N/A"}</Text>
            </View>
          </View>

          {/* RECOMMENDATION / EXPLANATION */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Explanation & Rationale</Text>
            {topicRationale.map((r: string, i: number) => (
              <View key={i} style={s.bulletItem}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>{r}</Text>
              </View>
            ))}
          </View>

          {/* ACTIONS */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Next Steps</Text>
            {triage === "EMERGENCY" && (
              <Text style={s.actionTxt}>
                🚨 Please go to the nearest emergency department or call local
                emergency services.
              </Text>
            )}
            {triage === "URGENT" && (
              <Text style={s.actionTxt}>
                🩺 Seek care within the next 24 hours for medical evaluation.
              </Text>
            )}
            {triage === "ROUTINE" && (
              <Text style={s.actionTxt}>
                ✅ Monitor your symptoms and follow general wellness guidance.
              </Text>
            )}
          </View>
        </ScrollView>

        {/* BOTTOM BUTTONS */}
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.btn, s.btnGhost]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={18} color="#1f4ab8" />
            <Text style={s.btnGhostTxt}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.btn, s.btnPrimary]}
            onPress={async () => {
              await handleHomePress();
              navigation.navigate("Main", { screen: "Home" });  // ✅ Correct way
            }}
          >
            <Ionicons name="home" size={18} color="#fff" />
            <Text style={s.btnPrimaryTxt}>Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  body: { padding: 20, paddingBottom: 120 },
  header: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0d47a1",
    marginBottom: 14,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#dce6fa",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e3a8a",
    marginBottom: 8,
  },
  triage: { fontSize: 22, fontWeight: "900", marginLeft: 8 },
  triageMsg: {
    fontSize: 15,
    color: "#1e293b",
    marginTop: 8,
    fontWeight: "600",
  },
  row: { flexDirection: "row", alignItems: "center" },
  riskBarWrap: { marginTop: 14 },
  riskBarBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  riskBarFill: { height: "100%", borderRadius: 5 },
  riskTxt: {
    textAlign: "right",
    fontSize: 13,
    marginTop: 4,
    color: "#374151",
    fontWeight: "600",
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  infoKey: { fontWeight: "700", color: "#0f172a" },
  infoVal: { color: "#334155", fontWeight: "600" },
  bulletItem: { flexDirection: "row", marginBottom: 6 },
  bulletDot: { marginRight: 8, color: "#1e3a8a", fontSize: 18 },
  bulletText: { flex: 1, fontSize: 14.5, color: "#1e293b" },
  actionTxt: { fontSize: 15, color: "#1f2937", fontWeight: "600" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#f6fbff",
    borderTopWidth: 1,
    borderTopColor: "#dbeafe",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  btn: {
    flex: 1,
    minHeight: 52,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  btnPrimary: { backgroundColor: "#3b6df6" },
  btnPrimaryTxt: { color: "#fff", fontWeight: "900", fontSize: 16 },
  btnGhost: { backgroundColor: "#eaf1ff", borderWidth: 1, borderColor: "#cfe1ff" },
  btnGhostTxt: { color: "#1f4ab8", fontWeight: "900", fontSize: 16 },
});
