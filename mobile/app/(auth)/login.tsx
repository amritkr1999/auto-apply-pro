import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { biometricService } from '../../services/biometricService';
import * as WebBrowser from 'expo-web-browser';
import axios from 'axios';
import { api, API_BASE_URL } from '../../services/api';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { signIn, signUp, checkBiometrics, loginWithSession } = useAuth();

  // Mode toggles
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading and device capabilities state
  const [loading, setLoading] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  useEffect(() => {
    async function checkCapabilities() {
      const hardware = await biometricService.isHardwareAvailable();
      const enrolled = await biometricService.isEnrolled();
      setBiometricsAvailable(hardware && enrolled);
    }
    checkCapabilities();
  }, []);

  const handleForgotPassword = () => {
    Linking.openURL('http://localhost:5173/forgot-password')
      .catch(() => Alert.alert('Error', 'Unable to open browser to reset password. Please visit http://localhost:5173/forgot-password'));
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    if (isRegistering) {
      if (!name) {
        Alert.alert('Validation Error', 'Please enter your name.');
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert('Validation Error', 'Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await signUp(name, email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      console.log('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricUnlock = async () => {
    setLoading(true);
    const success = await checkBiometrics();
    setLoading(false);
    if (!success) {
      Alert.alert('Authentication Failed', 'Could not unlock using biometrics. Please use your email and password.');
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      const response = await api.get(`/auth/login/${provider}`);
      const authUrl = response.data;
      
      console.log(`[OAuth] Received auth URL for ${provider}:`, authUrl);

      const parseParams = (urlStr: string) => {
        const queryString = urlStr.split('?')[1];
        if (!queryString) return null;
        
        const params: Record<string, string> = {};
        queryString.split('&').forEach(param => {
          const [key, val] = param.split('=');
          if (key && val) {
            params[key] = decodeURIComponent(val);
          }
        });
        return params;
      };

      const completeSession = async (redirectUrl: string) => {
        const params = parseParams(redirectUrl);
        if (params && params.token) {
          const userInfo = {
            id: Number(params.id),
            email: params.email,
            name: params.name,
            role: params.role || 'CANDIDATE',
            loginStreak: params.loginStreak ? Number(params.loginStreak) : 1,
            mobile: params.mobile || '',
            isPendingDeletion: false
          };
          
          await loginWithSession(params.token, userInfo);
          Alert.alert('Success', `Logged in via ${provider === 'google' ? 'Google' : 'GitHub'} successfully.`);
        } else {
          throw new Error('Authentication failed - no token returned.');
        }
      };

      if (authUrl.includes('mock_') || authUrl.includes('localhost:8060')) {
        const baseIp = API_BASE_URL.replace('http://', '').replace('https://', '');
        const devUrl = authUrl.replace('localhost:8060', baseIp);
        
        console.log('[OAuth Dev] Making direct mock callback request to:', devUrl);
        
        const res = await axios.get(devUrl, {
          maxRedirects: 0,
          validateStatus: (status) => status >= 200 && status < 400,
        });

        let targetRedirect = res.headers.location;
        if (!targetRedirect && res.status === 200 && res.request?.responseURL) {
          targetRedirect = res.request.responseURL;
        }

        if (targetRedirect) {
          console.log('[OAuth Dev] Captured redirect path:', targetRedirect);
          await completeSession(targetRedirect);
          return;
        }
      }

      console.log('[OAuth Web] Opening auth session for:', authUrl);
      const result = await WebBrowser.openAuthSessionAsync(authUrl);
      
      if (result.type === 'success' && result.url) {
        console.log('[OAuth Web] Auth session success redirect:', result.url);
        await completeSession(result.url);
      } else if (result.type === 'cancel') {
        console.log('[OAuth Web] Auth session cancelled by user');
      }
    } catch (error: any) {
      console.error(`[OAuth Error] ${provider}:`, error);
      const errMsg = error.response?.data?.message || error.message || 'OAuth authentication failed.';
      Alert.alert('OAuth Error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0f172a', '#1e1b4b', '#020617']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView className="flex-1">
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            <View className="px-6 py-8">
              
              {/* Header Title */}
              <View className="items-center mb-8">
                <View className="w-16 h-16 bg-emerald-500 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-emerald-500/30">
                  <Ionicons name="rocket-outline" size={32} color="#fff" />
                </View>
                <Text className="text-3xl font-bold text-white tracking-wide">Auto Apply Pro</Text>
                <Text className="text-slate-400 text-sm mt-1 text-center">
                  Your AI-powered career agent & outreach automated platform.
                </Text>
              </View>

              {/* Login / Register Card */}
              <View className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                
                {/* Segmented Control Selector */}
                <View className="flex-row bg-slate-950 p-1.5 rounded-2xl mb-6 border border-slate-800/80">
                  <TouchableOpacity
                    onPress={() => {
                      setIsRegistering(false);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className={`flex-1 py-2.5 rounded-xl items-center ${
                      !isRegistering ? 'bg-slate-800 shadow-sm' : ''
                    }`}
                  >
                    <Text className={`font-semibold ${!isRegistering ? 'text-white' : 'text-slate-400'}`}>
                      Sign In
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setIsRegistering(true);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className={`flex-1 py-2.5 rounded-xl items-center ${
                      isRegistering ? 'bg-slate-800 shadow-sm' : ''
                    }`}
                  >
                    <Text className={`font-semibold ${isRegistering ? 'text-white' : 'text-slate-400'}`}>
                      Register
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Form Fields */}
                <View className="space-y-4">
                  {isRegistering && (
                    <View>
                      <Text className="text-slate-300 text-xs font-semibold mb-1.5 ml-1">NAME</Text>
                      <View className="flex-row items-center bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-3">
                        <Ionicons name="person-outline" size={20} color="#94a3b8" />
                        <TextInput
                          placeholder="Your full name"
                          placeholderTextColor="#64748b"
                          value={name}
                          onChangeText={setName}
                          className="flex-1 text-white ml-2.5 text-base"
                          autoCapitalize="words"
                        />
                      </View>
                    </View>
                  )}

                  <View className="mt-3">
                    <Text className="text-slate-300 text-xs font-semibold mb-1.5 ml-1">EMAIL ADDRESS</Text>
                    <View className="flex-row items-center bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-3">
                      <Ionicons name="mail-outline" size={20} color="#94a3b8" />
                      <TextInput
                        placeholder="you@example.com"
                        placeholderTextColor="#64748b"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="flex-1 text-white ml-2.5 text-base"
                      />
                    </View>
                  </View>

                  <View className="mt-3">
                    <Text className="text-slate-300 text-xs font-semibold mb-1.5 ml-1">PASSWORD</Text>
                    <View className="flex-row items-center bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-3">
                      <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
                      <TextInput
                        placeholder="••••••••"
                        placeholderTextColor="#64748b"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="flex-1 text-white ml-2.5 text-base"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color="#94a3b8"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {!isRegistering && (
                    <TouchableOpacity 
                      onPress={handleForgotPassword}
                      className="mt-2.5 active:opacity-75"
                      style={{ alignSelf: 'flex-end' }}
                    >
                      <Text className="text-emerald-400 text-xs font-semibold">Forgot Password?</Text>
                    </TouchableOpacity>
                  )}

                  {isRegistering && (
                    <View className="mt-3">
                      <Text className="text-slate-300 text-xs font-semibold mb-1.5 ml-1">CONFIRM PASSWORD</Text>
                      <View className="flex-row items-center bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-3">
                        <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
                        <TextInput
                          placeholder="••••••••"
                          placeholderTextColor="#64748b"
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoCorrect={false}
                          className="flex-1 text-white ml-2.5 text-base"
                        />
                      </View>
                    </View>
                  )}

                  {/* Primary Submit Button */}
                  <TouchableOpacity
                    onPress={handleAuth}
                    disabled={loading}
                    className="bg-emerald-500 rounded-2xl py-3.5 mt-6 items-center shadow-lg shadow-emerald-500/20 active:opacity-90"
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text className="text-white font-bold text-lg">
                        {isRegistering ? 'Create Account' : 'Sign In'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Social Sign In Options */}
                <View className="mt-6">
                  <View className="flex-row items-center mb-5">
                    <View className="flex-1 h-[1px] bg-slate-800" />
                    <Text className="text-slate-400 text-xs font-semibold px-3 uppercase tracking-wider">
                      Or connect with
                    </Text>
                    <View className="flex-1 h-[1px] bg-slate-800" />
                  </View>

                  <View className="flex-row space-x-3 gap-3">
                    <TouchableOpacity
                      onPress={() => handleSocialLogin('google')}
                      className="flex-1 flex-row items-center justify-center bg-slate-950 border border-slate-800 rounded-2xl py-3 active:opacity-80"
                    >
                      <FontAwesome name="google" size={18} color="#fff" />
                      <Text className="text-white font-semibold text-sm ml-2">Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleSocialLogin('github')}
                      className="flex-1 flex-row items-center justify-center bg-slate-950 border border-slate-800 rounded-2xl py-3 active:opacity-80"
                    >
                      <FontAwesome name="github" size={18} color="#fff" />
                      <Text className="text-white font-semibold text-sm ml-2">GitHub</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Biometrics quick unlock */}
                {!isRegistering && biometricsAvailable && (
                  <View className="items-center mt-6 pt-5 border-t border-slate-800/50">
                    <TouchableOpacity
                      onPress={handleBiometricUnlock}
                      className="flex-row items-center justify-center bg-slate-950 border border-slate-800/80 px-4 py-2.5 rounded-full"
                    >
                      <Ionicons name="finger-print" size={20} color="#10b981" />
                      <Text className="text-emerald-400 text-sm font-semibold ml-2">
                        Unlock with FaceID / TouchID
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

              </View>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
