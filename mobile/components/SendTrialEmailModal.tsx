import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { outreachService } from '../services/outreachService';
import { EmailTemplate } from '../services/templateService';

interface SendTrialEmailModalProps {
  visible: boolean;
  onClose: () => void;
  template?: EmailTemplate | null;
  subject?: string;
  body?: string;
}

export default function SendTrialEmailModal({
  visible,
  onClose,
  template,
  subject: propSubject,
  body: propBody,
}: SendTrialEmailModalProps) {
  const { user } = useAuth();
  const [recipientOption, setRecipientOption] = useState<'own' | 'custom'>('own');
  const [customEmail, setCustomEmail] = useState('');
  const [sampleRecruiterName, setSampleRecruiterName] = useState('Jane Doe');
  const [sampleCompanyName, setSampleCompanyName] = useState('Acme Corp');
  const [sampleJobRole, setSampleJobRole] = useState('Software Engineer');
  const [showSampleFields, setShowSampleFields] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const userEmail = user?.email || 'your email address';

  useEffect(() => {
    if (visible) {
      setStatus(null);
      setIsSending(false);
    }
  }, [visible]);

  if (!visible) return null;

  const targetSubject = propSubject || template?.subject || 'Application for {{jobRole}} | {{companyName}}';
  const targetIntro = template?.intro || '';
  const targetSkills = template?.skillsTemplate || '';
  const targetBodySeg = propBody || template?.body || '';
  const targetSignOff = template?.signOff || '';
  const fullBodySections = [targetIntro, targetSkills, targetBodySeg, targetSignOff].filter(Boolean).join('\n\n');
  const targetBody = fullBodySections || propBody || template?.body || '';

  const renderPreviewText = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\{\{recruiterName\}\}/g, sampleRecruiterName || 'Hiring Team')
      .replace(/\{\{hrName\}\}/g, sampleRecruiterName || 'Hiring Team')
      .replace(/\{\{companyName\}\}/g, sampleCompanyName || 'Acme Corp')
      .replace(/\{\{jobRole\}\}/g, sampleJobRole || 'Software Engineer')
      .replace(/\{\{jobTitle\}\}/g, sampleJobRole || 'Software Engineer')
      .replace(/\{\{skills\}\}/g, 'Java, React, Node.js')
      .replace(/\{\{candidateName\}\}/g, user?.name || 'Alex Candidate')
      .replace(/\{\{candidateMobile\}\}/g, user?.mobile || '+1 (555) 0199')
      .replace(/\{\{candidateEmail\}\}/g, userEmail);
  };

  const previewSubject = `[TRIAL EMAIL] ${renderPreviewText(targetSubject)}`;
  const previewBody = renderPreviewText(targetBody);

  const handleSendTrial = async () => {
    setStatus(null);

    let targetEmailAddress = '';
    if (recipientOption === 'own') {
      targetEmailAddress = userEmail;
    } else {
      if (!customEmail.trim() || !customEmail.includes('@')) {
        setStatus({ type: 'error', message: 'Please enter a valid recipient email address.' });
        return;
      }
      targetEmailAddress = customEmail.trim();
    }

    setIsSending(true);
    try {
      const res = await outreachService.sendTrialEmail({
        templateId: template?.id,
        subject: targetSubject,
        body: targetBody,
        targetEmail: targetEmailAddress,
        sampleData: {
          recruiterName: sampleRecruiterName,
          companyName: sampleCompanyName,
          jobRole: sampleJobRole,
        },
      });

      if (res.success) {
        setStatus({
          type: 'success',
          message: res.message || `Trial email sent to ${targetEmailAddress}! Check your inbox.`,
        });
      } else {
        setStatus({
          type: 'error',
          message: res.message || 'Failed to send trial email.',
        });
      }
    } catch (err: any) {
      setStatus({
        type: 'error',
        message: err.message || 'Failed to send trial email.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-slate-900/60">
        <SafeAreaView className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 max-h-[90%]">
          {/* Header */}
          <View className="px-6 py-4 flex-row justify-between items-center border-b border-slate-200 dark:border-slate-800 bg-slate-900 rounded-t-3xl">
            <View className="flex-row items-center">
              <View className="p-2 bg-indigo-500/20 rounded-xl mr-3">
                <Ionicons name="mail-unread-outline" size={20} color="#818cf8" />
              </View>
              <View>
                <Text className="text-base font-bold text-white">Send Trial Verification Email</Text>
                <Text className="text-xs text-slate-400">Preview layout & variables in real inbox</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close-circle" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView className="p-6 space-y-4">
            {/* Status Alert */}
            {status && (
              <View
                className={`p-3.5 rounded-2xl border flex-row items-start mb-4 ${
                  status.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/50'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/50'
                }`}
              >
                <Ionicons
                  name={status.type === 'success' ? 'checkmark-circle' : 'alert-circle'}
                  size={18}
                  color={status.type === 'success' ? '#10b981' : '#f59e0b'}
                  style={{ marginTop: 1, marginRight: 8 }}
                />
                <Text
                  className={`text-xs flex-1 font-semibold leading-relaxed ${
                    status.type === 'success'
                      ? 'text-emerald-800 dark:text-emerald-200'
                      : 'text-amber-800 dark:text-amber-200'
                  }`}
                >
                  {status.message}
                </Text>
              </View>
            )}

            {/* Recipient Selection */}
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Where should trial email be sent?
            </Text>

            <View className="flex-row gap-3 mb-3">
              <TouchableOpacity
                onPress={() => setRecipientOption('own')}
                activeOpacity={0.8}
                className={`flex-1 p-3 rounded-2xl border ${
                  recipientOption === 'own'
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                }`}
              >
                <Text className="text-xs font-bold text-slate-900 dark:text-white">My Email Address</Text>
                <Text className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5" numberOfLines={1}>
                  {userEmail}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRecipientOption('custom')}
                activeOpacity={0.8}
                className={`flex-1 p-3 rounded-2xl border ${
                  recipientOption === 'custom'
                    ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-600'
                    : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800'
                }`}
              >
                <Text className="text-xs font-bold text-slate-900 dark:text-white">Custom Email</Text>
                <Text className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Specify recipient ID</Text>
              </TouchableOpacity>
            </View>

            {recipientOption === 'custom' && (
              <View className="mb-4">
                <TextInput
                  placeholder="e.g. recipient@example.com"
                  placeholderTextColor="#64748b"
                  value={customEmail}
                  onChangeText={setCustomEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white font-medium"
                />
              </View>
            )}

            {/* Custom Context Fields Toggle */}
            <View className="border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 bg-slate-50 dark:bg-slate-850 mb-4">
              <TouchableOpacity
                onPress={() => setShowSampleFields(!showSampleFields)}
                className="flex-row justify-between items-center"
              >
                <View className="flex-row items-center">
                  <Ionicons name="options-outline" size={16} color="#6366f1" />
                  <Text className="text-xs font-bold text-slate-900 dark:text-white ml-2">
                    Customize Sample Context
                  </Text>
                </View>
                <Text className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                  {showSampleFields ? 'Hide' : 'Edit'}
                </Text>
              </TouchableOpacity>

              {showSampleFields && (
                <View className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <View>
                    <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Company Name
                    </Text>
                    <TextInput
                      value={sampleCompanyName}
                      onChangeText={setSampleCompanyName}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </View>
                  <View className="mt-2">
                    <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Recruiter / HR Name
                    </Text>
                    <TextInput
                      value={sampleRecruiterName}
                      onChangeText={setSampleRecruiterName}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </View>
                  <View className="mt-2">
                    <Text className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Target Job Role
                    </Text>
                    <TextInput
                      value={sampleJobRole}
                      onChangeText={setSampleJobRole}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Email Live Preview */}
            <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Rendered Email Preview
            </Text>
            <View className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-4">
              <Text className="text-xs font-bold text-indigo-400 mb-2 border-b border-slate-800 pb-2">
                Subject: {previewSubject}
              </Text>
              <Text className="text-xs text-slate-300 leading-relaxed font-mono" numberOfLines={10}>
                {previewBody}
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex-row justify-between items-center">
            <TouchableOpacity onPress={onClose} className="py-2.5 px-4">
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSendTrial}
              disabled={isSending}
              className="bg-indigo-600 py-3 px-6 rounded-2xl flex-row items-center justify-center shadow-md disabled:opacity-75"
            >
              {isSending ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
                  <Text className="text-white text-xs font-bold">Sending Trial Email...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={14} color="#fff" style={{ marginRight: 6 }} />
                  <Text className="text-white text-xs font-bold">Send Trial Email</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
