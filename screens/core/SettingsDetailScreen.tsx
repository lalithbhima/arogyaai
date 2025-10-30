import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function SettingsDetailScreen({ route, navigation }: any) {
  const { sectionId } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      let sectionData: any = {};

      switch (sectionId) {
        case "Account Login":
          sectionData = {
            "Email / Biometric Login": "Enable Face ID, Touch ID, or email login options.",
            "Session Timeout": "Adjust how long you stay logged in before re-authentication.",
          };
          break;

        case "Privacy and Notifications":
          sectionData = {
            "Data Privacy": "Your data is securely stored and never shared without consent.",
            "Push Notifications": "Enable health tips, reminders, and activity alerts.",
            "Emergency Access": "Choose trusted contacts for emergency medical access.",
          };
          break;

        case "Language":
          sectionData = {
            "App Language": "Switch between English, Español, or తెలుగు.",
            "Text Size": "Adjust readability preferences.",
          };
          break;

        case "About ArogyaAI":
          sectionData = {
            "Version": "1.0.0",
            "Developed by": "ArogyaAI Society",
            "Mission": "AI-powered health for everyone, everywhere.",
          };
          break;

        case "Safety Information":
          sectionData = {
            "Medical Disclaimer": "ArogyaAI provides insights only, not medical advice.",
            "Data Security": "HIPAA-grade encryption protects all stored data.",
          };
          break;

        case "Rate ArogyaAI":
          sectionData = {
            "Feedback": "We value your feedback! Rate ArogyaAI in the app store.",
            "Contact": "support@arogyaai.org",
          };
          break;

        default:
          sectionData = { Info: "Section not implemented yet." };
      }

      setData(sectionData);
      setLoading(false);
    };

    loadData();
  }, [sectionId]);

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color="#23c07e" />
      </View>
    );
  }

  return (
    <LinearGradient colors={["#e7f6ff", "#f7fdff", "#e0fff6"]} style={{ flex: 1 }}>
      <SafeAreaView style={s.container}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
            <Ionicons name="chevron-back" size={22} color="#2563eb" />
          </TouchableOpacity>
          <Text style={s.header}>{sectionId}</Text>
        </View>

        <ScrollView contentContainerStyle={s.scroll}>
          {Object.entries(data || {}).map(([key, value]) => (
            <View key={key} style={s.card}>
              <Text style={s.cardTitle}>{key}</Text>
              <Text style={s.cardValue}>{String(value)}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent", paddingHorizontal: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", marginVertical: 16 },
  header: { fontSize: 20, fontWeight: "800", color: "#1f2937", marginLeft: 10 },
  scroll: { paddingBottom: 60 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#bde0fe",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#2563eb", marginBottom: 4 },
  cardValue: { fontSize: 16, color: "#1f2937" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
