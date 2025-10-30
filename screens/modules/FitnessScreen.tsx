import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Platform,
  Animated,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Swipeable } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
const STORAGE_KEY = "fitnessLogs";


type LogItem = {
  id: string;
  timestamp: string; // ISO
  type: string;
  duration_min: number;
  intensity: "low" | "moderate" | "high";
  notes?: string;
  calories: number;
};

export default function FitnessScreen({ navigation }: any) {
  const [todaySummary, setTodaySummary] = useState<{minutes:number; calories:number; workouts:number}>({minutes:0, calories:0, workouts:0});
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachReply, setCoachReply] = useState("");

  const [type, setType] = useState("Walk");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState<"low"|"moderate"|"high">("moderate");
  const [notes, setNotes] = useState("");
  const [goalMinutes, setGoalMinutes] = useState("45");
  const [goalCalories, setGoalCalories] = useState("300");
  const [goalSteps, setGoalSteps] = useState("8000");
  const [progressPct, setProgressPct] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");

  const fade = useRef(new Animated.Value(0)).current;

  const BASE_URL =
    Platform.OS === "ios" ? "http://192.168.1.138:5008" : "http://10.0.2.2:5008";

  // ---- Initial fade-in + reset + load ----
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 650, useNativeDriver: true }).start();

    (async () => {
      // Load persisted logs if any
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setLogs(JSON.parse(saved));
      } else {
        setLogs([]);
      }

      const today = new Date().toISOString().slice(0, 10);
      const lastDate = await AsyncStorage.getItem("lastResetDate");
      if (lastDate !== today) {
        setTodaySummary({ minutes: 0, calories: 0, workouts: 0 });
        await AsyncStorage.setItem("lastResetDate", today);
      }
    })();
  }, []);

  // ---- Fetch progress + motivational message ----
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/fitness/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            minutes: todaySummary.minutes,
            calories: todaySummary.calories,
            steps: 0, // later, you can connect step count from a sensor or wearable
            goal_minutes: parseFloat(goalMinutes) || 45,
            goal_calories: parseFloat(goalCalories) || 300,
            goal_steps: parseFloat(goalSteps) || 8000,
          }),
        });
        const data = await res.json();
        setProgressPct(data.percent || 0);
        setProgressMsg(data.message || "");
      } catch (e) {
        console.warn("Progress fetch failed:", e);
      }
    };
    fetchProgress();
  }, [todaySummary, goalMinutes, goalCalories, goalSteps]);


  const refreshAll = async () => {
    try {
      const [sumRes, logsRes] = await Promise.all([
        fetch(`${BASE_URL}/api/fitness/summary/today`),
        fetch(`${BASE_URL}/api/fitness/logs`),
      ]);
      const sum = await sumRes.json();
      const ls = await logsRes.json();
      setTodaySummary(sum);
      setLogs(ls.logs || []);
    } catch {
      // no-op: keep UI responsive even if backend is not yet up
    }
  };
  const fetchProgress = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/fitness/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal_minutes: parseFloat(goalMinutes) || 45,
          goal_calories: parseFloat(goalCalories) || 300,
          goal_steps: parseFloat(goalSteps) || 8000,
        }),
      });
      const data = await res.json();
      setProgressPct(data.percent || 0);
      setProgressMsg(data.message || "");
    } catch (e) {
      console.warn("Progress fetch failed:", e);
    }
  };

  const ringProgress = useMemo(() => progressPct / 100, [progressPct]);

  // ------- Handlers -------
  const quickSet = (v: string) => setType(v);
  const setIntensityChip = (v: "low"|"moderate"|"high") => setIntensity(v);

  const logActivity = async () => {
    const dur = parseInt(duration, 10);
    if (!type.trim() || !dur || dur <= 0) {
      Alert.alert("Missing info", "Please select an activity and set duration (minutes).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/fitness/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          duration_min: dur,
          intensity,
          notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to log");

      // ✅ Add the new log to the top, but keep existing ones
      setLogs((prev) => [
        {
          id: data.log.id,
          timestamp: data.log.timestamp,
          type: data.log.type,
          duration_min: data.log.duration_min,
          intensity: data.log.intensity,
          notes: data.log.notes,
          calories: data.log.calories,
        },
        ...prev,
      ]);

      setDuration("");
      setNotes("");
      const newLogs = [
        {
          id: data.log.id,
          timestamp: data.log.timestamp,
          type: data.log.type,
          duration_min: data.log.duration_min,
          intensity: data.log.intensity,
          notes: data.log.notes,
          calories: data.log.calories,
        },
        ...logs,
      ];
      // Save to local storagŹ
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs));
      setLogs(newLogs);
    } catch (e: any) {
      Alert.alert("Log failed", String(e?.message || e));
    } finally {
      setLoading(false);

      try {
        // 🔹 Fetch updated daily totals from backend
        const res = await fetch(`${BASE_URL}/api/fitness/summary/today`);
        const summary = await res.json();
        setTodaySummary(summary); // updates minutes/calories/workouts
        await fetchProgress(); // <---- NEW: immediately refresh goal progress

        // 🔹 Immediately recalc progress with backend
        const progressRes = await fetch(`${BASE_URL}/api/fitness/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            minutes: summary.minutes,
            calories: summary.calories,
            steps: 0,
            goal_minutes: parseFloat(goalMinutes) || 45,
            goal_calories: parseFloat(goalCalories) || 300,
            goal_steps: parseFloat(goalSteps) || 8000,
          }),
        });
        const progressData = await progressRes.json();
        setProgressPct(progressData.percent || 0);
        setProgressMsg(progressData.message || "");
      } catch (e) {
        console.warn("❌ Progress update failed:", e);
      }
    }
  };

  const askCoach = async () => {
    setCoachLoading(true);
    setCoachReply("");
    try {
      const res = await fetch(`${BASE_URL}/api/fitness/coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question:
            "Please analyze my recent training, recovery, and energy. Suggest a balanced plan for today and tomorrow.",
          goal_minutes: parseFloat(goalMinutes) || 45,
          goal_calories: parseFloat(goalCalories) || 300,
          goal_steps: parseFloat(goalSteps) || 8000,
        }),
      });
      const data = await res.json();
      setCoachReply(data.reply || "No response from coach.");
    } catch {
      setCoachReply("⚠️ Unable to reach AI Coach.");
    } finally {
      setCoachLoading(false);
      await fetchProgress(); // ✅ update progress after coach advice
    }
  };

  // ------- UI -------
  return (
    <LinearGradient colors={["#eaf5ff", "#f7fffb"]} style={s.bg}>
      <SafeAreaView style={s.safe}>
        {/* Header */}
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBack}>
            <Ionicons name="chevron-back" size={26} color="#1d5fe4" />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Fitness & Wellness</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
          {/* Hero + Progress */}
        <Animated.View style={[s.hero, { opacity: fade, flexDirection: "column", alignItems: "center" }]}>
        <View style={[s.heroLeft, { alignItems: "center", paddingRight: 0 }]}>
            <Text style={s.h1}>Move with ArogyaAI</Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Text style={[s.h2, { marginRight: 6 }]}>Daily target:</Text>
              <TextInput
                value={goalMinutes}
                onChangeText={setGoalMinutes}
                keyboardType="numeric"
                style={s.goalInput}
              />
              <Text style={[s.h2, { marginLeft: 4 }]}>min</Text>
        </View>
        {/* 3 Goal Boxes under Daily Target */}
        <View style={[s.kpis, { justifyContent: "center", marginTop: 10 }]}>
          <GoalEditCard
            label="Minutes Goal"
            value={goalMinutes}
            unit="min"
            onChange={setGoalMinutes}
          />
          <GoalEditCard
            label="Calories Goal"
            value={goalCalories}
            unit="kcal"
            onChange={setGoalCalories}
          />
          <GoalEditCard
            label="Steps Goal"
            value={goalSteps}
            unit="steps"
            onChange={setGoalSteps}
          />
        </View>
        </View>
        </Animated.View>
          {/* Quick Actions */}
          <Text style={s.sectionTitle}>Quick Log</Text>
          <View style={s.chipsRow}>
            {["Walk", "Run", "Cycle", "Strength", "Yoga", "HIIT"].map((t) => (
              <Chip key={t} label={t} active={type === t} onPress={() => quickSet(t)} />
            ))}
          </View>

          {/* Activity Form Card */}
          <View style={s.card}>
            <View style={s.rowBetween}>
              <Text style={s.cardTitle}>Add Activity</Text>
              <Ionicons name="add-circle-outline" size={22} color="#119d7f" />
            </View>

            <View style={s.formRow}>
              <View style={s.formCol}>
                <Text style={s.label}>Activity</Text>
                <TextInput value={type} onChangeText={setType} style={s.input} placeholder="e.g., Run" />
              </View>
              <View style={s.formColSmall}>
                <Text style={s.label}>Minutes</Text>
                <TextInput
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="number-pad"
                  style={s.input}
                  placeholder="30"
                />
              </View>
            </View>

            <Text style={s.label}>Intensity</Text>
            <View style={s.intensityRow}>
              <Chip small label="Low" active={intensity === "low"} onPress={() => setIntensityChip("low")} />
              <Chip small label="Moderate" active={intensity === "moderate"} onPress={() => setIntensityChip("moderate")} />
              <Chip small label="High" active={intensity === "high"} onPress={() => setIntensityChip("high")} />
            </View>

            <Text style={s.label}>Notes (optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              style={[s.input, { minHeight: 60 }]}
              placeholder="How did it feel? RPE, route, focus…"
              multiline
            />

            <TouchableOpacity style={s.primaryBtn} onPress={logActivity} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryTxt}>Log Activity</Text>}
            </TouchableOpacity>
          </View>

          {/* History */}
          <Text style={s.sectionTitle}>Today’s Sessions</Text>
            <View style={{ gap: 10 }}>
            {logs.length === 0 ? (
                <EmptyCard />
            ) : (
                logs.map((l) => (
                <Swipeable
                    key={l.id}
                    renderRightActions={() => (
                    <View
                        style={{
                        backgroundColor: "#ff3b30",
                        justifyContent: "center",
                        alignItems: "flex-end",
                        paddingHorizontal: 20,
                        borderRadius: 16,
                        marginVertical: 2,
                        }}
                    >
                        <Ionicons name="trash-outline" size={22} color="#fff" />
                    </View>
                    )}
                    onSwipeableOpen={async () => {
                      const updated = logs.filter((x) => x.id !== l.id);
                      setLogs(updated);
                      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                    }}
                >
                    <LogRow item={l} />
                </Swipeable>
                ))
            )}
            </View>

          {/* AI Coach */}
          <View style={s.coachCard}>
            <View style={s.rowBetween}>
              <Text style={s.cardTitle}>AI Wellness Coach</Text>
              <Ionicons name="sparkles-outline" size={22} color="#1d5fe4" />
            </View>
            <Text style={s.helper}>
              Get personalized recovery, mobility, and training suggestions based on your recent logs.
            </Text>

            <TouchableOpacity style={[s.primaryBtn, { backgroundColor: "#1d5fe4" }]} onPress={askCoach} disabled={coachLoading}>
              {coachLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.primaryTxt}>Ask the Coach</Text>}
            </TouchableOpacity>

            {coachReply ? (
              <View style={s.replyBox}>
                <Text style={s.replyText}>{coachReply}</Text>
              </View>
            ) : null}
          </View>

          {/* Footer */}
          <Text style={s.footer}>© {new Date().getFullYear()} ArogyaAI · Strong body, kind mind</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

/* ---------- Components ---------- */

const KPI = ({ label, value }: { label: string; value: string }) => (
  <View style={kpi.card}>
    <Text style={kpi.value}>{value}</Text>
    <Text style={kpi.label}>{label}</Text>
  </View>
);

const ProgressRing = ({ progress }: { progress: number }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1000, // smooth animation duration (1 second)
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // Interpolate rotation of the blue ring (0 → 360 degrees)
  const rotateAnim = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Interpolate % text (0 → 100)
  const pctAnim = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <View style={ring.wrap}>
      <View style={[ring.circle, { borderColor: "#d9ebff" }]} />
      <Animated.View
        style={[
          ring.circleOverlay,
          { transform: [{ rotate: rotateAnim }] },
        ]}
      />
      <View style={ring.center}>
        <Animated.Text style={ring.centerBig}>
          {pctAnim.interpolate({
            inputRange: [0, 100],
            outputRange: ["0", "100"],
          })}
        </Animated.Text>
        <Text style={ring.centerSmall}>goal</Text>
      </View>
    </View>
  );
};

const Chip = ({ label, active, onPress, small }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      chip.base,
      small && chip.small,
      { backgroundColor: active ? "#e6fbf6" : "#f2f6fb", borderColor: active ? "#14b89b" : "#d9e3f3" },
    ]}
  >
    <Text style={[chip.text, { color: active ? "#0f9f84" : "#36506b" }]}>{label}</Text>
  </TouchableOpacity>
);

const LogRow = ({ item }: { item: LogItem }) => (
  <View style={row.card}>
    <View style={{ flex: 1 }}>
      <Text style={row.title}>{item.type} · {item.duration_min} min · {item.intensity}</Text>
      {item.notes ? <Text style={row.notes}>{item.notes}</Text> : null}
      <Text style={row.meta}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {Math.round(item.calories)} kcal
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9bb2c8" />
  </View>
);

const EmptyCard = () => (
  <View style={empty.card}>
    <Ionicons name="pulse-outline" size={24} color="#9cc4ff" />
    <Text style={empty.text}>No workouts logged yet. Add your first one above!</Text>
  </View>
);

const GoalEditCard = ({ label, value, unit, onChange }: any) => (
  <View style={goal.card}>
    <Text style={goal.label}>{label}</Text>
    <View style={goal.row}>
      <TextInput
        style={goal.input}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
      />
      <Text style={goal.unit}>{unit}</Text>
    </View>
  </View>
);

/* ---------- Styles ---------- */

const s = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", marginTop: 8, marginBottom: 10 },
  headerBack: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#163e78", marginLeft: 10 },
  hero: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#cfe6ff",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    marginBottom: 20,
  },
  heroLeft: { flex: 1, paddingRight: 12 },
  h1: { fontSize: 18, fontWeight: "800", color: "#1b3e6e" },
  h2: { fontSize: 13, color: "#4f6c85", marginTop: 4 },
  kpis: { flexDirection: "row", marginTop: 14, gap: 10 },
  sectionTitle: { fontSize: 16.5, fontWeight: "800", color: "#1b3e6e", marginVertical: 10, paddingLeft: 2 },
  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#d8ecff",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    marginBottom: 14,
  },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: "#11385f" },
  formRow: { flexDirection: "row", gap: 10, marginTop: 6, marginBottom: 10 },
  formCol: { flex: 1 },
  formColSmall: { width: 110 },
  label: { fontSize: 12.5, fontWeight: "700", color: "#436280", marginBottom: 6, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#d7e6f6",
    backgroundColor: "#fbfdff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#193e68",
  },
  intensityRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  primaryBtn: {
    backgroundColor: "#14b89b",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  primaryTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
  coachCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#dbe9ff",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    marginTop: 6,
  },
  helper: { fontSize: 13, color: "#58728c", marginBottom: 10, marginTop: 2 },
  replyBox: {
    backgroundColor: "#f2f8ff",
    borderLeftWidth: 4,
    borderLeftColor: "#1d5fe4",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  replyText: { color: "#22476e", fontSize: 14, lineHeight: 20 },
  footer: { textAlign: "center", color: "#7d93a9", fontSize: 12, marginTop: 22, marginBottom: 40 },
  goalInput: {
    borderBottomWidth: 1,
    borderColor: "#dbeafe",
    fontSize: 14,
    fontWeight: "700",
    color: "#193e68",
    width: 50,
    textAlign: "center",
    paddingBottom: 1,
  },
});

const chip = StyleSheet.create({
  base: {
    borderWidth: 1.3,
    borderRadius: 30,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  small: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 18 },
  text: { fontWeight: "800", fontSize: 12.5 },
});

const kpi = StyleSheet.create({
  card: {
    backgroundColor: "#f6fbff",
    borderWidth: 1,
    borderColor: "#e0efff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
    width: 100,
  },
  value: { fontSize: 18, fontWeight: "900", color: "#123b69" },
  label: { fontSize: 11.5, fontWeight: "700", color: "#58728c", marginTop: 3 },
});

const ring = StyleSheet.create({
  wrap: { width: 110, height: 110, justifyContent: "center", alignItems: "center" },
  circle: { position: "absolute", width: 110, height: 110, borderWidth: 10, borderRadius: 55 },
  circleOverlay: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 10,
    borderColor: "#1d5fe4",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },
  center: { alignItems: "center" },
  centerBig: { fontSize: 20, fontWeight: "900", color: "#123b69" },
  centerSmall: { fontSize: 11, color: "#4f6c85", marginTop: -2 },
});

const row = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#e1f0ff",
    shadowOpacity: 0.14,
    shadowRadius: 8,
  },
  title: { fontSize: 14.5, fontWeight: "800", color: "#173f6c" },
  notes: { fontSize: 12.5, color: "#5b7b96", marginTop: 2 },
  meta: { fontSize: 12, color: "#7894ad", marginTop: 6 },
});

const empty = StyleSheet.create({
  card: {
    backgroundColor: "#f7fbff",
    borderWidth: 1,
    borderColor: "#e0ecfb",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 8,
  },
  text: { color: "#527089", fontSize: 13.5, textAlign: "center" },
});

const goal = StyleSheet.create({
  card: {
    backgroundColor: "#f6fbff",
    borderWidth: 1,
    borderColor: "#e0efff",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    width: 100,
  },
  label: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#345779",
    marginBottom: 4,
    textAlign: "center",
  },
  row: { flexDirection: "row", alignItems: "flex-end" },
  input: {
    fontSize: 16,
    fontWeight: "800",
    borderBottomWidth: 1,
    borderColor: "#cbe4f9",
    textAlign: "center",
    width: 45,
    color: "#193e68",
    paddingBottom: 1,
  },
  unit: { fontSize: 12, fontWeight: "700", color: "#4a708d", marginLeft: 3 },
});
