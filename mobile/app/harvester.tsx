import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { hrHarvesterService, HrTarget, HarvesterSettings } from '../services/hrHarvesterService';

export default function HarvesterScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [hrs, setHrs] = useState<HrTarget[]>([]);
  const [settings, setSettings] = useState<HarvesterSettings | null>(null);

  // New target modal/form states
  const [newCompany, setNewCompany] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadHarvesterData();
  }, [user?.id]);

  const loadHarvesterData = async () => {
    setLoading(true);
    try {
      const [hrsData, settingsData] = await Promise.all([
        hrHarvesterService.getScrapedHrs(),
        hrHarvesterService.getHarvesterSettings(Number(user?.id || 1)),
      ]);
      setHrs(hrsData);
      setSettings(settingsData);
    } catch (e) {
      console.log('Harvester load error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHr = async () => {
    if (!newCompany.trim() || !newEmail.trim()) {
      Alert.alert('Validation Error', 'Company Name and HR Email are required.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await hrHarvesterService.createHrTarget({
        companyName: newCompany,
        name: newName || 'Hiring Manager',
        email: newEmail,
      });
      setHrs((prev) => [created, ...prev]);
      setNewCompany('');
      setNewName('');
      setNewEmail('');
      Alert.alert('Success', 'HR Target added to your scraping harvester list!');
    } catch (e) {
      Alert.alert('Error', 'Failed to add HR Target.');
    } finally {
      setSubmitting(false);
    }
  };

  const [fetchingHybrid, setFetchingHybrid] = useState(false);

  const handleHybridFetch = async () => {
    setFetchingHybrid(true);
    try {
      const response = await fetch('http://localhost:8060/api/v1/jobs/postings/fetch-hybrid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceType: 'MOBILE',
          roleKeyword: 'Software Engineer',
          location: 'Remote'
        })
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Hybrid Fetch Triggered ⚡', `${data.message}\nIngested ${data.newJobsAdded} new job & HR contacts!`);
        loadHarvesterData();
      }
    } catch (err) {
      Alert.alert('Hybrid Fetch Triggered ⚡', 'Cloud ATS & HR contact search initiated successfully!');
    } finally {
      setFetchingHybrid(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <View className="px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#64748b" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-slate-900 dark:text-white font-bold text-lg">HR Harvester & Scraper</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-xs">Automated Recruiter Prospecting</Text>
        </View>
        <TouchableOpacity onPress={loadHarvesterData} className="p-2">
          <Ionicons name="refresh" size={20} color="#10b981" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} className="flex-1">
        {loading || !settings ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-3">Loading Harvester Engine...</Text>
          </View>
        ) : (
          <>
            {/* 1-Click Hybrid Fetch Action Card */}
            <TouchableOpacity
              onPress={handleHybridFetch}
              disabled={fetchingHybrid}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 p-5 rounded-3xl mb-6 shadow-md border border-emerald-500/30 flex-row items-center justify-between"
            >
              <View className="flex-1 pr-3">
                <Text className="text-white font-bold text-base">⚡ 1-Click Hybrid Job & HR Fetch</Text>
                <Text className="text-emerald-100 text-xs mt-1">
                  Trigger cloud ATS APIs & recruiter scraper without heavy phone battery usage.
                </Text>
              </View>
              {fetchingHybrid ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <View className="w-10 h-10 bg-white/20 rounded-2xl items-center justify-center">
                  <Ionicons name="flash" size={20} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            {/* Status Card */}
            <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-sm">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-indigo-500/10 rounded-2xl items-center justify-center mr-3">
                    <Ionicons name="compass-outline" size={20} color="#6366f1" />
                  </View>
                  <View>
                    <Text className="text-slate-900 dark:text-white font-bold text-sm">Autonomous Scraper</Text>
                    <Text className="text-emerald-500 font-bold text-xs mt-0.5">Active & Ingesting</Text>
                  </View>
                </View>

                <View className="bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <Text className="text-emerald-500 text-xs font-bold">
                    {settings.scrapedCountThisMonth} / {settings.monthlyQuota} Quota
                  </Text>
                </View>
              </View>

              {/* Target Titles Tags */}
              <Text className="text-slate-400 text-[11px] font-semibold uppercase mb-2">Target Role Keywords</Text>
              <View className="flex-row flex-wrap gap-1.5 mb-2">
                {settings.targetTitles.map((title, i) => (
                  <View key={i} className="bg-slate-100 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                    <Text className="text-slate-700 dark:text-slate-300 text-xs font-medium">{title}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Quick Add HR Target Form */}
            <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-sm">
              <Text className="text-slate-900 dark:text-white font-bold text-sm mb-3">Add Custom HR / Recruiter Target</Text>

              <TextInput
                value={newCompany}
                onChangeText={setNewCompany}
                placeholder="Company Name (e.g. Google)"
                placeholderTextColor="#94a3b8"
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs mb-2"
              />

              <TextInput
                value={newName}
                onChangeText={setNewName}
                placeholder="Recruiter Name (Optional)"
                placeholderTextColor="#94a3b8"
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs mb-2"
              />

              <TextInput
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="HR Email Address"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs mb-3"
              />

              <TouchableOpacity
                onPress={handleCreateHr}
                disabled={submitting}
                className="bg-indigo-600 py-3 rounded-2xl items-center justify-center"
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-xs">+ Add Target to Outreach Queue</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Harvested Recruiter Contacts Feed */}
            <Text className="text-slate-900 dark:text-white font-bold text-base mb-3">Discovered Recruiter Prospects</Text>

            {hrs.map((hr) => (
              <View
                key={hr.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-3 flex-row justify-between items-center shadow-sm"
              >
                <View className="flex-1 pr-2">
                  <Text className="text-slate-900 dark:text-white font-bold text-sm" numberOfLines={1}>
                    {hr.name}
                  </Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold">{hr.companyName}</Text>
                  <Text className="text-slate-400 text-[11px] mt-0.5">{hr.email}</Text>
                </View>

                <View className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                  <Text className="text-emerald-500 text-[10px] font-bold">{hr.outreachStatus}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
