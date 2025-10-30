// screens/core/HealthNewsScreen.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";


export default function HealthNewsScreen({ navigation }: any) {
  const BASE_URL =
    Platform.OS === "ios" ? "http://192.168.1.138:5030" : "http://10.0.2.2:5030";

  const [topic, setTopic] = useState("");
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [followUp, setFollowUp] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  const presets = [
    "Nutrition & Longevity",
    "Sleep & Brain Health",
    "AI in Medicine",
    "Cancer Immunotherapy",
    "Mental Wellness",
    "Public Health Trends",
  ];

  const generateArticle = async (selected?: string) => {
    const chosen = selected || topic.trim();
    if (!chosen) {
      Alert.alert("Please enter a topic");
      return;
    }
    setLoading(true);
    setArticle(null);
    setAnswer("");

    try {
      const res = await fetch(`${BASE_URL}/api/news/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: chosen }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch article");
      setArticle(data.article);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const askFollowUp = async () => {
    if (!article) return;
    if (!followUp.trim()) {
      Alert.alert("Please type a question");
      return;
    }
    setAsking(true);
    setAnswer("");
    try {
      const res = await fetch(`${BASE_URL}/api/news/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: followUp, article }),
      });
      const data = await res.json();
      setAnswer(data.reply || "No AI response.");
    } catch (e) {
      setAnswer("⚠️ Unable to reach AI.");
    } finally {
      setAsking(false);
    }
  };

  return (
    <SafeAreaView style={s.safeArea}>
      {/* Header */}
      <View style={[s.headerShadow, s.appbar]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 16 }}>
            <Ionicons name="chevron-back" size={26} color="#1d68af" />
          </TouchableOpacity>
          <Text style={s.title}>Health News 🧬</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.listContent}>
        {/* Topic Entry */}
        <TextInput
          style={s.searchbar}
          placeholder="Search or type a health topic..."
          placeholderTextColor="#6396c8"
          value={topic}
          onChangeText={setTopic}
          onSubmitEditing={() => generateArticle()}   // triggers when pressing Enter/Return
          returnKeyType="search"                      // changes keyboard key label to “Search”
          blurOnSubmit={true}                         // hides keyboard after pressing Enter
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Quick Presets */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 8 }}>
          {presets.map((p) => (
            <TouchableOpacity key={p} onPress={() => generateArticle(p)} style={s.iconWrap}>
              <Text style={{ color: "#1d68af", fontWeight: "700", fontSize: 12, textAlign: "center" }}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading */}
        {loading && (
          <View style={{ marginTop: 40, alignItems: "center" }}>
            <ActivityIndicator color="#1b75d0" size="large" />
            <Text style={{ color: "#5d7d99", marginTop: 10 }}>Generating your article...</Text>
          </View>
        )}

        {/* Article Output */}
        {!loading && article && (
          <View>
            <Text style={s.featureName}>{article.title}</Text>
            <Text style={s.featureDesc}>{article.teaser}</Text>
            <Text style={[s.featureDesc, { marginBottom: 12 }]}>
              ⏱ {article.readingMinutes} min read
            </Text>

            {article.takeaways && (
              <View style={{ marginBottom: 16 }}>
                <Text style={[s.featureName, { fontSize: 15, color: "#1b3e6e", marginBottom: 4 }]}>
                  Key Takeaways
                </Text>
                {article.takeaways.map((t: string, i: number) => (
                  <Text key={i} style={s.featureDesc}>
                    • {t}
                  </Text>
                ))}
              </View>
            )}

            {article.sections?.map((sec: any, i: number) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <Text style={[s.featureName, { fontSize: 16, color: "#1b3e6e", marginBottom: 3 }]}>
                  {sec.heading}
                </Text>
                <Text style={s.featureDesc}>{sec.body}</Text>
              </View>
            ))}

            <Text style={[s.featureDesc, { marginTop: 8, fontSize: 12 }]}>
              {article.disclaimer}
            </Text>
          </View>
        )}

        {/* Follow-Up */}
        {article && (
          <View style={{ marginTop: 24 }}>
            <Text style={[s.featureName, { fontSize: 15 }]}>Ask a follow-up</Text>
            <TextInput
              style={[s.searchbar, { marginTop: 6 }]}
              placeholder="e.g. How does this affect children?"
              placeholderTextColor="#6396c8"
              value={followUp}
              onChangeText={setFollowUp}
            />
            <TouchableOpacity style={s.cardInner} onPress={askFollowUp} disabled={asking}>
              {asking ? (
                <ActivityIndicator color="#1d68af" />
              ) : (
                <Text style={[s.featureName, { color: "#1d68af" }]}>Ask</Text>
              )}
            </TouchableOpacity>
            {answer ? <Text style={[s.featureDesc, { marginTop: 8 }]}>{answer}</Text> : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#eaf6ff" },
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
    justifyContent: "center",
  },
  title: {
    fontSize: 19,
    fontWeight: "800",
    color: "#1d68af",
    marginLeft: 10,
  },
  searchbar: {
    borderRadius: 15,
    backgroundColor: "#f1f8ff",
    borderWidth: 0.7,
    borderColor: "#bde1ff",
    padding: 10,
    marginVertical: 8,
    fontSize: 14,
    color: "#1b3e6e",
  },
  listContent: {
    paddingBottom: 90,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  iconWrap: {
    backgroundColor: "#eaf6ff",
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#c8e8ff",
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
    lineHeight: 20,
  },
  cardInner: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: "#d7efff",
    marginTop: 10,
  },
});
