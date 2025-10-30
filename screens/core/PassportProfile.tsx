import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";


const SECTIONS = [
  { id: "basic", label: "Basic information", icon: "id-card-outline" },
  { id: "personal", label: "Personal information", icon: "person-outline" },
  { id: "history", label: "Health background", icon: "medkit-outline" },
  { id: "medication", label: "Medication", icon: "bandage-outline" },
  { id: "allergies", label: "Allergies", icon: "alert-circle-outline" },
];

const ACTIVITY = [
  { id: "assess", label: "Health assessments", icon: "list-circle-outline" },
  { id: "symptoms", label: "Symptom tracking", icon: "pulse-outline" },
];

export default function PassportProfile({ route, navigation }: any) {
  const { profile } = route.params;

  const renderRow = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={s.card}
      onPress={() => navigation.navigate("ProfileDetail", { sectionId: item.id, profileId: profile.id, })}
    >
      <View style={s.cardInner}>
        <Ionicons name={item.icon} size={22} color="#42a9f9" style={{ marginRight: 14 }} />
        <Text style={s.rowText}>{item.label}</Text>
        <Ionicons
          name="chevron-forward-circle-outline"
          size={22}
          color="#bddfff"
          style={{ marginLeft: "auto" }}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#e7f6ff", "#f7fdff", "#e0fff6"]} style={{ flex: 1 }}>
      <SafeAreaView style={s.container}>
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
          {/* Header */}
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color="#2563eb" style={{ marginLeft: 15 }} />
            </TouchableOpacity>
            <Text style={s.header}>{profile.name}</Text>
          </View>

          {/* Information */}
          <Text style={s.sectionTitle}>Your information</Text>
          {SECTIONS.map(renderRow)}

          {/* Activity */}
          <Text style={s.sectionTitle}>Your activity</Text>
          {ACTIVITY.map(renderRow)}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent", paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginVertical: 18 },
  header: { fontSize: 20, fontWeight: "800", color: "#1f2937", marginLeft: 12 },
  sectionTitle: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    marginVertical: 7,
    marginHorizontal: 4,
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowColor: "#cbeafe",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 2,
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowText: { fontSize: 16, fontWeight: "500", color: "#111827" },
});
