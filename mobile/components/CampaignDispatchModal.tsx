import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  Switch,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { outreachService } from '../services/outreachService';

interface CampaignDispatchModalProps {
  visible: boolean;
  onClose: () => void;
  onLaunchAutomated: (selectedMode: string) => Promise<void>;
  userId: number;
}

export const CampaignDispatchModal: React.FC<CampaignDispatchModalProps> = ({
  visible,
  onClose,
  onLaunchAutomated,
  userId,
}) => {
  const [selectedMode, setSelectedMode] = useState<'AUTOMATED' | 'DRAFTS' | 'WEB_COMPOSE'>('AUTOMATED');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [gmailConnected, setGmailConnected] = useState(true);
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);

  // Daily Digest States
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [digestTime, setDigestTime] = useState('20:00');
  const [isTestingDigest, setIsTestingDigest] = useState(false);
  const [digestStatusMsg, setDigestStatusMsg] = useState('');

  // Normalize mode string
  const getNormalizedMode = (rawMode?: string | null): 'AUTOMATED' | 'DRAFTS' | 'WEB_COMPOSE' => {
    if (!rawMode) return 'AUTOMATED';
    if (rawMode === 'WEB_COMPOSE' || rawMode === 'GMAIL_COMPOSE' || rawMode === 'mode3') return 'WEB_COMPOSE';
    return 'AUTOMATED';
  };

  useEffect(() => {
    if (!visible) return;

    const loadModeSettings = async () => {
      try {
        const savedLocal = await SecureStore.getItemAsync(`campaign_dispatch_mode_${userId}`);
        if (savedLocal) {
          setSelectedMode(getNormalizedMode(savedLocal));
        }

        const settings = await outreachService.getOutreachSettings(userId);
        if (settings && settings.hrOutreachDispatchMode) {
          const dbNormalized = getNormalizedMode(settings.hrOutreachDispatchMode);
          if (!savedLocal) {
            setSelectedMode(dbNormalized);
          }
        }
      } catch (err) {
        console.log('[CampaignDispatchModal] Load mode settings warning:', err);
      }
    };

    const loadDigestPref = async () => {
      try {
        const pref = await outreachService.getDigestPreferences();
        if (pref) {
          setDigestEnabled(pref.dailyDigestEnabled);
          if (pref.dailyDigestTime) setDigestTime(pref.dailyDigestTime);
        }
      } catch (err) {
        console.log('[CampaignDispatchModal] Load digest pref warning:', err);
      }
    };

    loadModeSettings();
    loadDigestPref();
  }, [visible, userId]);

  const handleToggleDigest = async (val: boolean) => {
    setDigestEnabled(val);
    try {
      await outreachService.updateDigestPreferences({ dailyDigestEnabled: val, dailyDigestTime: digestTime });
      setDigestStatusMsg(val ? 'Daily EOD Digest enabled' : 'Daily EOD Digest disabled');
    } catch (err) {
      console.log('Failed to update digest pref:', err);
    }
  };

  const handleSaveDigestTime = async (timeVal: string) => {
    setDigestTime(timeVal);
    try {
      await outreachService.updateDigestPreferences({ dailyDigestEnabled: digestEnabled, dailyDigestTime: timeVal });
    } catch (err) {
      console.log('Failed to save digest time:', err);
    }
  };

  const handleSendTestDigest = async () => {
    setIsTestingDigest(true);
    setDigestStatusMsg('');
    try {
      const res = await outreachService.sendTestDigest();
      setDigestStatusMsg(res.message || 'Test digest email sent successfully!');
    } catch (err: any) {
      setDigestStatusMsg(err.message || 'Failed to send test digest email.');
    } finally {
      setIsTestingDigest(false);
    }
  };

  if (!visible) return null;

  const handleModeSelect = async (modeKey: 'AUTOMATED' | 'DRAFTS' | 'WEB_COMPOSE') => {
    if (modeKey === 'DRAFTS') return; // Option 2 is disabled / Coming Soon
    if (modeKey === 'AUTOMATED' && !gmailConnected) {
      setShowConnectPrompt(true);
    } else {
      setShowConnectPrompt(false);
    }
    setSelectedMode(modeKey);
    await SecureStore.setItemAsync(`campaign_dispatch_mode_${userId}`, modeKey);

    let dbMode = 'DIRECT_SEND';
    if (modeKey === 'WEB_COMPOSE') dbMode = 'GMAIL_COMPOSE';

    outreachService.saveOutreachSettings(userId, { hrOutreachDispatchMode: dbMode }).catch(() => {});
  };

  const handleStartCampaign = async () => {
    if (isSubmitting) return;

    if (selectedMode === 'AUTOMATED' && !gmailConnected) {
      setShowConnectPrompt(true);
      return;
    }

    setIsSubmitting(true);

    let dbMode = 'DIRECT_SEND';
    let confirmationText = 'Campaign started! Emails will be sent automatically according to schedule.';

    if (selectedMode === 'WEB_COMPOSE') {
      dbMode = 'GMAIL_COMPOSE';
      confirmationText = 'Campaign started! Generated emails are added to your Outreach Queue for manual review & Web Compose.';
    }

    await SecureStore.setItemAsync(`campaign_dispatch_mode_${userId}`, selectedMode);

    try {
      await outreachService.saveOutreachSettings(userId, {
        hrOutreachDispatchMode: dbMode,
        hrOutreachCampaignEnabled: true,
      });
    } catch (e) {
      console.log('Save outreach settings handled:', e);
    }

    try {
      await onLaunchAutomated(selectedMode);
    } catch (e) {
      console.log('Launch campaign handler handled:', e);
    }

    setToastMessage(confirmationText);
    setTimeout(() => {
      setToastMessage('');
      setIsSubmitting(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-slate-900/60">
        <SafeAreaView className="bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 max-h-[85%]">
          
          {/* Header */}
          <View className="px-6 py-4 flex-row justify-between items-center border-b border-slate-200 dark:border-slate-800 bg-slate-900 rounded-t-3xl">
            <View>
              <Text className="text-base font-bold text-white">Campaign Launch & Dispatch Settings</Text>
              <Text className="text-xs text-slate-400">Select how your outreach campaign emails should be dispatched</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close-circle" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView className="p-6 space-y-4">
            
            {/* Toast Banner */}
            {toastMessage !== '' && (
              <View className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3.5 rounded-2xl mb-4 flex-row items-center">
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text className="text-xs font-semibold text-emerald-800 dark:text-emerald-200 ml-2 flex-1">
                  {toastMessage}
                </Text>
              </View>
            )}

            {/* Graceful Gmail Connection Prompt Banner */}
            {showConnectPrompt && !gmailConnected && (
              <View className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 p-4 rounded-2xl mb-4 space-y-2">
                <View className="flex-row items-center">
                  <Ionicons name="warning-outline" size={18} color="#d97706" />
                  <Text className="text-sm font-bold text-amber-900 dark:text-amber-200 ml-2">
                    Gmail Account Connection Required
                  </Text>
                </View>
                <Text className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Option 1 (Fully Automated) requires a connected Gmail account. Please connect Gmail in Profile Settings or switch to Option 3.
                </Text>
                <TouchableOpacity
                  onPress={() => handleModeSelect('WEB_COMPOSE')}
                  className="bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 p-2.5 rounded-xl items-center mt-2"
                >
                  <Text className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Switch to Option 3 (No Connection Needed)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Choose Campaign Dispatch Mode
            </Text>

            {/* Option 1 */}
            <TouchableOpacity
              onPress={() => handleModeSelect('AUTOMATED')}
              activeOpacity={0.8}
              className={`p-4 rounded-2xl border mb-3 flex-row items-start ${
                selectedMode === 'AUTOMATED'
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-600'
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Ionicons
                name={selectedMode === 'AUTOMATED' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selectedMode === 'AUTOMATED' ? '#4f46e5' : '#94a3b8'}
                style={{ marginTop: 2, marginRight: 10 }}
              />
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-sm font-bold text-slate-900 dark:text-white">
                    🤖 Option 1: Fully Automated
                  </Text>
                  <View className="bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
                      Requires Gmail Connection
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Emails are sent automatically on your behalf by our background outreach worker according to schedule.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Option 2 */}
            <View
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 opacity-50 mb-3 flex-row items-start"
            >
              <Ionicons
                name="radio-button-off"
                size={20}
                color="#cbd5e1"
                style={{ marginTop: 2, marginRight: 10 }}
              />
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    📁 Option 2: Save to Gmail Drafts
                  </Text>
                  <View className="bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700/50 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300">
                      Coming Soon ⏳
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                  Campaign emails will save directly into your connected Gmail account's Drafts folder automatically. (Coming Soon).
                </Text>
              </View>
            </View>

            {/* Option 3 */}
            <TouchableOpacity
              onPress={() => handleModeSelect('WEB_COMPOSE')}
              activeOpacity={0.8}
              className={`p-4 rounded-2xl border mb-4 flex-row items-start ${
                selectedMode === 'WEB_COMPOSE'
                  ? 'bg-indigo-50/60 dark:bg-indigo-950/40 border-indigo-600'
                  : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Ionicons
                name={selectedMode === 'WEB_COMPOSE' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={selectedMode === 'WEB_COMPOSE' ? '#4f46e5' : '#94a3b8'}
                style={{ marginTop: 2, marginRight: 10 }}
              />
              <View className="flex-1">
                <View className="flex-row justify-between items-center mb-1">
                  <Text className="text-sm font-bold text-slate-900 dark:text-white">
                    🌐 Option 3: Gmail Web Compose
                  </Text>
                  <View className="bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                    <Text className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                      No Gmail Connection Required
                    </Text>
                  </View>
                </View>
                <Text className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Campaign emails land in your Outreach Queue for in-app review and 1-tap launch in Gmail Web Compose.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Daily EOD Digest Settings Section */}
            <View className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Text className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Daily EOD Digest Preferences
              </Text>

              <View className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-bold text-slate-900 dark:text-white">
                      📧 Daily Summary Email
                    </Text>
                    <Text className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Receive an automated daily EOD report summarizing emails sent & candidate stats.
                    </Text>
                  </View>
                  <Switch
                    value={digestEnabled}
                    onValueChange={handleToggleDigest}
                    trackColor={{ false: '#64748b', true: '#10b981' }}
                    thumbColor="#ffffff"
                  />
                </View>

                {digestEnabled && (
                  <View className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 space-y-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Digest Schedule Time (24h)
                      </Text>
                      <TextInput
                        value={digestTime}
                        onChangeText={handleSaveDigestTime}
                        placeholder="20:00"
                        placeholderTextColor="#64748b"
                        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono text-center w-20"
                      />
                    </View>

                    <TouchableOpacity
                      onPress={handleSendTestDigest}
                      disabled={isTestingDigest}
                      className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl items-center flex-row justify-center active:opacity-80"
                    >
                      {isTestingDigest ? (
                        <ActivityIndicator size="small" color="#10b981" />
                      ) : (
                        <>
                          <Ionicons name="paper-plane-outline" size={14} color="#10b981" />
                          <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-bold ml-1.5">
                            Send Test Digest Email
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {digestStatusMsg !== '' && (
                  <Text className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 text-center mt-1">
                    {digestStatusMsg}
                  </Text>
                )}
              </View>
            </View>

          </ScrollView>

          {/* Footer Button */}
          <View className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex-row justify-between items-center">
            <TouchableOpacity onPress={onClose} className="py-2.5 px-4">
              <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleStartCampaign}
              disabled={isSubmitting}
              className="bg-indigo-600 py-3 px-6 rounded-2xl flex-row items-center justify-center shadow-md disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
                  <Text className="text-white text-xs font-bold">Launching Campaign...</Text>
                </>
              ) : (
                <Text className="text-white text-xs font-bold">🚀 Start Campaign</Text>
              )}
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default CampaignDispatchModal;
