import React from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";


export default function RecordImportScreen({ navigation }: any) {
  return (
    <LinearGradient colors={["#e7f6ff","#f7fdff","#e0fff6"]} style={s.bg}>
      <SafeAreaView style={s.safe}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
            <Ionicons name="chevron-back" size={26} color="#2278f9"/>
          </TouchableOpacity>
          <Text style={s.header}>Medical Record Import</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:120}}>
          <Card icon="cloud-upload-outline" color="#1b92f7" title="Connect EHR System"
                desc="Link your electronic health records for automatic data sync." btn="Connect Now"/>
          <Card icon="document-attach-outline" color="#42a9f9" title="Upload Health Documents"
                desc="Import PDF, CCD, or HL7 files from your device securely." btn="Upload File"/>
          <Card icon="refresh-circle-outline" color="#23b7a0" title="Sync Status"
                desc="Check last sync time and data transfer summary." btn="View Status"/>
          <Card icon="lock-closed-outline" color="#2563eb" title="Privacy Notice"
                desc="Your records are encrypted and never shared without your consent." btn="Learn More"/>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
