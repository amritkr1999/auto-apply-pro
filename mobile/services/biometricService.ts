import * as LocalAuthentication from 'expo-local-authentication';

export const biometricService = {
  /**
   * Check if biometrics hardware is available on the device
   */
  async isHardwareAvailable(): Promise<boolean> {
    return await LocalAuthentication.hasHardwareAsync();
  },

  /**
   * Check if any biometric data is enrolled on the device
   */
  async isEnrolled(): Promise<boolean> {
    return await LocalAuthentication.isEnrolledAsync();
  },

  /**
   * Get supported biometric types (e.g. FINGERPRINT, FACIAL_RECOGNITION)
   */
  async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    return await LocalAuthentication.supportedAuthenticationTypesAsync();
  },

  /**
   * Trigger the biometric authentication dialog
   * @param reason Custom message explaining why biometrics is required
   */
  async authenticate(reason: string = 'Unlock Auto Apply Pro'): Promise<boolean> {
    const hasHardware = await this.isHardwareAvailable();
    const isEnrolled = await this.isEnrolled();

    if (!hasHardware || !isEnrolled) {
      return false;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Enter Password',
      disableDeviceFallback: false,
    });

    return result.success;
  }
};
