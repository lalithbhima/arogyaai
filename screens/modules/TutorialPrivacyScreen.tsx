import React from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
 

export default function TutorialPrivacyScreen({ navigation }: any) {
  return (
    <LinearGradient colors={["#e8fff8","#ffffff","#e3f2ff"]} style={s.bg}>
      <SafeAreaView style={s.safe}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Ionicons name="chevron-back" size={26} color="#1d68af" />
          </TouchableOpacity>
          <Text style={s.header}>Privacy & Data Safety</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom:120 }} showsVerticalScrollIndicator={false}>
          <View style={s.hero}>
            <Ionicons name="shield-checkmark-outline" size={60} color="#22b497" />
            <Text style={s.heroTitle}>Your Health Data Stays Yours</Text>
            <Text style={s.heroText}>
              ArogyaAI follows international standards like GDPR and HIPAA to ensure your health information stays private, encrypted, and under your control.
            </Text>
          </View>

          <Section title="Encryption & Storage">
            <Text style={s.text}>
              • All data is encrypted at rest and in transit.{"\n"}
              • No third-party analytics — ArogyaAI never sells or shares your data.{"\n"}
              • Local storage mode ensures your insights remain on-device.
            </Text>
          </Section>

          <Section title="Consent Controls">
            <Text style={s.text}>
              Manage what ArogyaAI can analyze under Settings → Privacy Hub. Opt in/out for AI modules and delete records any time.
            </Text>
          </Section>

          <Section title="Transparency">
            <Text style={s.text}>
              Every AI suggestion includes “why” reasoning and a traceable audit log so you can see exactly how recommendations were formed.
            </Text>
          </Section>

          <Section title="Quick Tips">
            <Text style={s.text}>
              🔐 Review your privacy settings monthly.{"\n"}
              📄 Export data any time for medical consultations.{"\n"}
              🧭 Check the “Ethics Center” in More Features for ArogyaAI’s Ethical Charter.
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
