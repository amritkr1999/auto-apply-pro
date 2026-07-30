import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { learningService, LearningTopic, LearningRoadmap, QuestionSubmission } from '../../services/learningService';

export default function LearningScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'TOPICS' | 'ROADMAPS' | 'SUBMISSIONS'>('TOPICS');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [topics, setTopics] = useState<LearningTopic[]>([]);
  const [roadmaps, setRoadmaps] = useState<LearningRoadmap[]>([]);
  const [submissions, setSubmissions] = useState<QuestionSubmission[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tData, rData, sData] = await Promise.all([
        learningService.getTopics(),
        learningService.getRoadmaps(),
        learningService.getUserSubmissions(Number(user?.id || 1)),
      ]);
      setTopics(tData);
      setRoadmaps(rData);
      setSubmissions(sData);
    } catch (e) {
      console.log('Learning data error:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getDifficultyBadge = (d: LearningTopic['difficulty']) => {
    switch (d) {
      case 'BEGINNER':
        return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
      case 'INTERMEDIATE':
        return 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
      case 'ADVANCED':
        return 'text-rose-500 bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      
      {/* Header Bar */}
      <View className="px-5 py-4 flex-row justify-between items-center border-b border-slate-200 dark:border-slate-800">
        <View>
          <Text className="text-slate-900 dark:text-white font-bold text-xl">Learning Space Hub</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-xs">Interview prep, roadmaps & community Q&A</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/learning/submit-question')}
          className="bg-emerald-500 rounded-xl px-3 py-2 flex-row items-center active:opacity-90"
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text className="text-white font-bold text-xs ml-1">Submit Question</Text>
        </TouchableOpacity>
      </View>

      {/* Segmented Selector */}
      <View className="px-5 pt-3">
        <View className="flex-row bg-slate-200/60 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          {(['TOPICS', 'ROADMAPS', 'SUBMISSIONS'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 items-center rounded-xl ${
                activeTab === tab ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-transparent'
              }`}
            >
              <Text className={`font-bold text-xs ${activeTab === tab ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                {tab === 'TOPICS' ? 'Topics' : tab === 'ROADMAPS' ? 'Roadmaps' : 'My Q&A'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10b981" />}
        >
          {activeTab === 'TOPICS' && (
            <View className="space-y-4">
              {topics.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  onPress={() => router.push(`/learning/topic/${topic.id}` as any)}
                  activeOpacity={0.85}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-row items-center flex-1 pr-2">
                      <View className="w-10 h-10 bg-emerald-500/10 rounded-2xl items-center justify-center mr-3">
                        <Ionicons name={(topic.iconName as any) || 'code-slash'} size={20} color="#10b981" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-slate-900 dark:text-white font-bold text-base">{topic.title}</Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold">{topic.category}</Text>
                      </View>
                    </View>

                    <View className={`border rounded-xl px-2.5 py-1 ${getDifficultyBadge(topic.difficulty)}`}>
                      <Text className="text-[10px] font-bold">{topic.difficulty}</Text>
                    </View>
                  </View>

                  <Text className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-3">{topic.description}</Text>

                  <View className="flex-row justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3">
                    <View className="flex-row items-center">
                      <Ionicons name="help-circle-outline" size={14} color="#94a3b8" />
                      <Text className="text-slate-500 dark:text-slate-400 text-xs ml-1 font-medium">{topic.questionCount} Questions</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-emerald-500 font-bold text-xs mr-1">Practice Now</Text>
                      <Ionicons name="chevron-forward" size={14} color="#10b981" />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'ROADMAPS' && (
            <View className="space-y-4">
              {roadmaps.map((rm) => (
                <TouchableOpacity
                  key={rm.id}
                  onPress={() => router.push(`/learning/roadmap/${rm.id}` as any)}
                  activeOpacity={0.85}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 pr-2">
                      <Text className="text-slate-900 dark:text-white font-bold text-lg">{rm.title}</Text>
                      <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-0.5">{rm.role} • ~{rm.estimatedHours} hrs</Text>
                    </View>
                    <Ionicons name="map-outline" size={24} color="#10b981" />
                  </View>

                  {/* Progress Bar Preview */}
                  <View className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 my-3">
                    <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">Roadmap Modules ({rm.steps.length})</Text>
                    {rm.steps.map((st, idx) => (
                      <View key={st.id} className="flex-row items-center mb-1.5">
                        <View className={`w-2 h-2 rounded-full mr-2 ${st.status === 'COMPLETED' ? 'bg-emerald-500' : st.status === 'IN_PROGRESS' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        <Text className="text-slate-800 dark:text-slate-200 text-xs font-medium flex-1">{idx + 1}. {st.title}</Text>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'SUBMISSIONS' && (
            <View className="space-y-4">
              {submissions.map((sub) => (
                <View
                  key={sub.id || sub.questionText}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm"
                >
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-emerald-500 text-xs font-bold uppercase">{sub.topicTitle}</Text>
                    <View className={`px-2 py-0.5 rounded-full border ${sub.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 text-emerald-500' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 text-amber-500'}`}>
                      <Text className="text-[10px] font-bold uppercase">{sub.status}</Text>
                    </View>
                  </View>
                  <Text className="text-slate-900 dark:text-white font-bold text-sm mb-2">{sub.questionText}</Text>
                  <View className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3">
                    <Text className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">{sub.answerExplanation}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

    </SafeAreaView>
  );
}
