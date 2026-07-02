import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { feedbackService } from '../services/feedbackService';
import * as SecureStore from 'expo-secure-store';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export default function FeedbackModal({ visible, onClose, onSubmitSuccess }: FeedbackModalProps) {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setErrorMsg('Please select a rating of at least 1 star.');
      return;
    }
    if (!comment.trim()) {
      setErrorMsg('Please write a short review comment.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await feedbackService.submitFeedback(rating, comment);
      setSuccess(true);
      setTimeout(() => {
        if (onSubmitSuccess) onSubmitSuccess();
        onClose();
        // Reset state
        setRating(0);
        setComment('');
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Something went wrong. Please try again.';
      setErrorMsg(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSnooze = async () => {
    // Snooze popup for 3 days
    const snoozeTime = Date.now() + 3 * 24 * 60 * 60 * 1000;
    try {
      await SecureStore.setItemAsync('feedback_snoozed_until', snoozeTime.toString());
    } catch (e) {
      console.log('Error setting snooze in SecureStore:', e);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 justify-center items-center bg-slate-950/80 px-5">
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="w-full max-w-sm"
            >
              <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <View className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                <View className="absolute -bottom-10 -left-10 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />

                {/* Close Button */}
                <TouchableOpacity
                  onPress={onClose}
                  className="absolute top-4 right-4 text-slate-400 p-1 rounded-full bg-slate-950/40 border border-slate-800"
                >
                  <Ionicons name="close" size={20} color="#94a3b8" />
                </TouchableOpacity>

                {success ? (
                  <View className="items-center py-6">
                    <View className="w-16 h-16 bg-emerald-500/15 rounded-full items-center justify-center mb-4">
                      <Text className="text-3xl">🎉</Text>
                    </View>
                    <Text className="text-white text-xl font-bold text-center">Thank You!</Text>
                    <Text className="text-slate-400 text-sm text-center mt-2 px-2 leading-relaxed">
                      Your feedback has been submitted successfully. We appreciate your response and help in making Auto Apply Pro better!
                    </Text>
                  </View>
                ) : (
                  <View className="space-y-4">
                    {/* Header */}
                    <View className="items-center mb-2 mt-2">
                      <View className="w-10 h-10 bg-emerald-500/10 rounded-xl items-center justify-center mb-2">
                        <Ionicons name="sparkles" size={20} color="#10b981" />
                      </View>
                      <Text className="text-white text-lg font-bold text-center">Enjoying Auto Apply Pro?</Text>
                      <Text className="text-slate-400 text-xs text-center mt-1">
                        We'd love to hear your feedback! Let us know how your automated job search is going.
                      </Text>
                    </View>

                    {/* Star Selector */}
                    <View className="items-center py-2 mt-2">
                      <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Your Rating</Text>
                      <View className="flex-row gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity
                            key={star}
                            onPress={() => setRating(star)}
                            activeOpacity={0.7}
                            className="p-1"
                          >
                            <Ionicons
                              name={star <= rating ? 'star' : 'star-outline'}
                              size={32}
                              color={star <= rating ? '#fbbf24' : '#475569'}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                      {rating > 0 && (
                        <Text className="text-emerald-400 text-xs font-semibold mt-2">
                          {rating === 5 ? 'Excellent! 😍' : rating === 4 ? 'Very Good! 😊' : rating === 3 ? 'Good 🙂' : rating === 2 ? 'Fair 😐' : 'Poor 😞'}
                        </Text>
                      )}
                    </View>

                    {/* Review text field */}
                    <View className="mt-2">
                      <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1 ml-1">Review Comment</Text>
                      <TextInput
                        className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-white text-sm h-24"
                        placeholder="What has been your experience using the platform? Any suggestions for improvement?"
                        placeholderTextColor="#475569"
                        multiline
                        textAlignVertical="top"
                        value={comment}
                        onChangeText={setComment}
                        maxLength={500}
                      />
                    </View>

                    {errorMsg ? (
                      <View className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-2.5 mt-2">
                        <Text className="text-rose-400 text-xs text-center font-medium">{errorMsg}</Text>
                      </View>
                    ) : null}

                    {/* Buttons */}
                    <View className="flex-row gap-3 mt-4">
                      <TouchableOpacity
                        onPress={handleSnooze}
                        className="flex-1 border border-slate-800 bg-slate-950 rounded-2xl py-3 items-center active:bg-slate-900"
                      >
                        <Text className="text-slate-400 font-semibold text-sm">Maybe Later</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 bg-emerald-500 rounded-2xl py-3 items-center active:opacity-90 disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text className="text-white font-bold text-sm">Submit Feedback</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
