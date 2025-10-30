import React, { useState, useEffect } from "react";
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
 

export default function SleepScreen({ navigation }: any) {
  const [bedTime, setBedTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [mood, setMood] = useState("");
  const [notes, setNotes] = useState("");
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [aiResponse, setAiResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const BASE_URL =
    Platform.OS === "ios" ? "http://192.168.1.138:5020" : "http://10.0.2.2:5020";

  useEffect(() => {
    fetchSleepLogs();
  }, []);

  const fetchSleepLogs = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/sleep/logs`);
      const data = await res.json();
      setSleepData(data.logs || []);
    } catch (e) {
      console.warn("Could not load sleep data", e);
    }
  };

  const calculateDuration = () => {
    if (!bedTime || !wakeTime) return null;
    const start = new Date(`2025-01-01T${bedTime}:00`);
    const end = new Date(`2025-01-02T${wakeTime}:00`);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return diff > 0 ? diff.toFixed(1) : null;
  };

  const saveLog = async () => {
    if (!bedTime || !wakeTime) {
      Alert.alert("Missing data", "Please enter both bed and wake times.");
      return;
    }
    setLoading(true);
    try {
      await fetch(`${BASE_URL}/api/sleep/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bedTime,
          wakeTime,
          mood,
          notes,
          duration: calculateDuration(),
        }),
      });
      await fetchSleepLogs();
      setBedTime("");
      setWakeTime("");
      setMood("");
      setNotes("");
    } catch {
      Alert.alert("Error", "Failed to save sleep entry.");
    } finally {
      setLoading(false);
    }
  };

  const askAI = async () => {
    setAiLoading(true);
    setAiResponse("");
    try {
      const res = await fetch(`${BASE_URL}/api/sleep/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setAiResponse(data.reply || "No AI suggestions received.");
    } catch {
      setAiResponse("⚠️ Unable to reach AI Coach.");
    } finally {
      setAiLoading(false);
    }
  };

  const duration = calculateDuration();

  return (
    <LinearGradient colors={["#0b1627", "#15263e", "#101e34"]} style={{ flex: 1 }}>
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={26} color="#d5e8ff" />
          </TouchableOpacity>
          <Text style={s.title}>Sleep Coach <Text style={{color:"#6fa8ff"}}>💤</Text></Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* --- Hero Sleep Dashboard --- */}
          <LinearGradient colors={["#1b3a5f", "#12243b"]} style={s.heroCard}>
            <View style={s.heroHeader}>
              <Ionicons name="moon" size={28} color="#cddfff" />
              <Text style={s.heroDate}>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</Text>
            </View>

            <View style={s.timeRow}>
              <View style={s.timeBox}>
                <Ionicons name="bed-outline" size={22} color="#99baff" />
                <TextInput
                  style={s.timeInput}
                  placeholder="22:30"
                  placeholderTextColor="#7fa0c4"
                  value={bedTime}
                  onChangeText={setBedTime}
                />
                <Text style={s.timeLabel}>Bedtime</Text>
              </View>

              <View style={s.timeBox}>
                <Ionicons name="sunny-outline" size={22} color="#ffd97d" />
                <TextInput
                  style={s.timeInput}
                  placeholder="06:45"
                  placeholderTextColor="#7fa0c4"
                  value={wakeTime}
                  onChangeText={setWakeTime}
                />
                <Text style={s.timeLabel}>Wake Time</Text>
              </View>
            </View>

            {duration && (
              <View style={s.durationBubble}>
                <Ionicons name="time-outline" size={16} color="#8dd2ff" />
                <Text style={s.durationTxt}>Sleep Duration: {duration} hrs</Text>
              </View>
            )}
          </LinearGradient>

          {/* --- Mood and Notes Section --- */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Morning Check-In 🌅</Text>
            <View style={s.moodRow}>
              {["😴", "🙂", "😐", "😫"].map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setMood(m)}
                  style={[s.moodBtn, mood === m && s.moodSelected]}
                >
                  <Text style={s.moodTxt}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[s.input, { minHeight: 70 }]}
              multiline
              placeholder="e.g. Slept well but woke up early, dreamt a lot..."
              placeholderTextColor="#8aa4c4"
              value={notes}
              onChangeText={setNotes}
            />
            <TouchableOpacity style={s.primaryBtn} onPress={saveLog} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryTxt}>Save Sleep Log</Text>}
            </TouchableOpacity>
          </View>

          {/* --- Sleep History --- */}
          <Text style={s.sectionTitle}>Recent Nights 🌘</Text>
          {sleepData.length === 0 ? (
            <View style={s.empty}>
              <Ionicons name="moon-outline" size={26} color="#8aa4c4" />
              <Text style={s.emptyTxt}>No sleep logs yet.</Text>
            </View>
          ) : (
            sleepData.map((l) => (
              <View key={l.id} style={s.logRow}>
                <Text style={s.logText}>
                  🕒 {l.bedTime} → {l.wakeTime} ({l.duration}h) {l.mood}
                </Text>
                {l.notes ? <Text style={s.logNote}>{l.notes}</Text> : null}
              </View>
            ))
          )}

          {/* --- AI Sleep Coach --- */}
          <View style={s.card}>
            <Text style={s.cardTitle}>AI Sleep Coach 🤖</Text>
            <Text style={s.subTxt}>
              Get personalized feedback to improve your sleep quality based on your recent logs.
            </Text>
            <TouchableOpacity style={s.aiBtn} onPress={askAI} disabled={aiLoading}>
              {aiLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryTxt}>Ask AI</Text>}
            </TouchableOpacity>

            {aiResponse ? (
              <View style={s.reply}>
                <Text style={s.replyTxt}>{aiResponse}</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: 16 },
  header: { flexDirection: "row", alignItems: "center", marginVertical: 12 },
  title: { fontSize: 24, fontWeight: "900", color: "#d5e8ff", marginLeft: 10 },
  heroCard: {
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  heroHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  heroDate: { color: "#d6e8ff", fontSize: 14, fontWeight: "600", marginLeft: 6 },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  timeBox: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 6,
    padding: 10,
    borderRadius: 14,
  },
  timeInput: { color: "#fff", fontSize: 18, fontWeight: "700", marginVertical: 4 },
  timeLabel: { color: "#9abfff", fontSize: 13, marginTop: 4 },
  durationBubble: {
    backgroundColor: "rgba(30, 90, 150, 0.4)",
    alignSelf: "center",
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  durationTxt: { color: "#d8f0ff", fontSize: 13, marginLeft: 6, fontWeight: "600" },
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  cardTitle: { fontSize: 17, fontWeight: "800", color: "#d5e8ff", marginBottom: 10 },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#fff",
    marginTop: 6,
    padding: 10,
  },
  moodRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
  moodBtn: {
    backgroundColor: "rgba(255,255,255,0.07)",
    padding: 10,
    borderRadius: 12,
    width: 60,
    alignItems: "center",
  },
  moodSelected: { backgroundColor: "#1b75d0" },
  moodTxt: { fontSize: 22 },
  primaryBtn: {
    backgroundColor: "#1b75d0",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 12,
  },
  primaryTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
  sectionTitle: { color: "#d5e8ff", fontSize: 17, fontWeight: "700", marginTop: 14, marginBottom: 6 },
  logRow: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  logText: { color: "#d5e8ff", fontWeight: "700", fontSize: 13.8 },
  logNote: { color: "#9eb9d4", fontSize: 12.5, marginTop: 2 },
  empty: { alignItems: "center", padding: 16, borderRadius: 14 },
  emptyTxt: { color: "#8aa4c4", marginTop: 6 },
  subTxt: { color: "#aec9ff", fontSize: 13, marginBottom: 10 },
  aiBtn: {
    backgroundColor: "#19a37e",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  reply: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderLeftWidth: 4,
    borderLeftColor: "#19a37e",
    borderRadius: 12,
    padding: 12,
  },
  replyTxt: { color: "#cdeae5", fontSize: 13.5, lineHeight: 20 },
});
