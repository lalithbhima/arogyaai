import React, { useState } from "react";
import { View, FlatList, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { Text, Title } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import I18n, { setI18nConfig } from "../../utils/i18n";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español (Spanish)" },
  { code: "te", label: "తెలుగు (Telugu)" }
];

export default function LanguagePickerScreen({ navigation }: any) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = async (langCode: string) => {
    setSelected(langCode);
    await AsyncStorage.setItem("userLang", langCode);
    setI18nConfig(langCode); // Switch app language immediately
    setTimeout(() => {
      navigation.replace("Welcome"); // or whatever your next onboarding screen is called
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Title style={styles.title}>Choose Your Language</Title>
      <FlatList
        data={LANGUAGES}
        keyExtractor={item => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.langButton, selected === item.code && styles.selected]}
            onPress={() => handleSelect(item.code)}
            disabled={selected === item.code}
          >
            <Text style={styles.langLabel}>{item.label}</Text>
          </TouchableOpacity>
        )}
      />
      <Text style={styles.footer}>You can change language anytime in Settings.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: "#f9fbfe", alignItems: "center" },
  title: { marginBottom: 24, fontSize: 22, fontWeight: "bold", color: "#1353c4" },
  langButton: { padding: 16, marginVertical: 10, backgroundColor: "#fff", borderRadius: 12, width: 320, alignSelf: "center", elevation: 2 },
  selected: { backgroundColor: "#d0ebff" },
  langLabel: { fontSize: 20, color: "#2b395b", textAlign: "center" },
  footer: { fontSize: 13, color: "#647285", marginTop: 24, textAlign: "center" }
});
