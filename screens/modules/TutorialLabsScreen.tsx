import React from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
 

export default function TutorialLabsScreen({ navigation }: any) {
  return (
    <LinearGradient colors={["#f0faff","#ffffff","#e8fff5"]} style={s.bg}>
      <SafeAreaView style={s.safe}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Ionicons name="chevron-back" size={26} color="#1d68af" />
          </TouchableOpacity>
          <Text style={s.header}>Lab Report AI Analyzer</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom:120 }}>
          <View style={s.hero}>
            <Ionicons name="flask-outline" size={60} color="#f59e0b" />
            <Text style={s.heroTitle}>Understand Your Lab Results</Text>
            <Text style={s.heroText}>
              Paste or upload reports and ArogyaAI translates them into plain language insights — highlighting which values are high, low, or within range.
            </Text>
          </View>

          <Section title="Core Features">
            <Text style={s.text}>
              • Detects common markers (HbA1c, LDL, CRP, ALT etc.) automatically.{"\n"}
              • Stores each result to build time-based trend charts.{"\n"}
              • Provides AI-generated context and gentle lifestyle suggestions.
            </Text>
          </Section>

          <Section title="Data Flow">
            <Text style={s.text}>
              The text you paste is parsed securely on-device. Numeric values are extracted using pattern recognition and mapped to health domains (glucose, lipids, renal etc.).
            </Text>
          </Section>

          <Section title="Benefits">
            <Text style={s.text}>
              ✅ Saves time decoding complex medical terminology.{"\n"}
              📊 Visualizes progress with color-coded charts.{"\n"}
              🧠 Educates users without medical jargon.
            </Text>
          </Section>

          <Section title="Usage Tip">
            <Text style={s.text}>
              Enter clear text values (e.g., “LDL 145 mg/dL”) for best accuracy. ArogyaAI does not diagnose — always verify with your clinician.
            </Text>
          </Section>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const Section=({title,children}:any)=>(
  <View style={s.section}>
    <Text style={s.sectionTitle}>{title}</Text>{children}
  </View>
);

const s=StyleSheet.create({
  bg:{flex:1},safe:{flex:1,paddingHorizontal:18},
  headerRow:{flexDirection:"row",alignItems:"center",marginTop:10,marginBottom:14},
  back:{padding:4},header:{fontSize:20,fontWeight:"800",color:"#1d68af",marginLeft:10},
  hero:{alignItems:"center",marginBottom:20},heroTitle:{fontSize:18,fontWeight:"800",color:"#1b3e6e",marginTop:8},
  heroText:{fontSize:14,color:"#527389",textAlign:"center",marginTop:6,lineHeight:20,paddingHorizontal:8},
  section:{backgroundColor:"#fff",borderRadius:22,padding:20,marginBottom:16,shadowColor:"#cbeafe",shadowOpacity:.15,shadowRadius:10},
  sectionTitle:{fontSize:16,fontWeight:"800",color:"#1b3e6e",marginBottom:6},
  text:{fontSize:14,color:"#527389",lineHeight:21},
});
