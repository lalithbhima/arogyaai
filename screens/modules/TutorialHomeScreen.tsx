import React from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
 

export default function TutorialHomeScreen({ navigation }: any) {
  return (
    <LinearGradient colors={["#e3f2ff", "#ffffff", "#e8fff8"]} style={s.bg}>
      <SafeAreaView style={s.safe}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Ionicons name="chevron-back" size={26} color="#1d68af" />
          </TouchableOpacity>
          <Text style={s.header}>Using the Home Dashboard</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <View style={s.hero}>
            <Ionicons name="home-outline" size={60} color="#1b92f7" />
            <Text style={s.heroTitle}>Your Daily Health Hub</Text>
            <Text style={s.heroText}>
              The ArogyaAI Home Dashboard is your personalized wellness command center — combining insights, reminders, and progress in one glance.
            </Text>
          </View>

          <Section title="What It Does">
            <Text style={s.text}>
              • Displays your daily health score, key vitals, and activity summaries.{"\n"}
              • Integrates AI notifications like “hydration reminder” or “immune risk check.”{"\n"}
              • Summarizes your latest lab interpretations and chronic-care metrics.
            </Text>
          </Section>

          <Section title="How It Works">
            <Text style={s.text}>
              The dashboard aggregates inputs from sensors, lab reports, and your manual entries. ArogyaAI’s adaptive engine then ranks what matters most today.
            </Text>
          </Section>

          <Section title="Pro Tips">
            <Text style={s.text}>
              ✅ Tap any card (Heart, Nutrition, Mind, Sleep) to view detailed analytics.{"\n"}
              🌙 Night Mode saves battery and enhances clarity.{"\n"}
              🔔 Set custom alerts under Settings → Notifications.
            </Text>
          </Section>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const Section = ({ title, children }: any) => (
  <View style={s.section}>
    <Text style={s.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const s = StyleSheet.create({
  bg:{flex:1},safe:{flex:1,paddingHorizontal:18},
  headerRow:{flexDirection:"row",alignItems:"center",marginTop:10,marginBottom:14},
  back:{padding:4},header:{fontSize:20,fontWeight:"800",color:"#1d68af",marginLeft:10},
  hero:{alignItems:"center",marginBottom:20},heroTitle:{fontSize:18,fontWeight:"800",color:"#1b3e6e",marginTop:8},
  heroText:{fontSize:14,color:"#527389",textAlign:"center",marginTop:6,lineHeight:20,paddingHorizontal:8},
  section:{backgroundColor:"#fff",borderRadius:22,padding:20,marginBottom:16,shadowColor:"#cbeafe",shadowOpacity:.15,shadowRadius:10},
  sectionTitle:{fontSize:16,fontWeight:"800",color:"#1b3e6e",marginBottom:6},
  text:{fontSize:14,color:"#527389",lineHeight:21},
});
