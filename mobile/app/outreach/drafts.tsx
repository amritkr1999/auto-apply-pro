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
import { useAuth } from '../../context/AuthContext';
import { outreachService, OutreachDraft } from '../../services/outreachService';

export default function OutreachDraftsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<OutreachDraft[]>([]);
  const [actioningId, setActioningId] = useState<number | null>(null);

  // Edit Modal State
  const [selectedDraft, setSelectedDraft] = useState<OutreachDraft | null>(null);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');

  useEffect(() => {
    fetchDrafts();
  }, [user?.id]);

  const fetchDrafts = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await outreachService.getDrafts(Number(user.id));
      setDrafts(data);
    } catch (err) {
      console.log('Error fetching drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (draftId: number) => {
    setActioningId(draftId);
    try {
      await outreachService.approveDraft(draftId);
      setDrafts(prev => prev.filter(d => d.id !== draftId));
      Alert.alert('Approved & Dispatched', 'Email has been queued for delivery!');
    } catch (err) {
      Alert.alert('Error', 'Failed to dispatch email draft.');
    } finally {
      setActioningId(null);
    }
  };

  const handleReject = async (draftId: number) => {
    setActioningId(draftId);
    try {
      await outreachService.rejectDraft(draftId);
      setDrafts(prev => prev.filter(d => d.id !== draftId));
    } catch (err) {
      console.log('Reject error:', err);
    } finally {
      setActioningId(null);
    }
  };

  const openEditModal = (draft: OutreachDraft) => {
    setSelectedDraft(draft);
    setEditSubject(draft.subject);
    setEditBody(draft.body);
  };

  const handleSaveEdit = () => {
    if (!selectedDraft) return;
    setDrafts(prev =>
      prev.map(d => (d.id === selectedDraft.id ? { ...d, subject: editSubject, body: editBody } : d))
    );
    setSelectedDraft(null);
    Alert.alert('Updated', 'Draft saved locally.');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <View className="px-5 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="#64748b" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-slate-900 dark:text-white font-bold text-lg">AI Cold Email Drafts</Text>
          <Text className="text-slate-500 dark:text-slate-400 text-xs">Review & Approve Generated Emails</Text>
        </View>
        <TouchableOpacity onPress={fetchDrafts} className="p-2">
          <Ionicons name="refresh" size={20} color="#10b981" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} className="flex-1">
        {loading ? (
          <View className="py-20 items-center justify-center">
            <ActivityIndicator size="large" color="#10b981" />
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-3">Fetching draft emails...</Text>
          </View>
        ) : drafts.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Ionicons name="mail-open-outline" size={48} color="#94a3b8" />
            <Text className="text-slate-900 dark:text-white font-bold text-base mt-4">No Drafts Pending</Text>
            <Text className="text-slate-500 dark:text-slate-400 text-xs mt-1 text-center px-10">
              All AI generated cold emails have been reviewed or dispatched to the delivery queue.
            </Text>
          </View>
        ) : (
          drafts.map((draft) => (
            <View
              key={draft.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-5 shadow-sm"
            >
              {/* Recipient info */}
              <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <View className="flex-1 pr-2">
                  <Text className="text-slate-900 dark:text-white font-bold text-sm">
                    {draft.recipientName} ({draft.companyName})
                  </Text>
                  <Text className="text-slate-500 dark:text-slate-400 text-xs">{draft.recipientEmail}</Text>
                </View>
                <View className="bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  <Text className="text-indigo-500 text-[10px] font-bold">AI Drafted</Text>
                </View>
              </View>

              {/* Subject */}
              <Text className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase mb-1">Subject</Text>
              <Text className="text-slate-900 dark:text-white font-bold text-sm mb-3">{draft.subject}</Text>

              {/* Body preview */}
              <Text className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase mb-1">Body Preview</Text>
              <View className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4">
                <Text className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed" numberOfLines={5}>
                  {draft.body}
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => openEditModal(draft)}
                  className="p-3 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl items-center justify-center"
                >
                  <Ionicons name="create-outline" size={18} color="#64748b" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleReject(draft.id)}
                  disabled={actioningId === draft.id}
                  className="flex-1 py-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl items-center justify-center"
                >
                  <Text className="text-rose-500 font-bold text-xs">Dismiss</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleApprove(draft.id)}
                  disabled={actioningId === draft.id}
                  className="flex-1 py-3 bg-emerald-500 rounded-2xl items-center justify-center flex-row"
                >
                  {actioningId === draft.id ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="paper-plane-outline" size={16} color="#fff" />
                      <Text className="text-white font-bold text-xs ml-1">Approve & Send</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Edit Draft Modal */}
      <Modal visible={Boolean(selectedDraft)} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-900 dark:text-white font-bold text-lg">Edit Email Content</Text>
              <TouchableOpacity onPress={() => setSelectedDraft(null)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1 ml-1">SUBJECT LINE</Text>
              <TextInput
                value={editSubject}
                onChangeText={setEditSubject}
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-slate-900 dark:text-white text-sm mb-4"
              />

              <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1 ml-1">EMAIL BODY</Text>
              <TextInput
                value={editBody}
                onChangeText={setEditBody}
                multiline
                numberOfLines={8}
                style={{ textAlignVertical: 'top', height: 160 }}
                className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-slate-900 dark:text-white text-xs leading-relaxed mb-6"
              />

              <TouchableOpacity onPress={handleSaveEdit} className="bg-emerald-500 py-3.5 rounded-2xl items-center">
                <Text className="text-white font-bold text-sm">Save Changes</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
