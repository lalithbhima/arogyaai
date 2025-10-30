import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Swipeable } from "react-native-gesture-handler";
import { Alert } from "react-native";


// ❌ REMOVE THIS MOCK_PROFILES BLOCK
// const MOCK_PROFILES = [
//   { id: "1", name: "Lalith", subtitle: "Primary profile" },
//   { id: "2", name: "Bhavika", subtitle: "Family member" },
// ];

export default function PassportScreen({ navigation }: any) {
  // ✅ Add this section right here
  const [profiles, setProfiles] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadProfiles = async () => {
        try {
          const savedProfiles = await AsyncStorage.getItem("allProfiles");

          if (savedProfiles) {
            setProfiles(JSON.parse(savedProfiles));
          } else {
            // fallback: load main onboarding profile if allProfiles not set
            const single = await AsyncStorage.getItem("userProfile");
            if (single) {
              const u = JSON.parse(single);
              const primary = [{
                id: Date.now().toString(),
                name: u.name || "User",
                age: u.age || "",
                gender: u.gender || "",
                subtitle: "Primary profile"
              }];
              setProfiles(primary);
              await AsyncStorage.setItem("allProfiles", JSON.stringify(primary));
            } else {
              setProfiles([]);
            }
          }
        } catch (e) {
          console.error("❌ Error loading profiles:", e);
        }
      };

      loadProfiles();
    }, [])
  );

  return (
    <LinearGradient colors={["#e7f6ff", "#f7fdff", "#e0fff6"]} style={{ flex: 1 }}>
      <SafeAreaView style={s.container}>
        <Text style={[s.header, { fontSize: 22, marginTop: 20 }]}>Health Profiles</Text>

        <FlatList
          // ✅ Use your dynamic profiles here
          data={profiles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 80 }}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() => (
                <View
                  style={{
                    backgroundColor: "#ff3b30",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    paddingHorizontal: 20,
                    borderRadius: 18,
                    marginVertical: 4,
                  }}
                >
                  <Ionicons name="trash-outline" size={22} color="#fff" />
                </View>
              )}
              onSwipeableOpen={() => {
                Alert.alert(
                  "Delete Profile",
                  `Are you sure you want to remove ${item.name}'s profile?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          const saved = JSON.parse((await AsyncStorage.getItem("allProfiles")) || "[]");
                          const updated = saved.filter((p: any) => p.id !== item.id);
                          await AsyncStorage.setItem("allProfiles", JSON.stringify(updated));
                          setProfiles(updated);
                        } catch (e) {
                          console.error("❌ Error deleting profile:", e);
                        }
                      },
                    },
                  ]
                );
              }}
            >
              <TouchableOpacity
                style={s.card}
                onPress={() => navigation.navigate("PassportProfile", { profile: item })}
              >
                <View style={s.cardInner}>
                  <Ionicons name="person-circle-outline" size={32} color="#42a9f9" />
                  <View style={{ marginLeft: 14 }}>
                    <Text style={s.name}>{item.name}</Text>
                    <Text style={s.subtitle}>{item.subtitle}</Text>
                  </View>
                  <Ionicons
                    name="chevron-forward-circle-outline"
                    size={26}
                    color="#bddfff"
                    style={{ marginLeft: "auto" }}
                  />
                </View>
              </TouchableOpacity>
            </Swipeable>
          )}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 30, color: "#6b7280" }}>
              No profiles found yet
            </Text>
          }
        />

        <TouchableOpacity
          style={s.addBtn}
          onPress={() => navigation.navigate("AddMemberScreen")}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent", paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", marginVertical: 18 },
  header: { fontSize: 20, fontWeight: "800", color: "#1f2937", marginLeft: 12 },
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
  addBtn: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#2563eb",
    borderRadius: 30,
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  name: { fontSize: 16, fontWeight: "600", color: "#111827" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
});
