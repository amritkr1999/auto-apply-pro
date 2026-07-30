import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function TopicDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color="#64748b" />
        </TouchableOpacity>
        <Text className="text-slate-900 dark:text-white font-bold text-lg">Topic Practice: #{id}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-3xl p-5 mb-6">
          <Text className="text-emerald-500 text-xs font-bold uppercase">Featured Interview Q&A</Text>
          <Text className="text-slate-900 dark:text-white text-lg font-bold mt-1">How does Metro bundler perform Tree Shaking in React Native?</Text>
        </View>

        <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm">
          <Text className="text-slate-500 text-xs font-bold uppercase mb-2">Detailed Answer</Text>
          <Text className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
            Metro bundler relies on Babel transformations to eliminate unused code. Unlike Webpack, Metro historically did limited dead code elimination, but modern Expo SDK builds utilize Hermes bytecode compilation to strip unreferenced modules during production bundle generation.
          </Text>

          <View className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
            <Text className="text-slate-400 text-[10px] font-mono mb-1">metro.config.js snippet</Text>
            <Text className="text-emerald-400 font-mono text-xs">
              {`module.exports = getDefaultConfig(__dirname, {\n  isCSSEnabled: true,\n});`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
