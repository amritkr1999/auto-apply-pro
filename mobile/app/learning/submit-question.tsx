import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { learningService } from '../../services/learningService';

export default function SubmitQuestionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [topicTitle, setTopicTitle] = useState('React Native & Expo Architecture');
  const [questionText, setQuestionText] = useState('');
  const [answerExplanation, setAnswerExplanation] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!questionText.trim() || !answerExplanation.trim()) {
      Alert.alert('Validation Error', 'Question text and Answer explanation are required.');
      return;
    }

    setSubmitting(true);
    try {
      await learningService.submitQuestion(Number(user?.id || 1), {
        topicTitle,
        questionText,
        answerExplanation,
        codeSnippet,
      });

      Alert.alert('Submitted!', 'Your interview question has been submitted for community review.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to submit question.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-slate-900 dark:text-white font-bold text-lg">Submit Interview Q&A</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6 space-y-4">
          <View>
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1.5 ml-1">Target Topic</Text>
            <TextInput
              value={topicTitle}
              onChangeText={setTopicTitle}
              placeholder="e.g. React Native Architecture"
              placeholderTextColor="#475569"
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm"
            />
          </View>

          <View className="mt-3">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1.5 ml-1">Question Prompt *</Text>
            <TextInput
              value={questionText}
              onChangeText={setQuestionText}
              placeholder="e.g. What is the difference between Reanimated 2 worklets and React Native Animated?"
              placeholderTextColor="#475569"
              multiline
              numberOfLines={3}
              style={{ textAlignVertical: 'top', height: 80 }}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm"
            />
          </View>

          <View className="mt-3">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1.5 ml-1">Answer & Technical Explanation *</Text>
            <TextInput
              value={answerExplanation}
              onChangeText={setAnswerExplanation}
              placeholder="Detailed technical explanation..."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={6}
              style={{ textAlignVertical: 'top', height: 120 }}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm leading-relaxed"
            />
          </View>

          <View className="mt-3">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1.5 ml-1">Code Snippet (Optional)</Text>
            <TextInput
              value={codeSnippet}
              onChangeText={setCodeSnippet}
              placeholder="const runOnUI = () => { 'worklet'; ... }"
              placeholderTextColor="#475569"
              multiline
              numberOfLines={4}
              style={{ textAlignVertical: 'top', height: 90 }}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-emerald-400 font-mono text-xs"
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className="bg-emerald-500 rounded-2xl py-4 items-center shadow-lg active:opacity-90"
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">Submit for Moderation</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
