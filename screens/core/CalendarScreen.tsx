// screens/core/CalendarScreen.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PushNotification from "react-native-push-notification";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";

// ✅ ADD HERE (right below imports, before formatHour)
const HOUR_HEIGHT = 80;
const LINE_OFFSET = 12; // tweak 12–18 if you want; 14 looks right on iOS

const formatHour = (hour: number) => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${suffix}`;
};

export default function CalendarScreen({ navigation }: any) {
  const [reminders, setReminders] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  // 🔹 Always default to today's date when screen loads
  useEffect(() => {
    const localDate = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
    setSelectedDay(localDate);
  }, []);

  const slots = Array.from({ length: 24 }, (_, i) => i); // 0–23 hours
  const [now, setNow] = useState(new Date());
  // 🔹 Track scroll position for blue line visibility
  const [scrollY, setScrollY] = useState(0);

  // 🔹 Reference to FlatList to auto-scroll to current time
  const listRef = useRef<FlatList>(null);

  // 🔹 Log updates every minute
  useEffect(() => {
    console.log("⏰ Timer setup: starting interval updates every 60s");
    const timer = setInterval(() => {
      const newNow = new Date();
      console.log(
        `🕒 Updating time → ${newNow.getHours()}:${newNow.getMinutes().toString().padStart(2, "0")}`
      );
      setNow(newNow);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 🔹 Auto-scroll to show current time line
  useEffect(() => {
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
    console.log("📅 Selected day:", selectedDay);
    console.log("📆 Today:", today);

    if (selectedDay === today) {
      const offset =
        now.getHours() * 80 + (now.getMinutes() / 60) * 80 - 200;
      console.log(
        `➡️ Calculated offset: ${offset}px (hour=${now.getHours()}, min=${now.getMinutes()})`
      );

      // Attempt scroll
      listRef.current?.scrollToOffset({
        offset: Math.max(offset, 0),
        animated: false,
      });
    } else {
      console.log("❌ Not today → hiding blue line & skipping scroll");
    }
  }, [selectedDay, now]);

  // 🔹 push-notification + reminder storage
  useEffect(() => {
    PushNotification.createChannel(
      {
        channelId: "arogya-reminders",
        channelName: "ArogyaAI Health Reminders",
        importance: 4,
      },
      (created) => console.log(`🔔 createChannel returned '${created}'`)
    );

    // 🟢 Ask for notification permission
    PushNotification.requestPermissions();

    // 🟢 Load saved reminders from storage
    (async () => {
      const saved = await AsyncStorage.getItem("reminders");
      if (saved) {
        console.log("📦 Loaded reminders:", JSON.parse(saved).length);
        setReminders(JSON.parse(saved));
      } else {
        console.log("ℹ️ No reminders found in AsyncStorage");
      }
    })();
  }, []);

  const saveReminders = async (newReminders: any[]) => {
    setReminders(newReminders);
    await AsyncStorage.setItem("reminders", JSON.stringify(newReminders));
  };

  const scheduleNotification = (reminder: any) => {
    // Use the user-selected time directly (do not reapply offset)
    const localTime = new Date(reminder.date);

    console.log("🔔 [SCHEDULER DEBUG]");
    console.log("   ➤ Reminder ID:", reminder.id);
    console.log("   ➤ Title:", reminder.title);
    console.log("   ➤ Raw ISO time:", reminder.date);
    console.log("   ➤ Local interpreted time:", localTime.toString());
    console.log("   ➤ Device local time now:", new Date().toString());
    console.log("   ➤ Milliseconds until trigger:", localTime.getTime() - Date.now());
    console.log("   ➤ Repeats daily?:", reminder.repeat);

    // 🔹 Show all active channels
    PushNotification.getChannels((channels) => {
      console.log("📡 Existing channels:", channels);
    });

    // 🔹 Send immediate debug notification so we know it's working
    PushNotification.localNotification({
      channelId: "arogya-reminders",
      title: "🔧 Debug",
      message: `Scheduling '${reminder.title}' for ${localTime.toLocaleTimeString()}`,
    });

    // 🔹 Schedule actual notification (use selected date directly)
    PushNotification.localNotificationSchedule({
      id: reminder.id,
      channelId: "arogya-reminders",
      title: "Health Reminder",
      message: reminder.title,
      date: localTime, // ✅ no offset correction
      allowWhileIdle: true,
      repeatType: reminder.repeat ? "day" : undefined,
    });

    // 🔹 Log currently scheduled notifications
    setTimeout(() => {
      PushNotification.getScheduledLocalNotifications((list) => {
        console.log("📋 [DEBUG] All scheduled notifications:");
        list.forEach((n: any, i: number) => {
          console.log(`   #${i + 1}:`, JSON.stringify(n, null, 2));
        });
      });
    }, 1500);

    console.log("✅ [DEBUG] Finished scheduling notification.\n");
  };

  const addReminder = async () => {
    if (!title.trim()) {
      Alert.alert("Missing Title", "Please enter a reminder title first.");
      return;
    }

    const now = new Date();
    let reminderTime = new Date(date);

    // 🧭 Fix: If the selected time is earlier than now (today), assume it's for the next day
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
      console.log("🕓 Adjusted to next day:", reminderTime.toString());
    }

    const newReminder = {
      id: Date.now().toString(),
      title,
      date: reminderTime.toISOString(),
      repeat: true,
    };

    console.log("➕ Adding reminder:", newReminder);
    const updated = [...reminders, newReminder];
    await saveReminders(updated);
    scheduleNotification(newReminder);

    setShowModal(false);
    setTitle("");
    setDate(new Date());

    console.log("🚀 [DEBUG] Reminder successfully added & scheduled.");
  };

  const deleteReminder = async (id: string) => {
    console.log("🗑 Deleting reminder ID:", id);
    const updated = reminders.filter((r) => r.id !== id);
    saveReminders(updated);
    PushNotification.cancelLocalNotification(id);
  };

  // 🔹 Compute precise proportional blue line position between hour blocks
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const fractionalHour = hour + (minute + second / 60) / 60;
  const lineTop = fractionalHour * HOUR_HEIGHT + LINE_OFFSET;
  return (
    <LinearGradient colors={["#e7f6ff", "#f7fdff", "#e0fff6"]} style={{ flex: 1 }}>
      <SafeAreaView style={s.container}>
        {/* 🔙 Back Button + Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <TouchableOpacity
            style={s.backBtn}
            onPress={() => {
              try {
                // ✅ Normal case: return to Home tab in MainTabs
                navigation.navigate("Main", { screen: "Home" });
              } catch (e) {
                console.warn("Fallback navigation triggered:", e);
                // ✅ Fallback if Main isn’t mounted
                navigation.reset({
                  index: 0,
                  routes: [
                    {
                      name: "Main",
                      state: { routes: [{ name: "Home" }] },
                    },
                  ],
                });
              }
            }}
          >
            <Ionicons name="arrow-back" size={22} color="#2563eb" />
          </TouchableOpacity>

          <Text style={s.header}>Health Reminders</Text>
        </View>
        <Calendar
          style={s.calendar}
          theme={{
            selectedDayBackgroundColor: "#2563eb",
            todayTextColor: "#2563eb",
            arrowColor: "#2563eb",
          }}
          onDayPress={(day) => setSelectedDay(day.dateString)}
          markedDates={{
            ...reminders.reduce((acc, r) => {
              // ✅ Convert reminder date into *local day* to avoid timezone shift
              const localDate = new Date(new Date(r.date).getTime() - new Date().getTimezoneOffset() * 60000);
              const d = localDate.toISOString().split("T")[0];
              acc[d] = { marked: true, dotColor: "#42a9f9" };
              return acc;
            }, {} as any),
            [selectedDay]: { selected: true, selectedColor: "#2563eb" },
          }}
        />

        <View style={{ flex: 1 }}>
          {/* Wrap the timeline in a relative container */}
          <View style={{ flex: 1, position: "relative" }}>
            <FlatList
              ref={listRef}
              data={slots}
              keyExtractor={(i) => i.toString()}
              onScroll={({ nativeEvent }) => {
                setScrollY(nativeEvent.contentOffset.y);
              }}
              scrollEventThrottle={16} // ensures smooth tracking during scroll
              renderItem={({ item: hour }) => {
                const slotReminders = reminders.filter(
                  (r) =>
                    new Date(r.date).getHours() === hour &&
                    new Date(new Date(r.date).getTime() - new Date().getTimezoneOffset() * 60000)
                      .toISOString()
                      .startsWith(selectedDay)
                );

                return (
                  <View style={s.hourBlock}>
                    <TouchableOpacity
                      style={s.hourRow}
                      onPress={() => {
                        const slot = new Date(
                          `${selectedDay}T${String(hour).padStart(2, "0")}:00:00`
                        );
                        setDate(slot);
                        setShowModal(true);
                      }}
                    >
                      <Text style={s.hourText}>{formatHour(hour)}</Text>
                      {slotReminders.map((r) => (
                        <View key={r.id} style={s.hourReminder}>
                          <Text style={s.reminderTxt}>{r.title}</Text>
                          <TouchableOpacity onPress={() => deleteReminder(r.id)}>
                            <Ionicons
                              name="trash-outline"
                              size={18}
                              color="#e63946"
                              style={{ marginLeft: 8 }}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </TouchableOpacity>

                    {/* quarter-hour dividers */}
                    <View style={[s.quarterDivider, { top: 20 }]} />
                    <View style={[s.quarterDivider, { top: 40 }]} />
                    <View style={[s.quarterDivider, { top: 60 }]} />
                  </View>
                );
              }}
              contentContainerStyle={{ paddingBottom: 120 }}
            />
            {/* 🔵 Current-time line styled like Apple Calendar */}
            {selectedDay === new Date(now.getTime() - now.getTimezoneOffset() * 60000)
              .toISOString()
              .split("T")[0] && (
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  top: Math.max(
                    Math.min(lineTop - scrollY + 32, HOUR_HEIGHT * 24 - 2),
                    0
                  ),
                  left: 55, // small offset so dot overlaps hour text
                  right: 0,
                  height: 2,
                  backgroundColor: "#0040ff",
                  zIndex: 1000,
                  elevation: 12,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {/* Blue dot (Apple Calendar style) */}
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#0040ff",
                    marginLeft: -5, // dot sticks slightly outside hour label
                  }}
                />

                {/* Horizontal blue line */}
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: "#0040ff",
                  }}
                />

                {/* Time label inside blue bubble */}
                <View
                  style={{
                    position: "absolute",
                    left: -70, // slight shift so it doesn’t overlap
                    top: -18,
                    backgroundColor: "#0040ff",
                    borderRadius: 10,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {now.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ➕ Floating Add Button */}
        <TouchableOpacity style={s.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* 🗓️ Add Reminder Modal */}
        <Modal visible={showModal} transparent animationType="slide">
          <View style={s.modalWrap}>
            <View style={s.modalCard}>
              <Text style={s.modalTitle}>Add Reminder</Text>
              <TextInput
                style={s.input}
                placeholder="Reminder title"
                value={title}
                onChangeText={setTitle}
              />

              <TouchableOpacity onPress={() => setShowPicker(true)}>
                <Text style={s.dateBtn}>Pick Date & Time</Text>
              </TouchableOpacity>

              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode="datetime"
                  display="default"
                  onChange={(e, d) => {
                    setShowPicker(false);
                    if (d) setDate(d);
                  }}
                />
              )}

              <TouchableOpacity style={s.saveBtn} onPress={addReminder}>
                <Text style={s.saveBtnTxt}>Save Reminder</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={s.cancelBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}


const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent", padding: 16 },
  header: { fontSize: 24, fontWeight: "800", color: "#0d47a1", marginBottom: 12 },
  calendar: {
    borderRadius: 16,
    paddingBottom: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#cbeafe",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f4f8ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  hourBlock: {
    height: 80,
    borderBottomWidth: 1,
    borderBottomColor: "#edf3ff",
    position: "relative",
  },
  hourRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 80,
    paddingHorizontal: 8,
  },
  hourText: { width: 60, fontSize: 13, color: "#2563eb", fontWeight: "600" },

  quarterDivider: {
    position: "absolute",
    left: 60,
    right: 0,
    height: 1,
    backgroundColor: "#f0f4ff",
  },
  nowLine: {
    position: "absolute",
    left: 60,
    right: 0,
    height: 2,
    backgroundColor: "#0040ff",
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
  },
  nowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0040ff",
    marginLeft: -5,
  },
  nowBar: {
    flex: 1,
    height: 2,
    backgroundColor: "#0040ff",
  },

  addBtn: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#2563eb",
    borderRadius: 30,
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },

  modalWrap: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#cbeafe",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: "#15558c" },
  input: {
    borderWidth: 1,
    borderColor: "#cfe1ff",
    borderRadius: 14,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  dateBtn: { color: "#2563eb", fontWeight: "700", marginBottom: 12 },
  saveBtn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  cancelBtn: { textAlign: "center", marginTop: 12, color: "#888" },
  reminderTxt: { fontSize: 13, fontWeight: "600", color: "#15558c" },
  hourReminder: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e6f2ff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 10,
  },
});
