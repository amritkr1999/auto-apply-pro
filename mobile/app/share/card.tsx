import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

export default function SharePlaqueCardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const publicUrl = `https://autoapplypro.com/profile/${user?.name?.toLowerCase().replace(/\s+/g, '-') || 'candidate'}`;

  const handleShareLink = async () => {
    try {
      await Share.share({
        message: `Check out my verified professional career profile on Auto Apply Pro:\n${publicUrl}`,
        url: publicUrl,
        title: `${user?.name || 'Candidate'} - Career Profile`,
      });
    } catch (error) {
      Alert.alert('Share Error', 'Could not open native share dialog.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      
      {/* Header Bar */}
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="close" size={24} color="#94a3b8" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Digital Plaque Card</Text>
        </View>
        <TouchableOpacity onPress={handleShareLink} className="p-1">
          <Ionicons name="share-social" size={22} color="#10b981" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        
        {/* Digital Plaque Card Container */}
        <View className="w-full bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-700/80 rounded-3xl p-6 shadow-2xl items-center mb-6 my-4">
          <View className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500/40 rounded-full items-center justify-center mb-4">
            <Ionicons name="person" size={38} color="#10b981" />
          </View>

          <Text className="text-white font-extrabold text-2xl text-center">{user?.name || 'Amrit Kumar'}</Text>
          <Text className="text-emerald-400 font-semibold text-sm mt-0.5">Verified Mobile & Systems Engineer</Text>

          <View className="h-[1px] w-full bg-slate-800 my-4" />

          {/* Quick Badges */}
          <View className="flex-row flex-wrap justify-center gap-2 mb-4">
            {['React Native', 'TypeScript', 'Expo SDK 56', 'Spring Boot', 'System Design'].map((skill) => (
              <View key={skill} className="bg-slate-800/80 border border-slate-700 rounded-full px-3 py-1">
                <Text className="text-slate-300 text-xs font-semibold">{skill}</Text>
              </View>
            ))}
          </View>

          {/* QR Code Visual Placeholder */}
          <View className="w-36 h-36 bg-white rounded-2xl p-2 items-center justify-center my-2 shadow-inner">
            <Ionicons name="qr-code" size={120} color="#0f172a" />
          </View>

          <Text className="text-slate-400 text-[11px] mt-2 font-mono">{publicUrl}</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleShareLink}
          className="w-full bg-emerald-500 rounded-2xl py-4 flex-row justify-center items-center shadow-lg shadow-emerald-500/25 active:opacity-90"
        >
          <Ionicons name="share-social-outline" size={20} color="#fff" />
          <Text className="text-white font-bold text-base ml-2">Share Digital Plaque Card</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
