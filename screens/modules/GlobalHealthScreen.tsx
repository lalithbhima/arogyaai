import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";


export default function GlobalHealthScreen({ navigation }: any) {
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [responses, setResponses] = useState<any>({});
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const BASE_URL =
    Platform.OS === "ios"
      ? "http://192.168.1.138:5003"
      : "http://10.0.2.2:5003";

  const runAI = async (endpoint: string) => {
    setLoadingType(endpoint);
    try {
      const res = await fetch(`${BASE_URL}/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const text = await res.text();
      console.log("AI raw response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { reply: text || "⚠️ No valid AI reply received." };
      }

      setResponses((r: any) => ({
        ...r,
        [endpoint]: data.reply || "No reply found.",
      }));

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error("AI fetch error:", err);
      setResponses((r: any) => ({
        ...r,
        [endpoint]:
          "⚠️ Could not connect to ArogyaAI backend. Make sure Flask (port 5003) is running.",
      }));
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <LinearGradient colors={["#dff3ff", "#f7fdff", "#e0fff6"]} style={s.bg}>
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Ionicons name="chevron-back" size={26} color="#2278f9" />
          </TouchableOpacity>
          <Text style={s.header}>Global Health Tools 🌍</Text>
        </View>

        {/* Hero */}
        <View style={s.hero}>
          <Ionicons
            name="earth-outline"
            size={46}
            color="#22b497"
            style={{ marginRight: 14 }}
          />
          <View>
            <Text style={s.heroTitle}>AI for Global Well-Being</Text>
            <Text style={s.heroDesc}>
              ArogyaAI monitors worldwide health patterns to protect {"\n"} lives using AI, data, and
              compassion.
            </Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 200 }}
        >
          {/* 🌎 Global Outbreak Tracker */}
          <View style={s.card}>
            <Text style={s.sectionTitle}>🌎 Live Global Outbreak Tracker</Text>
            <ExpandedGlobe />
            <TouchableOpacity
              style={[s.btn, { backgroundColor: "#22b497" }]}
              onPress={() => runAI("global_scan")}
              disabled={loadingType === "global_scan"}
            >
              {loadingType === "global_scan" ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="pulse-outline" size={18} color="#fff" />
                  <Text style={s.btnTxt}>AI Scan World Data</Text>
                </>
              )}
            </TouchableOpacity>
            {responses.global_scan && (
              <Animated.View style={[s.aiBox, { opacity: fadeAnim }]}>
                <Text style={s.aiText}>{responses.global_scan}</Text>
              </Animated.View>
            )}
          </View>

          {/* WHO Insight */}
          <FeatureCard
            icon="stats-chart-outline"
            title="WHO Data Insight"
            desc="Up-to-date global disease burden, mortality, and prevention metrics."
            color="#1b92f7"
            endpoint="global_who_insight"
            runAI={runAI}
            loadingType={loadingType}
            response={responses.global_who_insight}
            fadeAnim={fadeAnim}
          />

          {/* Outbreak Alerts */}
          <FeatureCard
            icon="notifications-outline"
            title="Predictive Outbreak Alerts"
            desc="AI forecasts disease spread using mobility, climate, and environmental data."
            color="#f97316"
            endpoint="global_alerts"
            runAI={runAI}
            loadingType={loadingType}
            response={responses.global_alerts}
            fadeAnim={fadeAnim}
          />

          {/* Prevention Hub */}
          <FeatureCard
            icon="bulb-outline"
            title="Preventive Health Hub"
            desc="Region-specific vaccination, nutrition, and lifestyle guidance."
            color="#23b7a0"
            endpoint="global_prevention"
            runAI={runAI}
            loadingType={loadingType}
            response={responses.global_prevention}
            fadeAnim={fadeAnim}
          />
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* 🌍 Expanded Globe Icon with Labels */
const ExpandedGlobe = () => (
  <View style={s.mapBox}>
    <View style={{ alignItems: "center" }}>
      <Ionicons name="earth-outline" size={120} color="#22b497" />
      <View style={{ marginTop: 10, alignItems: "center" }}>
        <Text style={s.globeLabel}>🌎 North America</Text>
        <Text style={s.globeLabel}>🌍 Europe</Text>
        <Text style={s.globeLabel}>🌏 Asia</Text>
      </View>
    </View>
  </View>
);

/* 🧠 Reusable Feature Card */
const FeatureCard = ({
  icon,
  title,
  desc,
  color,
  endpoint,
  runAI,
  loadingType,
  response,
  fadeAnim,
}: any) => (
  <View style={s.card}>
    <View style={[s.iconWrap, { backgroundColor: "#eaf6ff" }]}>
      <Ionicons name={icon} size={30} color={color} />
    </View>
    <Text style={s.cardTitle}>{title}</Text>
    <Text style={s.cardDesc}>{desc}</Text>
    <TouchableOpacity
      style={[s.btn, { backgroundColor: color }]}
      onPress={() => runAI(endpoint)}
      disabled={loadingType === endpoint}
    >
      {loadingType === endpoint ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={s.btnTxt}>Run AI Analysis</Text>
      )}
    </TouchableOpacity>
    {response && (
      <Animated.View style={[s.aiBox, { opacity: fadeAnim }]}>
        <Text style={s.aiText}>{response}</Text>
      </Animated.View>
    )}
  </View>
);

const s = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 18 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 14,
  },
  back: { padding: 4 },
  header: { fontSize: 22, fontWeight: "800", color: "#1d68af", marginLeft: 10 },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eafef8",
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  heroDesc: {
    fontSize: 13.8,
    color: "#527389",
    marginTop: 3,
    lineHeight: 19,
    flexShrink: 1,
    flexWrap: "wrap",
    width: "100%",
  },
  heroTitle: { fontSize: 17.5, fontWeight: "800", color: "#1b3e6e" },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#2278f9", marginVertical: 10 },
  mapBox: {
    height: 200,
    borderRadius: 18,
    backgroundColor: "#f0fffb",
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#b2f7e2",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  globeLabel: {
    fontSize: 13.5,
    color: "#1b3e6e",
    fontWeight: "600",
    marginVertical: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#cbeafe",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#1b3e6e" },
  cardDesc: { fontSize: 13.8, color: "#527389", marginBottom: 10, lineHeight: 19 },
  btn: { borderRadius: 14, paddingVertical: 8, paddingHorizontal: 16, alignSelf: "flex-start" },
  btnTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  aiBox: {
    marginTop: 10,
    backgroundColor: "#f0f9ff",
    padding: 14,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#22b497",
  },
  aiText: { fontSize: 13.5, color: "#325c7e", lineHeight: 20 },
});
