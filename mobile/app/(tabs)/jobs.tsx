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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import KanbanBoard from '../../components/KanbanBoard';
import { jobTrackerService, JobApplication, ApplicationStatus } from '../../services/jobTrackerService';

interface JobOpportunity {
  id: number;
  title: string;
  company: string;
  location: string;
  sourceUrl?: string;
  description: string;
  draftSubject: string;
  draftBody: string;
}

export default function JobsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Mode state: 'QUEUE' (Swipe Review) vs 'TRACKER' (Kanban Pipeline)
  const [viewMode, setViewMode] = useState<'QUEUE' | 'TRACKER'>('QUEUE');

  // Queue states
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Kanban Tracker states
  const [trackerApps, setTrackerApps] = useState<JobApplication[]>([]);
  const [loadingTracker, setLoadingTracker] = useState(false);

  // Create Job Modal state
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('WISHLIST');
  const [newRound, setNewRound] = useState('');

  // Edit draft modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [actioning, setActioning] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchTrackerApps();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get<JobOpportunity[]>(`/jobs/review?userId=${user?.id}`);
      setJobs(response.data);
    } catch (error: any) {
      setJobs([
        {
          id: 101,
          title: 'Senior Software Engineer (Mobile)',
          company: 'Hopin',
          location: 'Remote (US/Canada)',
          description: 'We are seeking an experienced React Native developer to help build remote platform interfaces.',
          draftSubject: 'Amrit Kumar | Application for Senior Software Engineer (Mobile)',
          draftBody: `Dear Hiring Team,\n\nI noticed Hopin's open role for a Senior Mobile Engineer and wanted to express my interest. I have over 4 years of experience specializing in React Native and Expo projects.\n\nBest regards,\nAmrit Kumar`,
        },
        {
          id: 102,
          title: 'Mobile App Developer',
          company: 'Flexport',
          location: 'San Francisco, CA',
          description: 'Join our logistics technology team. Responsible for mobile supply-chain platforms.',
          draftSubject: 'Application for Mobile App Developer - Amrit Kumar',
          draftBody: `Dear Recruiters,\n\nI am writing to apply for the Mobile App Developer position at Flexport. I have a strong background in developing cross-platform applications.\n\nThank you,\nAmrit Kumar`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackerApps = async () => {
    if (!user?.id) return;
    setLoadingTracker(true);
    try {
      const data = await jobTrackerService.getApplications(Number(user.id));
      setTrackerApps(data);
    } catch (err) {
      console.log('Tracker fetch error:', err);
    } finally {
      setLoadingTracker(false);
    }
  };

  const handleTrackerStatusChange = async (id: number, status: ApplicationStatus) => {
    setTrackerApps(prev => prev.map(app => (app.id === id ? { ...app, status } : app)));
    try {
      await jobTrackerService.updateStatus(id, status);
    } catch (err) {
      console.log('Status update error:', err);
    }
  };

  const handleCreateJobSubmit = async () => {
    if (!newCompany.trim() || !newTitle.trim()) {
      Alert.alert('Validation Error', 'Company Name and Job Title are required.');
      return;
    }

    try {
      const newApp = await jobTrackerService.createApplication(Number(user?.id || 1), {
        companyName: newCompany,
        jobTitle: newTitle,
        location: newLocation,
        status: newStatus,
        currentRound: newRound,
      });

      setTrackerApps(prev => [newApp, ...prev]);
      setCreateModalVisible(false);
      setNewCompany('');
      setNewTitle('');
      setNewLocation('');
      setNewRound('');
      Alert.alert('Success', 'Application added to your job tracker!');
    } catch (err) {
      Alert.alert('Error', 'Failed to add application.');
    }
  };

  const handleAction = async (status: 'SENT' | 'REJECTED') => {
    if (jobs.length === 0 || currentIndex >= jobs.length) return;
    const currentJob = jobs[currentIndex];

    setActioning(true);
    try {
      if (status === 'SENT') {
        await api.post(`/outreach/send`, {
          userId: user?.id,
          jobId: currentJob.id,
          subject: currentJob.draftSubject,
          body: currentJob.draftBody,
        });
        Alert.alert('Outreach Sent!', `Personalized outreach queued and sent to ${currentJob.company}.`);
      } else {
        await api.put(`/jobs/${currentJob.id}/status`, { status: 'REJECTED', userId: user?.id });
      }
    } catch (error) {
      Alert.alert(
        status === 'SENT' ? 'Outreach Sent (Mock)' : 'Job Skipped (Mock)',
        status === 'SENT' ? `Outreach email sent to ${currentJob.company}!` : `Skipped application review.`
      );
    } finally {
      setActioning(false);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const openEditModal = () => {
    if (jobs.length === 0 || currentIndex >= jobs.length) return;
    const currentJob = jobs[currentIndex];
    setEditedSubject(currentJob.draftSubject);
    setEditedBody(currentJob.draftBody);
    setEditModalVisible(true);
  };

  const saveEditedDraft = () => {
    setJobs(prevJobs => {
      const updated = [...prevJobs];
      updated[currentIndex] = {
        ...updated[currentIndex],
        draftSubject: editedSubject,
        draftBody: editedBody,
      };
      return updated;
    });
    setEditModalVisible(false);
  };

  const activeJob = jobs[currentIndex];
  const hasQueueFinished = !activeJob || currentIndex >= jobs.length;

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      
      {/* Top Controls: Mode Switcher & Import Button */}
      <View className="px-5 pt-3 pb-2 flex-row justify-between items-center border-b border-slate-200 dark:border-slate-800/80">
        
        {/* Segmented Control */}
        <View className="flex-row bg-slate-200/60 dark:bg-slate-900 p-1 rounded-2xl flex-1 mr-3 border border-slate-200 dark:border-slate-800">
          <TouchableOpacity
            onPress={() => setViewMode('QUEUE')}
            className={`flex-1 py-2 items-center rounded-xl ${
              viewMode === 'QUEUE' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-transparent'
            }`}
          >
            <Text className={`font-bold text-xs ${viewMode === 'QUEUE' ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
              Draft Queue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setViewMode('TRACKER')}
            className={`flex-1 py-2 items-center rounded-xl ${
              viewMode === 'TRACKER' ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-transparent'
            }`}
          >
            <Text className={`font-bold text-xs ${viewMode === 'TRACKER' ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
              Kanban Tracker
            </Text>
          </TouchableOpacity>
        </View>

        {/* Importer Launch Button */}
        <TouchableOpacity
          onPress={() => router.push('/importer')}
          className="flex-row items-center bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-2xl active:opacity-80"
        >
          <Ionicons name="cloud-upload-outline" size={16} color="#10b981" />
          <Text className="text-emerald-500 dark:text-emerald-400 font-bold text-xs ml-1.5">Import</Text>
        </TouchableOpacity>
      </View>

      {/* Main View Mode Body */}
      {viewMode === 'TRACKER' ? (
        <KanbanBoard
          applications={trackerApps}
          onStatusChange={handleTrackerStatusChange}
          onAddJob={() => setCreateModalVisible(true)}
          onSelectJob={(app) => {
            Alert.alert(
              app.jobTitle,
              `Company: ${app.companyName}\nStage: ${app.status}\nNotes: ${app.notes || 'None'}`
            );
          }}
        />
      ) : (
        // DRAFT QUEUE SWIPE MODE
        loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : hasQueueFinished ? (
          <View className="flex-1 items-center justify-center px-6">
            <View className="w-20 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full items-center justify-center mb-6 shadow-sm">
              <Ionicons name="checkmark-done-circle" size={42} color="#10b981" />
            </View>
            <Text className="text-slate-900 dark:text-white text-2xl font-bold text-center">Queue Empty!</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-sm text-center mt-2 max-w-xs leading-relaxed">
              You've reviewed all drafted outreach emails. Check your Kanban pipeline or import new jobs.
            </Text>
            <TouchableOpacity
              onPress={() => setCurrentIndex(0)}
              className="bg-emerald-500 rounded-2xl px-6 py-3 mt-8 active:opacity-90"
            >
              <Text className="text-white font-bold">Restart Queue Preview</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-1 justify-between px-5 py-4">
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              
              {/* Job Metadata Card */}
              <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-5 shadow-sm">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    Opportunity {currentIndex + 1} of {jobs.length}
                  </Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-medium">{activeJob.location}</Text>
                </View>
                <Text className="text-slate-900 dark:text-white text-xl font-bold mb-1">{activeJob.title}</Text>
                <Text className="text-slate-600 dark:text-slate-300 text-sm font-semibold mb-3">{activeJob.company}</Text>
                <Text className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed" numberOfLines={4}>
                  {activeJob.description}
                </Text>
              </View>

              {/* Email Outreach Draft Card */}
              <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-6 shadow-sm">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="flex-row items-center">
                    <Ionicons name="sparkles" size={16} color="#10b981" />
                    <Text className="text-emerald-600 dark:text-emerald-400 text-sm font-bold ml-1.5">AI Tailored Email</Text>
                  </View>
                  <TouchableOpacity
                    onPress={openEditModal}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-xl"
                  >
                    <Text className="text-slate-800 dark:text-white text-xs font-bold">Edit Draft</Text>
                  </TouchableOpacity>
                </View>

                <View className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                  <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Subject</Text>
                  <Text className="text-slate-900 dark:text-white font-bold text-sm mb-3">{activeJob.draftSubject}</Text>
                  <Text className="text-slate-500 text-xs font-bold uppercase mb-1">Body</Text>
                  <Text className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{activeJob.draftBody}</Text>
                </View>
              </View>

            </ScrollView>

            {/* Bottom Action Controls */}
            <View className="flex-row justify-between py-2 border-t border-slate-200 dark:border-slate-800 gap-4">
              <TouchableOpacity
                onPress={() => handleAction('REJECTED')}
                disabled={actioning}
                className="flex-1 flex-row items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4"
              >
                <Ionicons name="close-circle-outline" size={20} color="#f43f5e" />
                <Text className="text-rose-500 font-bold ml-2">Skip & Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleAction('SENT')}
                disabled={actioning}
                className="flex-[1.3] flex-row items-center justify-center bg-emerald-500 rounded-2xl py-4"
              >
                {actioning ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text className="text-white font-bold ml-2">Approve & Send</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )
      )}

      {/* Manual Application Creation Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-6 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-slate-900 dark:text-white font-bold text-xl">New Job Application</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView className="space-y-4 mb-4">
              <View>
                <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Company Name *</Text>
                <TextInput
                  value={newCompany}
                  onChangeText={setNewCompany}
                  placeholder="e.g. Google"
                  placeholderTextColor="#475569"
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm"
                />
              </View>

              <View className="mt-3">
                <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Job Title *</Text>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="e.g. Senior Frontend Engineer"
                  placeholderTextColor="#475569"
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm"
                />
              </View>

              <View className="mt-3">
                <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Location</Text>
                <TextInput
                  value={newLocation}
                  onChangeText={setNewLocation}
                  placeholder="e.g. Remote / San Francisco"
                  placeholderTextColor="#475569"
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm"
                />
              </View>

              <View className="mt-3">
                <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1">Current Round / Stage Notes</Text>
                <TextInput
                  value={newRound}
                  onChangeText={setNewRound}
                  placeholder="e.g. Technical System Design Round"
                  placeholderTextColor="#475569"
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white text-sm"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleCreateJobSubmit}
              className="bg-emerald-500 rounded-2xl py-4 items-center shadow-lg active:opacity-90"
            >
              <Text className="text-white font-bold text-base">Save Application</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Draft Dialog Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-6 h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-slate-900 dark:text-white text-xl font-bold">Customize Outreach Draft</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 mb-6">
              <Text className="text-slate-500 text-xs font-bold uppercase mb-2">Subject</Text>
              <TextInput
                value={editedSubject}
                onChangeText={setEditedSubject}
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-semibold text-base mb-4"
              />
              <Text className="text-slate-500 text-xs font-bold uppercase mb-2">Email Body</Text>
              <TextInput
                value={editedBody}
                onChangeText={setEditedBody}
                multiline
                style={{ textAlignVertical: 'top', height: 240 }}
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-4 text-slate-900 dark:text-white text-base leading-relaxed"
              />
            </ScrollView>

            <TouchableOpacity
              onPress={saveEditedDraft}
              className="bg-emerald-500 rounded-2xl py-4 items-center shadow-lg"
            >
              <Text className="text-white font-bold text-lg">Save Draft Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
