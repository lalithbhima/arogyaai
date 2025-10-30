import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { launchCamera } from "react-native-image-picker";


export default function NutritionScreen({ navigation }: any) {
  const [input, setInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [calories, setCalories] = useState("1850");
  const [protein, setProtein] = useState("80");
  const [water, setWater] = useState("2.5");

  // Your local backend URL (same style as your Labs/Support screens)
  const BASE_URL =
    Platform.OS === "ios"
      ? "http://192.168.1.138:5007"
      : "http://10.0.2.2:5007";

// ---- Ask AI Nutrition Coach ----
const askNutritionAI = async () => {
  if (!input.trim()) {
    Alert.alert("Input Required", "Please describe your goal or meal preference first.");
    return;
  }
  setLoading(true);
  setAiResponse("");
  try {
    const res = await fetch(`${BASE_URL}/api/nutrition_ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();
    setAiResponse(data.reply || "No response received.");
  } catch (e) {
    setAiResponse("⚠️ Unable to reach ArogyaAI Nutrition backend.");
  } finally {
    setLoading(false);
  }
};

// ---- AI Meal Planner ----
const generateMealPlan = async () => {
  const userGoal = input.trim() || "Generate a daily meal plan";
  setLoading(true);
  setAiResponse("");

  try {
    const res = await fetch(`${BASE_URL}/api/meal_planner_ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `${userGoal}. My goals are ${calories} kcal, ${protein} g protein, and ${water} L of water per day.`,
      }),
    });

    const data = await res.json();
    setAiResponse(data.reply || "No response received from Meal Planner AI.");
  } catch (e) {
    setAiResponse("⚠️ Unable to reach ArogyaAI Meal Planner backend.");
  } finally {
    setLoading(false);
  }
};

// ---- Smart Food Scanner ----
const scanFoodImage = async () => {
  try {
    const result = await launchCamera({ mediaType: "photo", quality: 0.8 });
    if (result.didCancel) return;

    const photo = result.assets?.[0];
    if (!photo?.uri) {
      Alert.alert("Scan Failed", "Could not capture an image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", {
      uri: photo.uri,
      name: "food.jpg",
      type: photo.type || "image/jpeg",
    });

    setLoading(true);
    setAiResponse("");
    const res = await fetch(`${BASE_URL}/api/food_scanner_image`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setAiResponse(data.reply || "No analysis returned by Smart Food Scanner AI.");
  } catch (err) {
    setAiResponse("⚠️ Unable to open camera or connect to backend.");
  } finally {
    setLoading(false);
  }
};

  return (
    <LinearGradient colors={["#def7ff", "#f7fdff", "#e0fff6"]} style={s.bg}>
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Ionicons name="chevron-back" size={26} color="#2278f9" />
          </TouchableOpacity>
          <Text style={s.header}>Nutrition & Diet Coach</Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* Hero Section */}
          <LinearGradient colors={["#dff9f5", "#f4fdff"]} style={s.hero}>
            <Ionicons
              name="nutrition-outline"
              size={48}
              color="#22b497"
              style={{ marginRight: 10 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={s.heroTitle}>Smart Nutrition with AI 🥗</Text>
              <Text style={s.heroDesc}>
                Get personalized meal guidance, hydration tracking, and healthy
                habit support—all powered by ArogyaAI’s Llama model.
              </Text>
            </View>
          </LinearGradient>

          {/* Quick Metrics */}
          <Text style={s.sectionTitle}>Your Daily Goals</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.hScroll}
          >
            <GoalCard title="Calories" value={calories} icon="flame-outline" color="#22b497" onChange={setCalories} />
            <GoalCard title="Protein" value={protein} icon="fish-outline" color="#42a9f9" onChange={setProtein} />
            <GoalCard title="Water" value={water} icon="water-outline" color="#2563eb" onChange={setWater} />
            <GoalCard title="Steps" value="8,300" icon="walk-outline" color="#1b92f7" />
          </ScrollView>

          {/* --- AI Interaction Box --- */}
          <View style={s.aiBox}>
            <Text style={s.label}>Ask the AI Nutrition Coach</Text>
            <TextInput
              placeholder="e.g. Create a 1,800 kcal vegetarian plan for me"
              placeholderTextColor="#8fa7b3"
              style={s.input}
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity style={s.askBtn} onPress={askNutritionAI} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles-outline" size={20} color="#fff" />
                  <Text style={s.askTxt}>Ask AI Coach</Text>
                </>
              )}
            </TouchableOpacity>

            {aiResponse ? (
              <View style={s.replyBox}>
                <Text style={s.replyTitle}>AI Nutrition Insight</Text>
                <Text style={s.reply}>{aiResponse}</Text>
              </View>
            ) : null}
          </View>

          {/* Bottom Tools */}
          <Text style={s.sectionTitle}>More Smart Tools</Text>
          <FeatureRow
            icon="fast-food-outline"
            color="#22b497"
            title="Meal Planner"
            desc="Generate balanced meals aligned with your calorie target and goals."
            btn="Plan Meals"
            onPress={generateMealPlan}
          />
          <FeatureRow
            icon="camera-outline"
            color="#42a9f9"
            title="Smart Food Scanner"
            desc="Use your camera to instantly detect meal calories and nutrition facts."
            btn="Scan"
            onPress={scanFoodImage}
          />

          {/* Tip */}
          <View style={s.tipBox}>
            <Ionicons name="leaf-outline" size={28} color="#22b497" />
            <View style={{ flex: 1 }}>
              <Text style={s.tipTitle}>ArogyaAI Tip 🌱</Text>
              <Text style={s.tipText}>
                A mix of fiber-rich foods, colorful vegetables, and omega-3 fats can
                stabilize energy and mood throughout the day.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* COMPONENTS */
const GoalCard = ({ title, value, icon, color, onChange }: any) => {
  // derive the unit for each card
  const unit =
    title === "Calories" ? "kcal" :
    title === "Protein" ? "g" :
    title === "Water" ? "L" : "";

  return (
    <View style={[s.goalCard, { borderColor: color }]}>
      <Ionicons name={icon} size={26} color={color} style={{ marginBottom: 6 }} />
      <Text style={s.goalTitle}>{title}</Text>
      <View style={s.goalValueRow}>
        <TextInput
          style={[s.goalValueInput, { color }]}
          value={value}
          onChangeText={onChange}
          keyboardType="numeric"
        />
        {unit ? <Text style={[s.unitText, { color }]}>{unit}</Text> : null}
      </View>
    </View>
  );
};

const FeatureRow = ({ icon, color, title, desc, btn, onPress }: any) => (
  <View style={s.cardRow}>
    <View style={[s.iconWrap, { backgroundColor: "#eaf6ff" }]}>
      <Ionicons name={icon} size={34} color={color} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.cardTitle}>{title}</Text>
      <Text style={s.cardDesc}>{desc}</Text>
      <TouchableOpacity style={[s.btn, { backgroundColor: color }]} onPress={onPress}>
        <Text style={s.btnTxt}>{btn}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

/* STYLES */
const s = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 10 },
  back: { padding: 4 },
  header: { fontSize: 22, fontWeight: "800", color: "#1d68af", marginLeft: 10 },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    padding: 2,
    borderRadius: 22,
    marginBottom: 18,
    shadowColor: "#cbeafe",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  heroTitle: { fontSize: 18, fontWeight: "800", color: "#1b3e6e" },
  heroDesc: { fontSize: 13.5, color: "#527389", marginTop: 3, lineHeight: 19 },
  sectionTitle: { fontSize: 17, fontWeight: "700", color: "#2278f9", marginBottom: 8, marginTop: 4, paddingLeft: 4 },
  hScroll: { paddingVertical: 8, paddingRight: 12 },
  goalCard: {
    borderWidth: 1.6,
    borderRadius: 18,
    padding: 14,
    width: 130,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#fff",
  },
  goalTitle: { fontSize: 14, fontWeight: "600", color: "#1b3e6e" },
  goalValue: { fontSize: 16, fontWeight: "800" },
  aiBox: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#b5dbff",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  label: { fontSize: 14, fontWeight: "700", color: "#1b3e6e", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#cbe4f9",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1b3e6e",
    minHeight: 80,
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
    borderLeftColor: "#22b497",
  },
  replyTitle: { fontSize: 16, fontWeight: "700", color: "#1d68af", marginBottom: 4 },
  reply: { fontSize: 14, color: "#325c7e", lineHeight: 21 },
  cardRow: {
    backgroundColor: "#fff",
    borderRadius: 20,
    flexDirection: "row",
    padding: 18,
    marginBottom: 18,
    shadowColor: "#cbeafe",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#1b3e6e" },
  cardDesc: { fontSize: 13.8, color: "#527389", marginTop: 3, marginBottom: 8, lineHeight: 19 },
  btn: { borderRadius: 12, paddingVertical: 7, paddingHorizontal: 14, alignSelf: "flex-start" },
  btnTxt: { color: "#fff", fontWeight: "700", fontSize: 14 },
  tipBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eafef8",
    padding: 14,
    borderRadius: 18,
    marginBottom: 20,
  },
  tipTitle: { fontSize: 14.5, fontWeight: "700", color: "#1b3e6e" },
  tipText: { fontSize: 13, color: "#40707a", marginTop: 2, lineHeight: 18 },
  goalValueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: 4,
  },
  goalValueInput: {
    fontSize: 16,
    fontWeight: "800",
    borderBottomWidth: 1,
    borderColor: "#dbeafe",
    textAlign: "center",
    width: 60,
    paddingBottom: 2,
  },
  unitText: {
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 4,
  },
});
