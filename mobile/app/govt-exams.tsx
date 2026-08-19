import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  govtExamService,
  ExamCategory,
  ExamNotification,
  ExamPyq,
  QuestionPaper,
} from '../services/govtExamService';

export default function GovtExamsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ALERTS' | 'PYQ' | 'PAPERS'>('ALERTS');
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Data states
  const [notifications, setNotifications] = useState<ExamNotification[]>([]);
  const [pyqs, setPyqs] = useState<ExamPyq[]>([]);
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamNotification | null>(null);

  // PYQ Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  useEffect(() => {
    loadData();
  }, [selectedCategory, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'ALERTS') {
        const data = await govtExamService.getNotifications(selectedCategory, undefined, searchQuery);
        setNotifications(data);
      } else if (activeTab === 'PYQ') {
        const data = await govtExamService.getPyqs(selectedCategory);
        setPyqs(data);
      } else {
        const data = await govtExamService.getQuestionPapers(selectedCategory);
        setPapers(data);
      }
    } catch (e) {
      console.log('Govt exams fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    loadData();
  };

  const categories: { label: string; value: ExamCategory }[] = [
    { label: 'All Jobs', value: 'ALL' },
    { label: 'Central Govt', value: 'CENTRAL' },
    { label: 'Banking', value: 'BANKING' },
    { label: 'Railways', value: 'RAILWAYS' },
    { label: 'Defense', value: 'DEFENSE' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <View className="px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#64748b" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-slate-900 dark:text-white font-bold text-lg">Govt Exams & Sarkari Hub</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-xs">Autonomous Alerts & Preparation</Text>
        </View>
        <TouchableOpacity onPress={loadData} className="p-2">
          <Ionicons name="refresh" size={20} color="#10b981" />
        </TouchableOpacity>
      </View>

      {/* Main Tabs (Alerts / PYQ Bank / Question Papers) */}
      <View className="flex-row bg-slate-200 dark:bg-slate-900 p-1 mx-5 mt-4 rounded-2xl">
        <TouchableOpacity
          onPress={() => setActiveTab('ALERTS')}
          className={`flex-1 py-2.5 items-center rounded-xl ${
            activeTab === 'ALERTS' ? 'bg-emerald-500 shadow-sm' : ''
          }`}
        >
          <Text className={`font-bold text-xs ${activeTab === 'ALERTS' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
            🚨 Active Alerts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('PYQ')}
          className={`flex-1 py-2.5 items-center rounded-xl ${
            activeTab === 'PYQ' ? 'bg-emerald-500 shadow-sm' : ''
          }`}
        >
          <Text className={`font-bold text-xs ${activeTab === 'PYQ' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
            🧠 PYQ Bank
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('PAPERS')}
          className={`flex-1 py-2.5 items-center rounded-xl ${
            activeTab === 'PAPERS' ? 'bg-emerald-500 shadow-sm' : ''
          }`}
        >
          <Text className={`font-bold text-xs ${activeTab === 'PAPERS' ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`}>
            📄 PDF Papers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Pills Filter */}
      <View className="mt-3">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setSelectedCategory(cat.value)}
              className={`mr-2 px-4 py-2 rounded-full border ${
                selectedCategory === cat.value
                  ? 'bg-emerald-500/10 border-emerald-500'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  selectedCategory === cat.value ? 'text-emerald-500' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Input */}
      <View className="px-5 mt-3">
        <View className="flex-row items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 shadow-sm">
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            placeholder="Search exam name, UPSC, SSC, RRB..."
            placeholderTextColor="#94a3b8"
            className="flex-1 ml-2 text-slate-900 dark:text-white text-sm"
          />
        </View>
      </View>

      {/* Content Area */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} className="flex-1">
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-3">Loading Govt Opportunities...</Text>
          </View>
        ) : activeTab === 'ALERTS' ? (
          /* ALERTS LIST */
          notifications.length === 0 ? (
            <Text className="text-center text-slate-400 my-10 font-medium">No active exam notifications found.</Text>
          ) : (
            notifications.map((exam) => (
              <View
                key={exam.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1 pr-3">
                    <Text className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-0.5">
                      {exam.organization}
                    </Text>
                    <Text className="text-slate-900 dark:text-white text-base font-bold leading-snug">
                      {exam.title}
                    </Text>
                  </View>
                  <View className="bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    <Text className="text-emerald-500 text-[10px] font-bold">{exam.status}</Text>
                  </View>
                </View>

                {/* Badges Info */}
                <View className="flex-row flex-wrap gap-2 my-3">
                  <View className="flex-row items-center bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg">
                    <Ionicons name="people-outline" size={14} color="#64748b" />
                    <Text className="text-slate-700 dark:text-slate-300 text-xs font-semibold ml-1">
                      {exam.totalVacancies.toLocaleString()} Vacancies
                    </Text>
                  </View>
                  <View className="flex-row items-center bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg">
                    <Ionicons name="calendar-outline" size={14} color="#e11d48" />
                    <Text className="text-rose-600 dark:text-rose-400 text-xs font-bold ml-1">
                      Deadline: {exam.applicationDeadline}
                    </Text>
                  </View>
                </View>

                {/* Eligibility Snippet */}
                {exam.eligibilityCriteria && (
                  <Text className="text-slate-500 dark:text-slate-400 text-xs mb-4 leading-relaxed" numberOfLines={2}>
                    <Text className="font-semibold text-slate-700 dark:text-slate-300">Eligibility: </Text>
                    {exam.eligibilityCriteria}
                  </Text>
                )}

                {/* Action Buttons */}
                <View className="flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <TouchableOpacity
                    onPress={() => setSelectedExam(exam)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-950 rounded-xl items-center"
                  >
                    <Text className="text-slate-800 dark:text-slate-200 font-bold text-xs">View Syllabus & Details</Text>
                  </TouchableOpacity>

                  {exam.applyLink && (
                    <TouchableOpacity
                      onPress={() => Linking.openURL(exam.applyLink!)}
                      className="px-4 py-2.5 bg-emerald-500 rounded-xl flex-row items-center justify-center"
                    >
                      <Ionicons name="open-outline" size={14} color="#fff" />
                      <Text className="text-white font-bold text-xs ml-1">Apply Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )
        ) : activeTab === 'PYQ' ? (
          /* PYQ PRACTICE BANK */
          pyqs.map((pyq) => {
            const selectedOpt = selectedAnswers[pyq.id];
            const answered = selectedOpt !== undefined;
            const isCorrect = answered && selectedOpt === pyq.correctOptionIndex;

            return (
              <View
                key={pyq.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm"
              >
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-xs font-bold text-emerald-500">{pyq.examTitle} ({pyq.year})</Text>
                  <Text className="text-slate-400 text-[11px] font-semibold">{pyq.subject}</Text>
                </View>

                <Text className="text-slate-900 dark:text-white font-bold text-sm mb-4 leading-relaxed">
                  {pyq.question}
                </Text>

                {/* Options List */}
                <View className="space-y-2 mb-3">
                  {pyq.options.map((opt, idx) => {
                    const isThisOptSelected = selectedOpt === idx;
                    let optStyle = 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800';

                    if (answered) {
                      if (idx === pyq.correctOptionIndex) {
                        optStyle = 'bg-emerald-500/20 border-emerald-500';
                      } else if (isThisOptSelected) {
                        optStyle = 'bg-rose-500/20 border-rose-500';
                      }
                    }

                    return (
                      <TouchableOpacity
                        key={idx}
                        disabled={answered}
                        onPress={() => setSelectedAnswers((prev) => ({ ...prev, [pyq.id]: idx }))}
                        className={`p-3 rounded-2xl border flex-row items-center ${optStyle}`}
                      >
                        <Text className="font-bold text-xs text-slate-500 mr-2">
                          {String.fromCharCode(65 + idx)}.
                        </Text>
                        <Text className="flex-1 text-slate-800 dark:text-slate-200 text-xs font-medium">{opt}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Explanation */}
                {answered && pyq.explanation && (
                  <View className="mt-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <Text className="text-emerald-600 dark:text-emerald-400 font-bold text-xs mb-1">
                      {isCorrect ? '✅ Correct Answer!' : '❌ Incorrect'}
                    </Text>
                    <Text className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                      {pyq.explanation}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        ) : (
          /* PDF QUESTION PAPERS */
          papers.map((paper) => (
            <View
              key={paper.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-4 flex-row items-center justify-between shadow-sm"
            >
              <View className="flex-1 pr-3">
                <Text className="text-slate-900 dark:text-white font-bold text-sm mb-1">{paper.examTitle}</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs">
                  Year: {paper.year} • PDF Document
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => Linking.openURL(paper.downloadUrl)}
                className="bg-emerald-500 px-4 py-2.5 rounded-xl flex-row items-center"
              >
                <Ionicons name="download-outline" size={16} color="#fff" />
                <Text className="text-white font-bold text-xs ml-1">Download</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Exam Details & Syllabus Modal */}
      <Modal visible={Boolean(selectedExam)} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-h-[80%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-900 dark:text-white font-bold text-lg flex-1 pr-2">
                {selectedExam?.title}
              </Text>
              <TouchableOpacity onPress={() => setSelectedExam(null)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text className="text-emerald-500 font-bold text-xs uppercase mb-2">Syllabus Breakdown</Text>
              <View className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl mb-4">
                {selectedExam?.syllabusBreakdown?.map((item, idx) => (
                  <View key={idx} className="flex-row items-start mb-2">
                    <Text className="text-emerald-500 font-bold mr-2">•</Text>
                    <Text className="text-slate-800 dark:text-slate-200 text-xs flex-1 leading-relaxed">
                      {item}
                    </Text>
                  </View>
                ))}
              </View>

              {selectedExam?.importantDates && (
                <>
                  <Text className="text-emerald-500 font-bold text-xs uppercase mb-2">Important Dates</Text>
                  <View className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl mb-4 space-y-2">
                    {Object.entries(selectedExam.importantDates).map(([k, v]) => (
                      <View key={k} className="flex-row justify-between">
                        <Text className="text-slate-500 dark:text-slate-400 text-xs">{k}:</Text>
                        <Text className="text-slate-900 dark:text-white font-bold text-xs">{v}</Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
