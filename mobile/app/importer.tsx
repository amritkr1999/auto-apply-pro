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
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../context/AuthContext';
import { jobTrackerService } from '../services/jobTrackerService';

export default function OpportunityImporterModal() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'URL' | 'TEXT' | 'CSV'>('URL');

  // Input states
  const [urlInput, setUrlInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [selectedCsv, setSelectedCsv] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handlePickCsv = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedCsv(result.assets[0].name);
      }
    } catch (e) {
      console.log('Error picking CSV:', e);
    }
  };

  const handleImportSubmit = async () => {
    let contentToSubmit = '';
    if (activeTab === 'URL') {
      if (!urlInput.trim()) {
        Alert.alert('Validation Error', 'Please paste a valid job link URL.');
        return;
      }
      contentToSubmit = urlInput.trim();
    } else if (activeTab === 'TEXT') {
      if (!textInput.trim()) {
        Alert.alert('Validation Error', 'Please paste the job description text.');
        return;
      }
      contentToSubmit = textInput.trim();
    } else {
      if (!selectedCsv) {
        Alert.alert('Validation Error', 'Please select a CSV file to import.');
        return;
      }
      contentToSubmit = selectedCsv;
    }

    setLoading(true);
    try {
      if (user?.id) {
        await jobTrackerService.importJobs(Number(user.id), {
          type: activeTab,
          content: contentToSubmit,
        });
      }
      Alert.alert(
        'Import Successful',
        `Job opportunity parsed and added to your tracker pipeline!`,
        [
          {
            text: 'View Tracker',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err) {
      Alert.alert('Import Error', 'Failed to import opportunity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      
      {/* Header Bar */}
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-slate-900 dark:text-white font-bold text-lg">Import Opportunities</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Tab Selection Switcher */}
        <View className="flex-row bg-slate-200/60 dark:bg-slate-900 p-1.5 rounded-2xl mb-6 border border-slate-200 dark:border-slate-800">
          {(['URL', 'TEXT', 'CSV'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-3 items-center rounded-xl ${
                activeTab === tab ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-transparent'
              }`}
            >
              <Text className={`font-bold text-xs ${activeTab === tab ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                {tab === 'URL' ? 'Job Link URL' : tab === 'TEXT' ? 'Description Text' : 'CSV Upload'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dynamic Form Content */}
        {activeTab === 'URL' && (
          <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="link" size={20} color="#10b981" />
              <Text className="text-slate-900 dark:text-white font-bold text-base ml-2">Paste Job Webpage URL</Text>
            </View>
            <Text className="text-slate-500 dark:text-slate-400 text-xs mb-4 leading-relaxed">
              Copy any job post link from LinkedIn, Naukri, Indeed, or Greenhouse. AI will parse job title, company, requirements, and location.
            </Text>
            <TextInput
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="https://www.linkedin.com/jobs/view/..."
              placeholderTextColor="#475569"
              autoCapitalize="none"
              keyboardType="url"
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white text-sm"
            />
          </View>
        )}

        {activeTab === 'TEXT' && (
          <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="document-text-outline" size={20} color="#10b981" />
              <Text className="text-slate-900 dark:text-white font-bold text-base ml-2">Raw Job Description Text</Text>
            </View>
            <Text className="text-slate-500 dark:text-slate-400 text-xs mb-4 leading-relaxed">
              Paste the complete job description copy below.
            </Text>
            <TextInput
              value={textInput}
              onChangeText={setTextInput}
              placeholder="Paste full job description here..."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={8}
              style={{ textAlignVertical: 'top', height: 160 }}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-slate-900 dark:text-white text-sm"
            />
          </View>
        )}

        {activeTab === 'CSV' && (
          <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6 items-center">
            <Ionicons name="cloud-upload-outline" size={36} color="#10b981" />
            <Text className="text-slate-900 dark:text-white font-bold text-base mt-2">Bulk CSV Import</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs text-center mt-1 mb-4 leading-relaxed">
              Select a CSV file containing columns: company, title, location, and job_url.
            </Text>

            {selectedCsv ? (
              <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-4 py-3 rounded-2xl w-full justify-between mb-2">
                <View className="flex-row items-center flex-1 pr-2">
                  <Ionicons name="document-attach" size={18} color="#10b981" />
                  <Text className="text-slate-900 dark:text-white font-semibold text-xs ml-2" numberOfLines={1}>{selectedCsv}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedCsv(null)}>
                  <Ionicons name="close-circle" size={18} color="#64748b" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handlePickCsv}
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3 flex-row items-center"
              >
                <Ionicons name="folder-open-outline" size={18} color="#10b981" />
                <Text className="text-slate-800 dark:text-white font-bold text-xs ml-2">Choose CSV File</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Submit Import Action Button */}
        <TouchableOpacity
          onPress={handleImportSubmit}
          disabled={loading}
          className="bg-emerald-500 rounded-2xl py-4 items-center shadow-lg shadow-emerald-500/20 active:opacity-90 mt-2"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Parse & Add to Job Pipeline</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
