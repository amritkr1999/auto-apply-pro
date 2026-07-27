/**
 * Centralized Validation Utilities for EasyNaukri
 */

// Email regex adhering to standard RFC 5322 pattern
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone number regex allowing optional +, digits, spaces, hyphens, parentheses (7 to 15 digits)
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

// HTTP / HTTPS URL regex
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

// Username regex: 3 to 30 alphanumeric characters and underscores
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

// Hex color code format: #RGB or #RRGGBB
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/**
 * Validates email address format
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") return false;
  return EMAIL_REGEX.test(email.trim());
};

/**
 * Validates phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== "string") return false;
  const digitsOnly = phone.replace(/\D/g, "");
  return PHONE_REGEX.test(phone.trim()) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

/**
 * Validates web URL format (must begin with http:// or https://)
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== "string") return false;
  return URL_REGEX.test(url.trim());
};

/**
 * Basic Password validation: minimum 8 characters, must contain at least 1 alphabet and 1 number
 */
export const isValidBasicPassword = (password: string): boolean => {
  if (!password || typeof password !== "string") return false;
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  return hasLetter && hasDigit;
};

/**
 * Validates public profile username handle
 */
export const isValidUsername = (username: string): boolean => {
  if (!username || typeof username !== "string") return false;
  return USERNAME_REGEX.test(username.trim());
};

/**
 * Validates hex color code format
 */
export const isValidHexColor = (color: string): boolean => {
  if (!color || typeof color !== "string") return false;
  return HEX_COLOR_REGEX.test(color.trim());
};

/**
 * Validates uploaded file format and size ceiling (default 5MB)
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export const validateFile = (
  file: File,
  maxSizeBytes: number = 5 * 1024 * 1024, // 5MB
  allowedExtensions: string[] = []
): FileValidationResult => {
  if (!file) {
    return { valid: false, error: "No file selected." };
  }

  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds maximum allowed limit of ${maxSizeMB} MB.`,
    };
  }

  if (allowedExtensions.length > 0) {
    const fileName = file.name.toLowerCase();
    const isExtensionAllowed = allowedExtensions.some((ext) =>
      fileName.endsWith(ext.toLowerCase())
    );
    if (!isExtensionAllowed) {
      return {
        valid: false,
        error: `Invalid file type. Allowed formats: ${allowedExtensions.join(", ")}.`,
      };
    }
  }

  return { valid: true };
};
