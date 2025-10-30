import React, { useRef, useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  TextInput,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
 

export default function SupportScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [aiReply, setAiReply] = useState("");
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const BASE_URL =
    Platform.OS === "ios"
      ? "http://192.168.1.138:5006"
      : "http://10.0.2.2:5006";

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const askSupport = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAiReply("");
    try {
      const res = await fetch(`${BASE_URL}/api/support_ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });
      const data = await res.json();
      setAiReply(data.reply || "No response from ArogyaAI Support.");
    } catch {
      setAiReply("⚠️ Unable to reach ArogyaAI support backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#e3f1ff", "#f8fdff", "#e0fff8"]} style={s.bg}>
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Ionicons name="chevron-back" size={26} color="#1d68af" />
          </TouchableOpacity>
          <Text style={s.header}>Support & Tutorials 💡</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
          {/* Hero */}
          <Animated.View style={[s.hero, { opacity: fadeAnim }]}>
            <Ionicons name="help-buoy-outline" size={52} color="#fff" />
            <Text style={s.heroTitle}>We’re Here to Help</Text>
            <Text style={s.heroDesc}>
              Learn how to get the most out of ArogyaAI’s tools, find answers, and explore guided tutorials to master your health assistant.
            </Text>
          </Animated.View>

          {/* Search & AI Support */}
          <View style={s.aiBox}>
            <Text style={s.label}>Ask ArogyaAI Support</Text>
            <TextInput
              style={s.input}
              placeholder="Type your question (e.g., How do I add a family member?)"
              placeholderTextColor="#8fa7b3"
              value={query}
              onChangeText={setQuery}
            />
            <TouchableOpacity style={s.askBtn} onPress={askSupport} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
                  <Text style={s.askTxt}>Ask Support</Text>
                </>
              )}
            </TouchableOpacity>

            {aiReply ? (
              <View style={s.replyBox}>
                <Text style={s.reply}>{aiReply}</Text>
              </View>
            ) : null}
          </View>

          {/* Quick Tutorials */}
          <Text style={s.sectionTitle}>🎓 Getting Started Tutorials</Text>
          <View style={s.cardRow}>
            <TutorialCard
              icon="home-outline"
              title="Using the Home Dashboard"
              color="#1b92f7"
              desc="Understand your AI assistant, daily health overview, and personalized alerts."
              link="TutorialHomeScreen"
              navigation={navigation}
            />
            <TutorialCard
              icon="shield-checkmark-outline"
              title="Privacy & Data Safety"
              color="#22b497"
              desc="Learn how ArogyaAI protects your information and ensures compliance with privacy laws."
              link="TutorialPrivacyScreen"
              navigation={navigation}
            />
          </View>

          <View style={s.cardRow}>
            <TutorialCard
              icon="flask-outline"
              title="Lab Report AI Analyzer"
              color="#f59e0b"
              desc="Upload or paste reports for instant AI-powered insights and health summaries."
              link="TutorialLabsScreen"
              navigation={navigation}
            />
            <TutorialCard
              icon="earth-outline"
              title="Global Health Tools"
              color="#0ea5e9"
              desc="Explore worldwide health trends, outbreak maps, and real-time safety insights."
              link="TutorialGlobalScreen"
              navigation={navigation}
            />
          </View>

          {/* Feature Help Categories */}
          <Text style={s.sectionTitle}>🧭 Explore Key Features</Text>
          <FeatureList
            title="AI Health Assistant 🤖"
            desc="Chat with our medical-grade AI to understand symptoms, lab trends, or wellness goals."
          />
          <FeatureList
            title="Family Mode 👨‍👩‍👧"
            desc="Add loved ones and manage shared health profiles seamlessly."
          />
          <FeatureList
            title="Immune Risk & Genomic Insights 🧬"
            desc="Predict immune risk using cutting-edge multi-modal models developed by ArogyaAI Labs."
          />
          <FeatureList
            title="Chronic Care Planner ❤️"
            desc="Monitor diabetes, hypertension, and long-term conditions with adaptive care plans."
          />

          {/* Contact Section */}
          <View style={s.contactBox}>
            <Ionicons name="mail-outline" size={28} color="#22b497" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.contactTitle}>Need More Help?</Text>
              <Text style={s.contactText}>
                Reach our support team 24/7 at{" "}
                <Text
                  style={s.link}
                  onPress={() => Linking.openURL("mailto:support@arogyaai.org")}
                >
                  support@arogyaai.org
                </Text>
              </Text>
            </View>
          </View>

          {/* Footer */}
          <Text style={s.footer}>
            © {new Date().getFullYear()} ArogyaAI · Built for Compassionate Intelligence
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* Tutorial Card Component */
const TutorialCard = ({ icon, title, desc, color, link, navigation }: any) => (
  <TouchableOpacity
    style={[s.tutorialCard, { borderLeftColor: color }]}
    onPress={() => navigation.navigate(link)}
  >
    <Ionicons name={icon} size={26} color={color} />
    <Text style={s.tutorialTitle}>{title}</Text>
    <Text style={s.tutorialDesc}>{desc}</Text>
    <Text style={[s.learnMore, { color }]}>Learn More →</Text>
  </TouchableOpacity>
);

/* Feature List Item */
const FeatureList = ({ title, desc }: any) => (
  <View style={s.featureItem}>
    <Ionicons name="checkmark-circle-outline" size={20} color="#22b497" />
    <View style={{ flex: 1 }}>
      <Text style={s.featureTitle}>{title}</Text>
      <Text style={s.featureDesc}>{desc}</Text>
    </View>
  </View>
);

const s = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 14 },
  back: { padding: 4 },
  header: { fontSize: 22, fontWeight: "800", color: "#1d68af", marginLeft: 10 },
  hero: {
    backgroundColor: "#1b92f7",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#1b92f7",
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  heroTitle: { fontSize: 18, fontWeight: "800", color: "#fff", marginTop: 10 },
  heroDesc: { fontSize: 13.5, color: "#e3f2ff", textAlign: "center", marginTop: 6, lineHeight: 20 },
  aiBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#b5dbff",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  label: { fontSize: 13, fontWeight: "700", color: "#1b3e6e", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#cbe4f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1b3e6e",
  },
  askBtn: {
    marginTop: 14,
    backgroundColor: "#22b497",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    paddingVertical: 10,
  },
  askTxt: { color: "#fff", fontWeight: "700", fontSize: 15, marginLeft: 6 },
  replyBox: {
    backgroundColor: "#f0faff",
    marginTop: 16,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#1b92f7",
  },
  reply: { fontSize: 14, color: "#325c7e", lineHeight: 21 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#1b3e6e", marginTop: 20, marginBottom: 10 },
  cardRow: { flexDirection: "row", justifyContent: "space-between" },
  tutorialCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "48%",
    padding: 16,
    marginBottom: 14,
    borderLeftWidth: 4,
    shadowColor: "#cbeafe",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tutorialTitle: { fontSize: 14.5, fontWeight: "800", color: "#1b3e6e", marginTop: 8 },
  tutorialDesc: { fontSize: 12.8, color: "#527389", marginTop: 4, lineHeight: 18 },
  learnMore: { fontSize: 13, fontWeight: "700", marginTop: 8 },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#cbeafe",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  featureTitle: { fontSize: 14.5, fontWeight: "700", color: "#1b3e6e" },
  featureDesc: { fontSize: 13, color: "#527389", marginTop: 2 },
  contactBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eafef8",
    borderRadius: 18,
    padding: 16,
    marginTop: 20,
  },
  contactTitle: { fontSize: 15, fontWeight: "800", color: "#1b3e6e" },
  contactText: { fontSize: 13, color: "#527389", marginTop: 2 },
  link: { color: "#22b497", fontWeight: "700" },
  footer: {
    textAlign: "center",
    fontSize: 12.5,
    color: "#7189a0",
    marginTop: 26,
    marginBottom: 20,
  },
});
