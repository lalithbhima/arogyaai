import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";


export default function EthicsDetailScreen({ route, navigation }: any) {
  const { title, topic } = route.params;


  const renderContent = () => {
    switch (topic) {
      case "AI Transparency":
        return (
          <>
            <Text style={s.heading}>AI Transparency</Text>
            <Text style={s.text}>
              ArogyaAI provides model interpretability and explainability using
              global feature importance, confidence levels, and traceable data
              paths.{"\n\n"}
              Every AI suggestion includes “why” reasoning, visible audit trails,
              and optional community-reviewed summaries. This ensures both
              accountability and user education.
            </Text>
          </>
        );
      case "Data Consent Control":
        return (
          <>
            <Text style={s.heading}>Data Consent Control</Text>
            <Text style={s.text}>
              You’re always in control of your information. You can opt in or
              out of AI modules, delete records, or anonymize stored data.{"\n\n"}
              Consent preferences can be changed anytime under Settings →
              Privacy Controls. ArogyaAI never shares personal data without
              explicit permission.
            </Text>
          </>
        );
      case "User Rights Panel":
        return (
          <>
            <Text style={s.heading}>User Rights Panel</Text>
            <Text style={s.text}>
              As a user, you have the right to access, correct, export, or erase
              your data.{"\n\n"}
              ArogyaAI complies with international frameworks such as GDPR and
              HIPAA, ensuring that all requests are honored quickly and securely.
            </Text>
          </>
        );
      case "Audit & Accountability":
        return (
          <>
            <Text style={s.heading}>Audit & Accountability</Text>
            <Text style={s.text}>
              All AI predictions, corrections, and manual overrides are logged in
              a secure audit ledger.{"\n\n"}
              This transparency ensures fairness, builds trust, and helps
              regulators and researchers understand how ArogyaAI learns over
              time.
            </Text>
          </>
        );
      default:
        return <Text style={s.text}>More details coming soon.</Text>;
    }
  };

  return (
    <LinearGradient colors={["#e7f6ff", "#f7fdff", "#e0fff6"]} style={s.bg}>
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Ionicons name="chevron-back" size={26} color="#2278f9" />
          </TouchableOpacity>
          <Text style={s.header}>{title}</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          <View style={s.card}>{renderContent()}</View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

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
  header: { fontSize: 20, fontWeight: "800", color: "#1d68af", marginLeft: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 22,
    shadowColor: "#cbeafe",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
  },
  heading: { fontSize: 18, fontWeight: "800", color: "#1b3e6e", marginBottom: 8 },
  text: { fontSize: 14, color: "#527389", lineHeight: 22 },
});
