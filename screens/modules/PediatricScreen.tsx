import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";


type AIKeys = "peds_triage" | "peds_milestones" | "peds_parent_tips";

export default function PediatricScreen({ navigation }: any) {
  // ---------------- UI STATE ----------------
  const [ageMonths, setAgeMonths] = useState<number>(12);
  const [symptoms, setSymptoms] = useState<string>("");
  const [loadingKey, setLoadingKey] = useState<AIKeys | null>(null);
  const [reply, setReply] = useState<Record<string, string>>({});
  const pulse = useRef(new Animated.Value(1)).current;

  // ---------------- BACKEND URL ----------------
  const BASE_URL =
    Platform.OS === "ios"
      ? "http://192.168.1.138:5004" // <-- your Mac's local IP (change for your LAN)
      : "http://10.0.2.2:5004";     // Android emulator → host

  // ---------------- ANIMATION ----------------
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1300, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1300, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  // ---------------- HELPERS ----------------
  const ageLabel = useMemo(() => {
    if (ageMonths < 12) return `${ageMonths} mo`;
    const y = Math.floor(ageMonths / 12);
    const m = ageMonths % 12;
    return m ? `${y}y ${m}m` : `${y}y`;
  }, [ageMonths]);

  const callAI = async (key: AIKeys, body: any) => {
    setLoadingKey(key);
    try {
      const res = await fetch(`${BASE_URL}/api/${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {}),
      });
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        data = { reply: text };
      }
      setReply((r) => ({ ...r, [key]: data.reply || "No response." }));
    } catch (e) {
      setReply((r) => ({
        ...r,
        [key]: "⚠️ Could not reach ArogyaAI Pediatric backend. Is Flask on 5004?",
      }));
    } finally {
      setLoadingKey(null);
    }
  };

  // ---------------- RENDER ----------------
  return (
    <LinearGradient colors={["#ecf6ff", "#f7feff", "#eaffe9"]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Ionicons name="chevron-back" size={26} color="#1e77ff" />
          </TouchableOpacity>
          <Text style={s.header}>ArogyaAI Pediatrics 👶</Text>
          <View style={{ width: 26 }} />
        </View>

        {/* Ribbon */}
        <Animated.View style={[s.ribbon, { transform: [{ scale: pulse }] }]}>
          <Ionicons name="sparkles-outline" size={22} color="#fff" />
          <Text style={s.ribbonTxt}>Gentle guidance for kids — and their heroes.</Text>
        </Animated.View>

        <ScrollView contentContainerStyle={{ paddingBottom: 180 }} showsVerticalScrollIndicator={false}>
          {/* Age Control */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="balloon-outline" size={22} color="#0ea5e9" />
              <Text style={s.cardTitle}>Child Profile</Text>
            </View>

            <View style={s.rowSplit}>
              <View style={{ flex: 1 }}>
                <Text style={s.label}>Age (months)</Text>
                <View style={s.spinRow}>
                  <TouchableOpacity
                    style={[s.spinBtn, { opacity: ageMonths <= 0 ? 0.4 : 1 }]}
                    disabled={ageMonths <= 0}
                    onPress={() => setAgeMonths(Math.max(0, ageMonths - 1))}
                  >
                    <Ionicons name="remove-outline" size={20} color="#0ea5e9" />
                  </TouchableOpacity>
                  <Text style={s.ageNum}>{ageMonths}</Text>
                  <TouchableOpacity
                    style={s.spinBtn}
                    onPress={() => setAgeMonths(Math.min(216, ageMonths + 1))}
                  >
                    <Ionicons name="add-outline" size={20} color="#0ea5e9" />
                  </TouchableOpacity>
                </View>
                <Text style={s.subtle}>≈ {ageLabel}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={s.label}>Symptoms (optional)</Text>
                <TextInput
                  value={symptoms}
                  onChangeText={setSymptoms}
                  placeholder="fever, cough, rash…"
                  placeholderTextColor="#90a4b8"
                  style={s.input}
                  multiline
                />
              </View>
            </View>

            {/* Triage Button */}
            <TouchableOpacity
              style={[s.bigBtn, { backgroundColor: "#10b981" }]}
              onPress={() => callAI("peds_triage", { age_months: ageMonths, symptoms })}
              disabled={loadingKey === "peds_triage"}
            >
              {loadingKey === "peds_triage" ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="medkit-outline" size={18} color="#fff" />
                  <Text style={s.bigBtnTxt}>AI Triage Guidance</Text>
                </>
              )}
            </TouchableOpacity>

            {!!reply.peds_triage && (
              <View style={s.aiBox}>
                <Text style={s.aiTxt}>{reply.peds_triage}</Text>
                <Text style={s.disclaimer}>
                  Not a diagnosis. Seek urgent care for severe symptoms, breathing difficulty,
                  dehydration, injury, or parental concern.
                </Text>
              </View>
            )}
          </View>

          {/* Milestones Coach */}
          <View style={s.cardAlt}>
            <View style={s.cardHeader}>
              <Ionicons name="ribbon-outline" size={22} color="#f97316" />
              <Text style={s.cardTitle}>Milestones Coach</Text>
            </View>
            <Text style={s.helper}>
              Get play ideas and language prompts tailored to {ageLabel}.
            </Text>

            <TouchableOpacity
              style={[s.bigBtn, { backgroundColor: "#f97316" }]}
              onPress={() => callAI("peds_milestones", { age_months: ageMonths })}
              disabled={loadingKey === "peds_milestones"}
            >
              {loadingKey === "peds_milestones" ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="game-controller-outline" size={18} color="#fff" />
                  <Text style={s.bigBtnTxt}>Coach Me</Text>
                </>
              )}
            </TouchableOpacity>

            {!!reply.peds_milestones && (
              <View style={s.aiBox}>
                <Text style={s.aiTxt}>{reply.peds_milestones}</Text>
              </View>
            )}
          </View>

          {/* Parent Calm Kit */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <Ionicons name="heart-outline" size={22} color="#6366f1" />
              <Text style={s.cardTitle}>Parent Calm Kit</Text>
            </View>
            <Text style={s.helper}>
              Sleepless night? Tough day? Ask ArogyaAI for compassionate, evidence-informed calming tips.
            </Text>

            <TouchableOpacity
              style={[s.bigBtn, { backgroundColor: "#6366f1" }]}
              onPress={() => callAI("peds_parent_tips", { context: symptoms || "general" })}
              disabled={loadingKey === "peds_parent_tips"}
            >
              {loadingKey === "peds_parent_tips" ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
                  <Text style={s.bigBtnTxt}>Give Me Tips</Text>
                </>
              )}
            </TouchableOpacity>

            {!!reply.peds_parent_tips && (
              <View style={s.aiBox}>
                <Text style={s.aiTxt}>{reply.peds_parent_tips}</Text>
              </View>
            )}
          </View>

          {/* Bottom Safety Strip */}
          <View style={s.safetyStrip}>
            <Ionicons name="information-circle-outline" size={18} color="#0ea5e9" />
            <Text style={s.safetyTxt}>
              ArogyaAI offers supportive guidance only. If you’re worried, trust your instincts and
              contact a clinician or emergency services.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginTop: 8,
    marginBottom: 8,
  },
  back: { padding: 4, marginRight: 8 },
  header: { fontSize: 22, fontWeight: "800", color: "#0f4aa3", flex: 1, textAlign: "center" },
  ribbon: {
    marginHorizontal: 18,
    backgroundColor: "#0ea5e9",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  ribbonTxt: { color: "#fff", fontWeight: "700", fontSize: 13.5 },
  card: {
    backgroundColor: "#ffffff",
    marginHorizontal: 18,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#a8d3ff",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardAlt: {
    backgroundColor: "#fff7ed",
    marginHorizontal: 18,
    marginTop: 14,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  cardTitle: { fontWeight: "800", fontSize: 16.5, color: "#0b3a66" },
  rowSplit: { flexDirection: "row", gap: 12, marginTop: 8 },
  label: { fontSize: 12.5, color: "#5d7794", fontWeight: "700", marginBottom: 6 },
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d7e4f2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#113a5c",
  },
  spinRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f0f6ff",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#d7e4f2",
    width: 160,
  },
  spinBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#e7f1ff",
    alignItems: "center",
    justifyContent: "center",
  },
  ageNum: { fontSize: 18, fontWeight: "800", color: "#0b3a66", width: 50, textAlign: "center" },
  subtle: { color: "#7391aa", marginTop: 4, fontSize: 12 },
  helper: { color: "#5d7794", fontSize: 13.5, marginBottom: 10 },
  bigBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  bigBtnTxt: { color: "#fff", fontWeight: "800", fontSize: 14.5 },
  aiBox: {
    marginTop: 12,
    backgroundColor: "#f1f8ff",
    borderRadius: 14,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#0ea5e9",
  },
  aiTxt: { color: "#244b6b", fontSize: 13.6, lineHeight: 20 },
  disclaimer: { color: "#6b7f91", fontSize: 12, marginTop: 8 },
  safetyStrip: {
    marginTop: 18,
    marginHorizontal: 18,
    backgroundColor: "#ecfeff",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  safetyTxt: { color: "#075985", fontSize: 12.5, flex: 1, lineHeight: 18 },
});
