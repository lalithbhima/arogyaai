import React, { useRef, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";


export default function EthicsScreen({ navigation }: any) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient colors={["#e7f6ff", "#f7fdff", "#e0fff6"]} style={s.bg}>
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Ionicons name="chevron-back" size={26} color="#2278f9" />
          </TouchableOpacity>
          <Text style={s.header}>Ethics & Privacy Center</Text>
        </View>

        {/* Hero Section */}
        <Animated.View style={[s.hero, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="shield-checkmark-outline" size={52} color="#22b497" />
          <Text style={s.heroTitle}>Built on Trust, Guided by Ethics</Text>
          <Text style={s.heroDesc}>
            ArogyaAI follows human-centered AI principles—safety, transparency, and user control.
          </Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
          <Section
            navigation={navigation}
            icon="eye-outline"
            color="#1b92f7"
            title="AI Transparency"
            desc="Understand how ArogyaAI’s models interpret data, make predictions, and self-correct biases."
            btn="Learn More"
          />

          <Section
            navigation={navigation}
            icon="document-lock-outline"
            color="#2563eb"
            title="Data Consent Control"
            desc="You decide what data is stored, shared, or erased. Manage granular permissions anytime."
            btn="Manage Consent"
          />

          <Section
            navigation={navigation}
            icon="person-outline"
            color="#23a7a0"
            title="User Rights Panel"
            desc="Access, rectify, or delete your personal health data. You have full ownership of your information."
            btn="Access Rights"
          />

          <Section
            navigation={navigation} 
            icon="clipboard-outline"
            color="#42a9f9"
            title="Audit & Accountability"
            desc="View detailed logs of all AI recommendations and human override events for complete transparency."
            btn="Open Logs"
          />

          {/* Ethics Manifesto */}
          <View style={s.manifestoBox}>
            <Ionicons name="sparkles-outline" size={26} color="#22b497" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.manifestoTitle}>ArogyaAI Promise</Text>
              <Text style={s.manifestoText}>
                Every prediction and insight is designed to heal, not to harm.  
                Your privacy is sacred. Your trust is our foundation. 💙
              </Text>
            </View>
          </View>

          {/* Bottom Buttons */}
          <View style={s.bottomActions}>
            <TouchableOpacity style={[s.quickBtn, { backgroundColor: "#22b497" }]}>
              <Ionicons name="book-outline" size={20} color="#fff" />
              <Text style={s.quickTxt}>Ethics Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.quickBtn, { backgroundColor: "#1b92f7" }]}>
              <Ionicons name="people-outline" size={20} color="#fff" />
              <Text style={s.quickTxt}>Meet Our AI Board</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* COMPONENT */
const Section = ({ icon, color, title, desc, btn, navigation, route }: any) => (
  <View style={s.card}>
    <View style={[s.iconWrap, { backgroundColor: "#eaf6ff" }]}>
      <Ionicons name={icon} size={34} color={color} />
    </View>
    <Text style={s.cardTitle}>{title}</Text>
    <Text style={s.cardDesc}>{desc}</Text>
    <TouchableOpacity
      style={[s.btn, { backgroundColor: color }]}
      onPress={() => navigation.navigate("EthicsDetail", { title, topic: title })}
    >
      <Text style={s.btnTxt}>{btn}</Text>
    </TouchableOpacity>
  </View>
);

/* STYLES */
const s = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 14 },
  back: { padding: 4 },
  header: { fontSize: 22, fontWeight: "800", color: "#1d68af", marginLeft: 10 },
  hero: {
    backgroundColor: "#eafef8",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    shadowColor: "#baf5e7",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    marginBottom: 20,
  },
  heroTitle: { fontSize: 18, fontWeight: "800", color: "#1b3e6e", marginTop: 10, textAlign: "center" },
  heroDesc: { fontSize: 13.5, color: "#527389", textAlign: "center", marginTop: 5, lineHeight: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    marginBottom: 16,
    shadowColor: "#cbeafe",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#1b3e6e" },
  cardDesc: { fontSize: 13.8, color: "#527389", marginTop: 4, marginBottom: 8, lineHeight: 19 },
  btn: { borderRadius: 14, paddingVertical: 8, paddingHorizontal: 16, alignSelf: "flex-start" },
  btnTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  manifestoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eafef8",
    padding: 16,
    borderRadius: 18,
    marginTop: 10,
    shadowColor: "#c6f7eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  manifestoTitle: { fontSize: 14.5, fontWeight: "700", color: "#1b3e6e" },
  manifestoText: { fontSize: 13, color: "#40707a", marginTop: 2, lineHeight: 18 },
  bottomActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    flex: 0.48,
    shadowColor: "#bde8ff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 7,
  },
  quickTxt: { color: "#fff", fontWeight: "700", fontSize: 14.5, marginLeft: 7 },
});
