import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function RoadmapDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const steps = [
    { title: '1. React Native Core Architecture', desc: 'Fabric renderer, TurboModules, JSI memory bridge.', status: 'COMPLETED' },
    { title: '2. UI & Animations', desc: 'Reanimated 3, Gesture Handler, NativeWind Tailwind styling.', status: 'IN_PROGRESS' },
    { title: '3. Native Device APIs', desc: 'Biometric Auth, SecureStore, Camera, Push Notifications.', status: 'LOCKED' },
    { title: '4. CI/CD & EAS Publishing', desc: 'Build pipelines, OTA updates, App Store submission.', status: 'LOCKED' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color="#64748b" />
        </TouchableOpacity>
        <Text className="text-slate-900 dark:text-white font-bold text-lg">Roadmap Progression #{id}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text className="text-slate-900 dark:text-white text-xl font-bold mb-2">Senior Mobile Engineer Mastery</Text>
        <Text className="text-slate-500 dark:text-slate-400 text-xs mb-6">Step-by-step career milestones with learning resources.</Text>

        <View className="space-y-4">
          {steps.map((st, i) => (
            <View
              key={st.title}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm flex-row items-start"
            >
              <View className={`w-8 h-8 rounded-full items-center justify-center mr-4 mt-0.5 ${st.status === 'COMPLETED' ? 'bg-emerald-500' : st.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-800'}`}>
                <Ionicons name={st.status === 'COMPLETED' ? 'checkmark' : st.status === 'IN_PROGRESS' ? 'time' : 'lock-closed'} size={16} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-slate-900 dark:text-white font-bold text-base">{st.title}</Text>
                <Text className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed">{st.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
