import React, { useState } from "react";
import { SafeAreaView, StyleSheet, View, FlatList } from "react-native";
import { Appbar, Searchbar, Card, Text, useTheme } from "react-native-paper";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";

// Hardcoded labels from en.json
const FEATURES = [
  {
    name: "Labs & Diagnostics",
    desc: "View your lab results and access advanced AI-powered diagnostics.",
    icon: "test-tube",
    screen: "LabsScreen",
  },
  {
    name: "Global Health Tools",
    desc: "Access global health resources, tools, and travel medicine information.",
    icon: "earth",
    screen: "GlobalHealthScreen",
  },
  {
    name: "Ethics & Privacy Center",
    desc: "Review privacy, ethics, and your personal data controls.",
    icon: "lock",
    screen: "EthicsScreen",
  },
  {
    name: "Mental Health AI",
    desc: "Mental health support and AI-powered mood analysis.",
    icon: "emoticon-happy-outline",
    screen: "MentalHealthScreen",
  },
  {
    name: "Pediatric Health",
    desc: "Health tools for kids and pediatric wellness tracking.",
    icon: "baby-face-outline",
    screen: "PediatricScreen",
  },
  {
    name: "Nutrition & Diet Coach",
    desc: "Personalized nutrition plans and healthy diet tracking.",
    icon: "food-apple",
    screen: "NutritionScreen",
  },
  {
    name: "Allergy & Asthma Tools",
    desc: "Track allergies, asthma, and triggers for better health.",
    icon: "weather-windy",
    screen: "AllergyScreen",
  },
  {
    name: "Fitness & Wellness",
    desc: "Log fitness activity and monitor wellness with AI feedback.",
    icon: "run",
    screen: "FitnessScreen",
  },
  {
    name: "Sleep Coach",
    desc: "Monitor and improve sleep quality with AI suggestions.",
    icon: "sleep",
    screen: "SleepScreen",
  },
  {
    name: "Support & Tutorials",
    desc: "Access support, tutorials, and help resources.",
    icon: "help-circle",
    screen: "SupportScreen",
  },
  {
    name: "Health News",
    desc: "Latest health news, research, and public health alerts.",
    icon: "newspaper",
    screen: "HealthNewsScreen",
  },
  {
    name: "Skin Cancer Analyzer",
    desc: "Analyze skin lesions with AI for risk detection.",
    icon: "dots-circle",
    screen: "SkinCancerScreen",
  },
  // If you also want Languages:
  // {
  //   name: "Global Languages",
  //   desc: "Switch interface languages.",
  //   icon: "translate",
  //   screen: "LanguagesScreen",
  // },
];

export default function MoreFeaturesScreen({ navigation }: any): JSX.Element {
  const [query, setQuery] = useState("");
  const theme = useTheme();

  const filtered = FEATURES.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <LinearGradient colors={["#e7f6ff", "#f7fdff", "#e0fff6"]} style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        {/* Appbar/Header */}
        <View style={styles.headerShadow}>
          <Appbar.Header style={styles.appbar}>
            <Appbar.Content
              title="All ArogyaAI Features"
              titleStyle={{
                color: "#2278f9",
                fontWeight: "bold",
                fontSize: 22,
                letterSpacing: -0.3,
              }}
            />
          </Appbar.Header>
        </View>

        {/* Searchbar */}
        <View style={{ paddingHorizontal: 18, marginTop: 2, marginBottom: 6 }}>
          <Searchbar
            placeholder="Search features"
            value={query}
            onChangeText={setQuery}
            style={styles.searchbar}
            inputStyle={{ fontSize: 16.5, color: "#19649a" }}
            iconColor="#1b92f7"
          />
        </View>

        {/* "Explore Modules" title */}
        <Text style={styles.title}>Explore Modules</Text>

        {/* Feature List */}
        <FlatList
          data={filtered}
          keyExtractor={item => item.screen}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Card
              style={styles.card}
              onPress={() => navigation?.navigate?.(item.screen)}
              elevation={4}
            >
              <View style={styles.cardInner}>
                <View style={styles.iconWrap}>
                  <Ionicons name={getIonicon(item.icon)} size={30} color="#42a9f9" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureName}>{item.name}</Text>
                  <Text style={styles.featureDesc}>{item.desc}</Text>
                </View>
                <Ionicons
                  name="chevron-forward-circle-outline"
                  size={28}
                  color="#bddfff"
                />
              </View>
            </Card>
          )}
          ListEmptyComponent={
            <View style={{ padding: 50, alignItems: "center" }}>
              <Ionicons name="search-outline" size={44} color="#b7c5e4" />
              <Text style={{ color: "#7b8ca7", fontSize: 16, marginTop: 8 }}>
                No matching features found.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

// Helper: map icons
function getIonicon(icon: string) {
  const map: any = {
    "test-tube": "flask-outline",
    earth: "earth-outline",
    lock: "lock-closed-outline",
    "emoticon-happy-outline": "happy-outline",
    "baby-face-outline": "accessibility-outline",
    "food-apple": "nutrition-outline",
    "weather-windy": "cloudy-outline",
    run: "walk-outline",
    sleep: "moon-outline",
    "help-circle": "help-circle-outline",
    translate: "language-outline",
    newspaper: "newspaper-outline",
    "dots-circle": "aperture-outline",
  };
  return map[icon] || "apps-outline";
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "transparent" },
  headerShadow: {
    backgroundColor: "transparent",
    shadowColor: "#bae3fc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 9,
    elevation: 5,
    zIndex: 8,
  },
  appbar: {
    backgroundColor: "#eaf6ff",
    elevation: 0,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    height: 65,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1d68af",
    letterSpacing: -0.08,
    marginBottom: 8,
    paddingLeft: 22,
    marginTop: 6,
  },
  searchbar: {
    borderRadius: 15,
    backgroundColor: "#f1f8ff",
    elevation: 0,
    borderWidth: 0.5,
    borderColor: "#bde1ff",
    marginBottom: 1,
  },
  listContent: {
    paddingBottom: 80,
    paddingHorizontal: 8,
    paddingTop: 7,
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
    paddingVertical: 25,
    paddingHorizontal: 15,
  },
  iconWrap: {
    width: 49,
    height: 49,
    backgroundColor: "#eaf6ff",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    shadowColor: "#d7f2ff",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
  },
  featureName: {
    fontSize: 16.9,
    fontWeight: "700",
    color: "#1b3e6e",
    marginBottom: 2,
    letterSpacing: -0.05,
  },
  featureDesc: {
    fontSize: 13.6,
    color: "#5d7d99",
    fontWeight: "500",
    marginTop: 1,
  },
});
