import React, { useEffect, useRef } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Linking,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
 

export default function TutorialGlobalScreen({ navigation }: any) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <LinearGradient colors={["#dff6ff", "#f7fdff", "#e0fff6"]} style={s.bg}>
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Ionicons name="chevron-back" size={26} color="#1d68af" />
          </TouchableOpacity>
          <Text style={s.header}>Global Health Tools 🌍</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 140 }}
        >
          {/* Hero */}
          <Animated.View style={[s.hero, { opacity: fadeAnim }]}>
            <Image
              source={{
                uri: "https://cdn-icons-png.flaticon.com/512/2966/2966489.png",
              }}
              style={s.heroImg}
            />
            <Text style={s.heroTitle}>See Health Through a Global Lens</Text>
            <Text style={s.heroDesc}>
              ArogyaAI connects world data to bring real-time insights about
              disease outbreaks, air quality, and healthcare access — empowering
              users and communities worldwide.
            </Text>
          </Animated.View>

          {/* Section 1: Global Health Trends */}
          <View style={s.section}>
            <Ionicons name="globe-outline" size={30} color="#1b92f7" />
            <Text style={s.sectionTitle}>1. Global Health Trends</Text>
            <Text style={s.sectionDesc}>
              Explore continuously updated dashboards of worldwide health
              statistics. ArogyaAI aggregates WHO, CDC, and Johns Hopkins data
              into easy visual charts showing:
              {"\n\n"}• Vaccination progress by region{"\n"}• Disease incidence
              comparisons{"\n"}• Nutrition and clean water access{"\n"}• AI-estimated
              well-being scores based on multi-country metrics
            </Text>
          </View>

          {/* Section 2: Outbreak Map */}
          <View style={s.section}>
            <Ionicons name="map-outline" size={30} color="#22b497" />
            <Text style={s.sectionTitle}>2. Live Outbreak Map</Text>
            <Text style={s.sectionDesc}>
              A dynamic map layer visualizes current disease outbreaks across
              the world. Each location includes verified sources and response
              levels.
              {"\n\n"}AI-generated overlays help identify emerging clusters or
              containment progress in near real-time.
              {"\n\n"}Zoom into your region to see local risk updates,
              vaccination drives, and hospital readiness.
            </Text>
          </View>

          {/* Section 3: Global Risk Alerts */}
          <View style={s.section}>
            <Ionicons name="alert-circle-outline" size={30} color="#f59e0b" />
            <Text style={s.sectionTitle}>3. Global Risk Alerts</Text>
            <Text style={s.sectionDesc}>
              Stay informed of travel or health alerts anywhere on the planet.
              {"\n\n"}Alerts include climate impacts, epidemic notices,
              pollution levels, and humanitarian advisories — powered by global
              AI scanning 1M+ data points daily.
              {"\n\n"}You can filter alerts by topic or region to personalize
              your global safety feed.
            </Text>
          </View>

          {/* Section 4: Health Equity AI */}
          <View style={s.section}>
            <Ionicons name="heart-outline" size={30} color="#ef4444" />
            <Text style={s.sectionTitle}>4. Health Equity AI</Text>
            <Text style={s.sectionDesc}>
              This initiative helps visualize disparities in access to care,
              vaccines, and nutrition. ArogyaAI’s models use satellite imagery,
              open datasets, and anonymized health surveys to identify areas
              needing urgent attention.
              {"\n\n"}Goal: help policymakers and communities make data-driven
              decisions for equitable health worldwide.
            </Text>
          </View>

          {/* Interactive Tools */}
          <View style={s.tryBox}>
            <Ionicons name="compass-outline" size={28} color="#22b497" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={s.tryTitle}>Try Global Health Tools</Text>
              <Text style={s.tryDesc}>
                Open the live toolset and explore global data interactively.
              </Text>
            </View>
            <TouchableOpacity
              style={s.tryBtn}
              onPress={() => navigation.navigate("GlobalHealthScreen")}
            >
              <Ionicons name="open-outline" size={18} color="#fff" />
              <Text style={s.tryBtnTxt}>Open</Text>
            </TouchableOpacity>
          </View>

          {/* Learn More */}
          <TouchableOpacity
            onPress={() =>
              Linking.openURL("https://arogyaai.org/global-health-tools")
            }
            style={s.learnMoreBtn}
          >
            <Ionicons name="book-outline" size={18} color="#1b92f7" />
            <Text style={s.learnMoreTxt}>Learn More on arogyaai.org</Text>
          </TouchableOpacity>

          {/* Footer */}
          <Text style={s.footer}>
            © {new Date().getFullYear()} ArogyaAI Science Society · Empowering
            Global Well-Being 🌎
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* --- Styles --- */
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
    backgroundColor: "#1b92f7",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    marginBottom: 22,
    shadowColor: "#1b92f7",
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  heroImg: { width: 70, height: 70, tintColor: "#fff" },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginTop: 10,
    textAlign: "center",
  },
  heroDesc: {
    fontSize: 13.5,
    color: "#e3f2ff",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#cbeafe",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#1b3e6e",
    marginTop: 6,
    marginBottom: 8,
  },
  sectionDesc: { fontSize: 13.5, color: "#527389", lineHeight: 21 },
  tryBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eafef8",
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
  },
  tryTitle: { fontSize: 15, fontWeight: "800", color: "#1b3e6e" },
  tryDesc: { fontSize: 13, color: "#527389", marginTop: 2 },
  tryBtn: {
    backgroundColor: "#22b497",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  tryBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 14, marginLeft: 4 },
  learnMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  learnMoreTxt: {
    color: "#1b92f7",
    fontWeight: "700",
    marginLeft: 6,
    fontSize: 14.5,
  },
  footer: {
    textAlign: "center",
    fontSize: 12.5,
    color: "#7189a0",
    marginTop: 26,
    marginBottom: 20,
  },
});
