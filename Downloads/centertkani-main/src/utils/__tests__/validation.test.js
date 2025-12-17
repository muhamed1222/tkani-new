import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validatePassword,
  validatePasswordConfirmation,
  validateRequired,
  validateName,
  validateFileSize,
  validateFileType,
  validateUrl,
  validateNumberRange,
  validateForm,
  hasErrors,
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('should return empty string for valid email', () => {
      expect(validateEmail('test@example.com')).toBe('');
      expect(validateEmail('user.name@domain.co.uk')).toBe('');
    });

    it('should return error for invalid email', () => {
      expect(validateEmail('invalid')).not.toBe('');
      expect(validateEmail('invalid@')).not.toBe('');
      expect(validateEmail('@domain.com')).not.toBe('');
    });

    it('should return error for empty email', () => {
      expect(validateEmail('')).not.toBe('');
      expect(validateEmail('   ')).not.toBe('');
    });
  });

  describe('validatePhone', () => {
    it('should return empty string for valid phone', () => {
      expect(validatePhone('+79991234567')).toBe('');
      expect(validatePhone('79991234567')).toBe('');
    });

    it('should return error for invalid phone length', () => {
      expect(validatePhone('123')).not.toBe('');
      expect(validatePhone('12345678901234567')).not.toBe('');
    });

    it('should return empty string for optional empty phone', () => {
      expect(validatePhone('', false)).toBe('');
    });

    it('should return error for required empty phone', () => {
      expect(validatePhone('', true)).not.toBe('');
    });
  });

  describe('validatePassword', () => {
    it('should return empty string for valid password', () => {
      expect(validatePassword('password123')).toBe('');
      expect(validatePassword('P@ssw0rd!')).toBe('');
    });

    it('should return error for empty password', () => {
      expect(validatePassword('')).not.toBe('');
    });

    it('should return error for short password', () => {
      expect(validatePassword('123')).not.toBe('');
    });
  });

  describe('validatePasswordConfirmation', () => {
    it('should return empty string when passwords match', () => {
      expect(validatePasswordConfirmation('password123', 'password123')).toBe('');
    });

    it('should return error when passwords do not match', () => {
      expect(validatePasswordConfirmation('password123', 'password456')).not.toBe('');
    });

    it('should return error for empty confirmation', () => {
      expect(validatePasswordConfirmation('password123', '')).not.toBe('');
    });
  });

  describe('validateRequired', () => {
    it('should return empty string for non-empty value', () => {
      expect(validateRequired('test')).toBe('');
      expect(validateRequired(123)).toBe('');
    });

    it('should return error for empty value', () => {
      expect(validateRequired('')).not.toBe('');
      expect(validateRequired('   ')).not.toBe('');
      expect(validateRequired(null)).not.toBe('');
    });

    it('should use custom field name in error', () => {
      const error = validateRequired('', 'Имя пользователя');
      expect(error).toContain('Имя пользователя');
    });
  });

  describe('validateName', () => {
    it('should return empty string for valid name', () => {
      expect(validateName('John')).toBe('');
      expect(validateName('Иван')).toBe('');
    });

    it('should return error for empty name', () => {
      expect(validateName('')).not.toBe('');
    });

    it('should return error for short name', () => {
      expect(validateName('A')).not.toBe('');
    });
  });

  describe('validateFileSize', () => {
    it('should return empty string for valid file size', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      expect(validateFileSize(file, 5 * 1024 * 1024)).toBe(''); // 5MB max
    });

    it('should return error for file exceeding max size', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 10 * 1024 * 1024 }); // 10MB
      expect(validateFileSize(file, 5 * 1024 * 1024)).not.toBe(''); // 5MB max
    });
  });

  describe('validateFileType', () => {
    it('should return empty string for allowed file type', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      expect(validateFileType(file, ['image/jpeg', 'image/png'])).toBe('');
    });

    it('should return error for disallowed file type', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      expect(validateFileType(file, ['image/jpeg', 'image/png'])).not.toBe('');
    });
  });

  describe('validateUrl', () => {
    it('should return empty string for valid URL', () => {
      expect(validateUrl('https://example.com')).toBe('');
      expect(validateUrl('http://example.com/path')).toBe('');
    });

    it('should return error for invalid URL', () => {
      expect(validateUrl('not-a-url')).not.toBe('');
      expect(validateUrl('example.com')).not.toBe('');
    });

    it('should return empty string for optional empty URL', () => {
      expect(validateUrl('', false)).toBe('');
    });
  });

  describe('validateNumberRange', () => {
    it('should return empty string for number in range', () => {
      expect(validateNumberRange(5, 1, 10)).toBe('');
      expect(validateNumberRange(1, 1, 10)).toBe('');
      expect(validateNumberRange(10, 1, 10)).toBe('');
    });

    it('should return error for number outside range', () => {
      expect(validateNumberRange(0, 1, 10)).not.toBe('');
      expect(validateNumberRange(11, 1, 10)).not.toBe('');
    });

    it('should return error for non-number', () => {
      expect(validateNumberRange('abc', 1, 10)).not.toBe('');
    });
  });

  describe('validateForm', () => {
    it('should return empty errors object for valid form', () => {
      const formData = {
        email: 'test@example.com',
        password: 'password123',
      };
      const validators = {
        email: (value) => validateEmail(value),
        password: (value) => validatePassword(value),
      };
      const errors = validateForm(formData, validators);
      expect(hasErrors(errors)).toBe(false);
    });

    it('should return errors object for invalid form', () => {
      const formData = {
        email: 'invalid-email',
        password: '123',
      };
      const validators = {
        email: (value) => validateEmail(value),
        password: (value) => validatePassword(value),
      };
      const errors = validateForm(formData, validators);
      expect(hasErrors(errors)).toBe(true);
      expect(errors.email).not.toBe('');
      expect(errors.password).not.toBe('');
    });
  });

  describe('hasErrors', () => {
    it('should return false for empty errors object', () => {
      expect(hasErrors({})).toBe(false);
    });

    it('should return true for errors object with errors', () => {
      expect(hasErrors({ email: 'Error' })).toBe(true);
    });
  });
});
