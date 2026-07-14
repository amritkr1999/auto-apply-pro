import React, { useState, useEffect } from 'react';
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
import * as DocumentPicker from 'expo-document-picker';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import * as SecureStore from 'expo-secure-store';
import { feedbackService } from '../../services/feedbackService';
import { useTheme } from '../../components/useColorScheme';

interface ProfileData {
  name: string;
  email: string;
  mobile: string;
  officialEmail: string;
  summary: string;
  skills: string[];
  resumeFilename: string | null;
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const { themeMode, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [syncingProfile, setSyncingProfile] = useState(false);

  // Feedback States
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState<boolean>(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string>('');

  const handleFeedbackSubmit = async () => {
    if (feedbackRating === 0) {
      setFeedbackError('Please select a rating of at least 1 star.');
      return;
    }
    if (!feedbackComment.trim()) {
      setFeedbackError('Please write a short comment about your experience.');
      return;
    }

    setFeedbackSubmitting(true);
    setFeedbackError('');
    setFeedbackSuccess(false);

    try {
      await feedbackService.submitFeedback(feedbackRating, feedbackComment);
      setFeedbackSuccess(true);
      setFeedbackRating(0);
      setFeedbackComment('');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to submit feedback. Please try again.';
      setFeedbackError(errMsg);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleReplayTour = async () => {
    try {
      await SecureStore.setItemAsync(`walkthrough_completed_${user?.id}`, 'false');
      Alert.alert(
        'Walkthrough Reset',
        'The guided tour has been reset! Switch to the Dashboard tab to view it again.',
        [{ text: 'OK' }]
      );
    } catch (e) {
      console.log('Error resetting walkthrough:', e);
    }
  };

  // Form states
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    officialEmail: user?.officialEmail || '',
    summary: '',
    skills: [],
    resumeFilename: null,
  });

  const [newSkill, setNewSkill] = useState('');

  // Fetch candidate profile data on mount
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get<any>(`/profiles/candidate/${user?.id}`);
      setProfile({
        name: response.data.name || '',
        email: response.data.email || '',
        mobile: response.data.mobile || '',
        officialEmail: response.data.officialEmail || '',
        summary: response.data.summary || '',
        skills: response.data.skills || [],
        resumeFilename: response.data.resumeFilename || null,
      });
    } catch (error: any) {
      console.log('Error fetching profile from backend, using default mock details:', error);
      // Mock fallback for preview purposes
      setProfile({
        name: user?.name || 'Amrit Kumar',
        email: user?.email || 'amrit@example.com',
        mobile: '+1 (555) 019-2834',
        officialEmail: 'amrit.official@work.com',
        summary: 'Passionate mobile software engineer with 4+ years of building React and cross-platform native applications. Focused on state optimization and clean interfaces.',
        skills: ['TypeScript', 'React Native', 'Expo', 'Tailwind CSS', 'Spring Boot', 'Python', 'FastAPI'],
        resumeFilename: 'Amrit_Kumar_Resume.pdf',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await api.put(`/profiles/candidate/${user?.id}`, {
        ...profile,
        userId: user?.id,
      });
      Alert.alert('Success', 'Profile details updated successfully.');
    } catch (error: any) {
      console.log('Error saving profile changes:', error);
      // Simulate success for local mockup if server is down
      Alert.alert('Mock Success', 'Profile changes saved (Mock Mode).');
    } finally {
      setLoading(false);
    }
  };

  const handlePickAndUploadResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedFile = result.assets[0];
      setUploadingResume(true);

      // Construct multipart form data
      const formData = new FormData();
      
      // Axios request on mobile needs specific File representation
      const filePayload = {
        uri: selectedFile.uri,
        name: selectedFile.name || 'resume.pdf',
        type: selectedFile.mimeType || 'application/pdf',
      };
      
      formData.append('file', filePayload as any);

      await api.post(`/profiles/candidate/${user?.id}/resume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setProfile(prev => ({ ...prev, resumeFilename: selectedFile.name }));
      Alert.alert('Success', `Resume "${selectedFile.name}" uploaded successfully.`);
      
    } catch (error: any) {
      console.log('Error uploading resume:', error);
      // Fallback feedback
      Alert.alert('Mock Upload Success', 'Resume marked as uploaded (Server offline mockup).');
      setProfile(prev => ({ ...prev, resumeFilename: 'Uploaded_Resume.pdf' }));
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSyncProfileFromResume = async () => {
    if (!profile.resumeFilename) {
      Alert.alert('No Resume Found', 'Please upload a resume first to synchronize your profile.');
      return;
    }

    setSyncingProfile(true);
    try {
      await api.post(`/profiles/candidate/${user?.id}/resume/sync`);
      Alert.alert('Sync Successful', 'Your profile details have been re-parsed and updated.');
      fetchProfile();
    } catch (error: any) {
      console.log('Sync profile failed:', error);
      // Simulate response
      setTimeout(() => {
        setProfile(prev => ({
          ...prev,
          summary: 'Extracted summary from uploaded resume: Expert Software Engineer specializing in full-stack architecture, automation pipelines, and high-performance cross-platform apps.',
          skills: [...new Set([...prev.skills, 'Kubernetes', 'Alembic', 'PostgreSQL'])],
        }));
        Alert.alert('AI Sync Mock Successful', 'AI pipeline parsed the resume and synchronized skills/summary details.');
        setSyncingProfile(false);
      }, 2000);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (profile.skills.includes(newSkill.trim())) {
      setNewSkill('');
      return;
    }
    setProfile(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()],
    }));
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove),
    }));
  };

  if (loading && profile.skills.length === 0) {
    return (
      <View className="flex-1 bg-slate-50 dark:bg-slate-950 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-grow flex-1 bg-slate-50 dark:bg-slate-950">
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} className="px-5">
        
        {/* Resume Management Card */}
        <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mt-6 mb-6">
          <Text className="text-slate-900 dark:text-white text-lg font-bold mb-3">Resume Document</Text>
          {profile.resumeFilename ? (
            <View className="flex-row items-center bg-slate-100 dark:bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-4 mb-4">
              <View className="w-10 h-10 bg-emerald-500/10 rounded-xl items-center justify-center">
                <Ionicons name="document-text" size={22} color="#10b981" />
              </View>
              <View className="flex-1 ml-3 pr-2">
                <Text className="text-slate-900 dark:text-white font-semibold text-sm" numberOfLines={1}>
                  {profile.resumeFilename}
                </Text>
                <Text className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">Ready for auto-outreach</Text>
              </View>
              <TouchableOpacity onPress={handlePickAndUploadResume}>
                <Text className="text-emerald-400 text-xs font-bold uppercase">Replace</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handlePickAndUploadResume}
              disabled={uploadingResume}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-100/40 dark:bg-slate-950/40 rounded-2xl p-6 items-center mb-4"
            >
              {uploadingResume ? (
                <ActivityIndicator color="#10b981" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={28} color="#94a3b8" />
                  <Text className="text-slate-700 dark:text-slate-300 font-semibold text-sm mt-2">Upload Resume PDF</Text>
                  <Text className="text-slate-400 dark:text-slate-500 text-xs mt-1">Supports file sizes up to 10MB</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* Sync Button */}
          <TouchableOpacity
            onPress={handleSyncProfileFromResume}
            disabled={syncingProfile || !profile.resumeFilename}
            className={`flex-row items-center justify-center py-3 rounded-2xl border ${
              profile.resumeFilename
                ? 'bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 active:bg-slate-200 dark:active:bg-slate-800'
                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-50'
            }`}
          >
            {syncingProfile ? (
              <ActivityIndicator color="#10b981" />
            ) : (
              <>
                <Ionicons name="sync-outline" size={16} color={profile.resumeFilename ? '#10b981' : '#64748b'} />
                <Text className={`font-semibold text-sm ml-2 ${profile.resumeFilename ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                  Sync Profile with AI Parser
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Profile Form Details */}
        <Text className="text-slate-900 dark:text-white text-lg font-bold mb-4">Contact Details</Text>
        <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6 space-y-4">
          <View>
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1.5 ml-1">FULL NAME</Text>
            <TextInput
              value={profile.name}
              onChangeText={(t) => setProfile(p => ({ ...p, name: t }))}
              placeholder="Your full name"
              placeholderTextColor="#475569"
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-slate-900 dark:text-white text-base"
            />
          </View>

          <View className="mt-3">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1.5 ml-1">PHONE NUMBER</Text>
            <TextInput
              value={profile.mobile}
              onChangeText={(t) => setProfile(p => ({ ...p, mobile: t }))}
              placeholder="+1 (555) 000-0000"
              placeholderTextColor="#475569"
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-slate-900 dark:text-white text-base"
            />
          </View>

          <View className="mt-3">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1.5 ml-1">OFFICIAL EMAIL (FOR OUTREACH)</Text>
            <TextInput
              value={profile.officialEmail}
              onChangeText={(t) => setProfile(p => ({ ...p, officialEmail: t }))}
              placeholder="you.outreach@domain.com"
              placeholderTextColor="#475569"
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-slate-900 dark:text-white text-base"
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View className="mt-3">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1.5 ml-1">PROFESSIONAL SUMMARY</Text>
            <TextInput
              value={profile.summary}
              onChangeText={(t) => setProfile(p => ({ ...p, summary: t }))}
              placeholder="Brief professional intro..."
              placeholderTextColor="#475569"
              multiline
              numberOfLines={4}
              style={{ textAlignVertical: 'top', height: 100 }}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-slate-900 dark:text-white text-base leading-relaxed"
            />
          </View>
        </View>

        {/* Skills Tag Management */}
        <Text className="text-slate-900 dark:text-white text-lg font-bold mb-4">Core Skills</Text>
        <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6">
          <View className="flex-row mb-4">
            <TextInput
              value={newSkill}
              onChangeText={setNewSkill}
              placeholder="Add skill (e.g. Docker)"
              placeholderTextColor="#475569"
              className="flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-base"
              onSubmitEditing={handleAddSkill}
            />
            <TouchableOpacity
              onPress={handleAddSkill}
              className="bg-emerald-500 rounded-xl px-4 justify-center items-center ml-2 active:opacity-90"
            >
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Skill Chips Grid */}
          <View className="flex-row flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <View
                key={skill}
                className="flex-row items-center bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full px-3.5 py-1.5"
              >
                <Text className="text-slate-700 dark:text-slate-200 text-sm font-medium">{skill}</Text>
                <TouchableOpacity onPress={() => handleRemoveSkill(skill)} className="ml-2">
                  <Ionicons name="close-circle" size={16} color="#64748b" />
                </TouchableOpacity>
              </View>
            ))}
            {profile.skills.length === 0 && (
              <Text className="text-slate-400 dark:text-slate-500 text-sm italic py-2 ml-1">No skills added yet.</Text>
            )}
          </View>
        </View>

        {/* Appearance Settings Card */}
        <Text className="text-slate-900 dark:text-white text-lg font-bold mb-4 mt-6">Appearance</Text>
        <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6">
          <Text className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 leading-relaxed mb-4">
            Customize how Auto Apply Pro looks on your device. Choose Light, Dark, or System Default theme.
          </Text>
          <View className="flex-row bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            {(['system', 'light', 'dark'] as const).map((mode) => {
              const isActive = themeMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setTheme(mode)}
                  className={`flex-1 py-3 items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? 'bg-white dark:bg-slate-900 shadow-sm border border-slate-200/50 dark:border-slate-800'
                      : 'bg-transparent'
                  }`}
                >
                  <Text
                    className={`font-semibold text-xs capitalize ${
                      isActive ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {mode}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Help & Guided Tour Section */}
        <Text className="text-slate-900 dark:text-white text-lg font-bold mb-4 mt-6">Help & Onboarding</Text>
        <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6 flex-row justify-between items-center">
          <View className="flex-1 pr-4">
            <Text className="text-slate-900 dark:text-white font-bold text-sm">Need a refresher?</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
              Replay the 1-minute guided tour to learn how to manage and optimize your job applications.
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleReplayTour}
            className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 active:bg-slate-200 dark:active:bg-slate-850"
          >
            <Text className="text-emerald-400 text-xs font-bold uppercase">Replay Tour</Text>
          </TouchableOpacity>
        </View>

        {/* Share Your Feedback Section */}
        <Text className="text-slate-900 dark:text-white text-lg font-bold mb-4">Share Your Feedback</Text>
        <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6">
          <Text className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 leading-relaxed mb-4">
            Your feedback helps us improve Auto Apply Pro. Share your rating and review with us.
          </Text>

          <View className="mb-4">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2 ml-1">SELECT RATING</Text>
            <View className="flex-row items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setFeedbackRating(star)}
                  className="p-1"
                >
                  <Ionicons
                    name={star <= feedbackRating ? 'star' : 'star-outline'}
                    size={28}
                    color={star <= feedbackRating ? '#fbbf24' : '#475569'}
                  />
                </TouchableOpacity>
              ))}
              {feedbackRating > 0 && (
                <Text className="text-slate-450 dark:text-slate-400 text-xs font-semibold ml-2">
                  {feedbackRating === 5 ? 'Excellent!' : feedbackRating === 4 ? 'Very Good!' : feedbackRating === 3 ? 'Good' : feedbackRating === 2 ? 'Fair' : 'Poor'}
                </Text>
              )}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2 ml-1">REVIEW COMMENT</Text>
            <TextInput
              value={feedbackComment}
              onChangeText={setFeedbackComment}
              placeholder="What has been your experience using the platform? Any suggestions for improvement?"
              placeholderTextColor="#475569"
              multiline
              numberOfLines={4}
              style={{ textAlignVertical: 'top', height: 80 }}
              className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-slate-900 dark:text-white text-sm"
              maxLength={500}
            />
          </View>

          {feedbackSuccess && (
            <View className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-4">
              <Text className="text-emerald-400 text-xs text-center font-medium">Thank you! Your feedback has been submitted successfully.</Text>
            </View>
          )}

          {feedbackError ? (
            <View className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-4">
              <Text className="text-rose-400 text-xs text-center font-medium">{feedbackError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleFeedbackSubmit}
            disabled={feedbackSubmitting}
            className="bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 dark:border-emerald-500/30 rounded-2xl py-3.5 items-center active:opacity-90 disabled:opacity-50"
          >
            {feedbackSubmitting ? (
              <ActivityIndicator color="#10b981" />
            ) : (
              <Text className="text-emerald-400 font-bold text-base">Submit Review</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Save Profile Button */}
        <TouchableOpacity
          onPress={handleUpdateProfile}
          disabled={loading}
          className="bg-emerald-50 rounded-2xl py-3.5 items-center shadow-lg shadow-emerald-500/20 active:opacity-90 bg-emerald-500"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-lg">Save Profile Changes</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
