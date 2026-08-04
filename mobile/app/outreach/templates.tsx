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
import { templateService, EmailTemplate } from '../../services/templateService';
import SendTrialEmailModal from '../../components/SendTrialEmailModal';

export default function TemplatesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);

  // Trial Email Modal State
  const [trialModalVisible, setTrialModalVisible] = useState(false);
  const [selectedTrialTemplate, setSelectedTrialTemplate] = useState<EmailTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await templateService.getTemplates(Number(user?.id || 1));
      setTemplates(data);
    } catch (e) {
      console.log('Error loading templates:', e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setName('');
    setSubject('');
    setBody('');
    setModalVisible(true);
  };

  const openEditModal = (t: EmailTemplate) => {
    setEditingTemplate(t);
    setName(t.name);
    setSubject(t.subject);
    setBody(t.body);
    setModalVisible(true);
  };

  const insertVariable = (variableTag: string) => {
    setBody(prev => prev + ` {{${variableTag}}}`);
  };

  const handleSave = async () => {
    if (!name.trim() || !subject.trim() || !body.trim()) {
      Alert.alert('Validation Error', 'Template Name, Subject, and Body are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingTemplate?.id) {
        const updated = await templateService.updateTemplate(editingTemplate.id, {
          name,
          subject,
          body,
        });
        setTemplates(prev => prev.map(t => (t.id === editingTemplate.id ? updated : t)));
        Alert.alert('Saved', 'Email template updated!');
      } else {
        const created = await templateService.createTemplate(Number(user?.id || 1), {
          name,
          subject,
          body,
        });
        setTemplates(prev => [created, ...prev]);
        Alert.alert('Created', 'New email template created!');
      }
      setModalVisible(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to save template.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this template?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await templateService.deleteTemplate(id);
          setTemplates(prev => prev.filter(t => t.id !== id));
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      
      {/* Header Bar */}
      <View className="flex-row justify-between items-center px-5 py-4 border-b border-slate-200 dark:border-slate-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="#64748b" />
          </TouchableOpacity>
          <Text className="text-slate-900 dark:text-white font-bold text-lg">Outreach Templates</Text>
        </View>
        <TouchableOpacity
          onPress={openCreateModal}
          className="bg-emerald-500 rounded-xl px-3.5 py-2 flex-row items-center active:opacity-90"
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text className="text-white font-bold text-xs ml-1">New Template</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {templates.map((template) => (
            <View
              key={template.id || template.name}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 mb-4 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center mb-1">
                    <Text className="text-slate-900 dark:text-white font-bold text-base">{template.name}</Text>
                    {template.isDefault && (
                      <View className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full ml-2">
                        <Text className="text-emerald-500 text-[10px] font-bold uppercase">Default</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-semibold" numberOfLines={1}>
                    Subject: {template.subject}
                  </Text>
                </View>

                <View className="flex-row items-center space-x-2">
                  <TouchableOpacity onPress={() => openEditModal(template)} className="p-1">
                    <Ionicons name="create-outline" size={20} color="#10b981" />
                  </TouchableOpacity>
                  {!template.isDefault && (
                    <TouchableOpacity onPress={() => handleDelete(template.id)} className="p-1">
                      <Ionicons name="trash-outline" size={20} color="#f43f5e" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 mt-2">
                <Text className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed" numberOfLines={4}>
                  {template.body}
                </Text>
              </View>

              <View className="flex-row justify-end mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <TouchableOpacity
                  onPress={() => {
                    setSelectedTrialTemplate(template);
                    setTrialModalVisible(true);
                  }}
                  className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl flex-row items-center active:opacity-80"
                >
                  <Ionicons name="paper-plane-outline" size={14} color="#6366f1" />
                  <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-bold ml-1.5">
                    Send Trial Email
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Trial Email Modal */}
      <SendTrialEmailModal
        visible={trialModalVisible}
        onClose={() => {
          setTrialModalVisible(false);
          setSelectedTrialTemplate(null);
        }}
        template={selectedTrialTemplate}
      />

      {/* Template Edit / Create Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 p-6 h-[85%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-900 dark:text-white text-xl font-bold">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 mb-4 space-y-4">
              <View>
                <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1.5 ml-1">Template Title</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Hiring Manager Direct Intro"
                  placeholderTextColor="#475569"
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-semibold text-sm"
                />
              </View>

              <View className="mt-3">
                <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-1.5 ml-1">Subject Header</Text>
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="e.g. {{candidateName}} | Application for {{jobTitle}}"
                  placeholderTextColor="#475569"
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-semibold text-sm"
                />
              </View>

              <View className="mt-3">
                <View className="flex-row justify-between items-center mb-1.5 ml-1">
                  <Text className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Template Body</Text>
                  <Text className="text-emerald-500 text-[11px] font-bold">Insert Placeholders:</Text>
                </View>

                {/* Placeholders Quick Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-2 gap-2">
                  {['candidateName', 'companyName', 'jobTitle', 'skills'].map((tag) => (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => insertVariable(tag)}
                      className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1 mr-1.5"
                    >
                      <Text className="text-emerald-500 text-[11px] font-bold">{`{{${tag}}}`}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TextInput
                  value={body}
                  onChangeText={setBody}
                  multiline
                  numberOfLines={10}
                  style={{ textAlignVertical: 'top', height: 180 }}
                  placeholder="Write body text with placeholders..."
                  placeholderTextColor="#475569"
                  className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-4 text-slate-900 dark:text-white text-sm leading-relaxed"
                />
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              className="bg-emerald-500 rounded-2xl py-4 items-center shadow-lg active:opacity-90"
            >
              {saving ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-base">Save Template</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
