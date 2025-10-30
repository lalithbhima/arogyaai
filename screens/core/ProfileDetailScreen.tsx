import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth } from "firebase/auth";
import { app } from "../../firebaseConfig";

export default function ProfileDetailScreen({ route, navigation }: any) {
  const { sectionId, profileId } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const loadData = async () => {
    try {
      const allProfiles = JSON.parse((await AsyncStorage.getItem("allProfiles")) || "[]");
      const userProfile = JSON.parse((await AsyncStorage.getItem("userProfile")) || "{}");
      const auth = getAuth(app);
      const user = auth.currentUser;
      const savedPassword = await AsyncStorage.getItem("savedPassword");

      // 🧭 Decide which profile we’re viewing
      let selectedProfile = null;
      if (profileId) {
        selectedProfile = allProfiles.find((p: any) => p.id === profileId);
      }

      // Fallback: if no matching family member found, show the logged-in user
      const profileData = selectedProfile || userProfile || {};

      let sectionData: any = {};

      switch (sectionId) {
        case "basic":
          sectionData = {
            Name: profileData.name || "N/A",
            Age: profileData.age || "N/A",
            Gender: profileData.gender || "N/A",
          };
          break;

        case "personal":
        // 🔹 Determine if this is the *primary* profile (first/main account)
        const all = JSON.parse((await AsyncStorage.getItem("allProfiles")) || "[]");
        const primaryId = all.length > 0 ? all[0].id : null;

        if (selectedProfile && selectedProfile.id !== primaryId) {
            // Family member → no credentials
            sectionData = {
            Relation: "Family Member",
            Email: "Not linked to account",
            };
        } else {
            // Primary user → show Firebase credentials
            sectionData = {
            Email: user?.email || "N/A",
            Password: savedPassword ? "********" : "N/A",
            };
        }
        break;

        case "history":
          sectionData = {
            "Blood Type": profileData.bloodType || "N/A",
            "Medical Conditions": profileData.conditions || "None",
          };
          break;

        case "medication":
          sectionData = {
            Medication: profileData.medication || "None listed",
          };
          break;

        case "allergies":
          sectionData = {
            Allergies: profileData.allergies || "None listed",
          };
          break;

        default:
          sectionData = { Info: "Section not implemented yet." };
      }

      setData(sectionData);
    } catch (e) {
      console.error("❌ Error loading section data:", e);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [sectionId, profileId]);

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
          <Text style={s.header}>
            {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} Details
          </Text>
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
