export const EMAIL_INVALID_MESSAGE = 'Ingresa un correo electrónico válido'
export const EMAIL_EXISTS_MESSAGE = 'Este correo ya está registrado'
export const PASSWORD_MIN_LENGTH = 8

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidPassword(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH
}

export interface RegistrationValidation {
  valid: boolean
  emailError: string | null
  passwordError: string | null
}

export function validateRegistration(email: string, password: string): RegistrationValidation {
  const emailError = isValidEmail(email) ? null : EMAIL_INVALID_MESSAGE
  const passwordError = isValidPassword(password) ? null : `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
  return {
    valid: emailError === null && passwordError === null,
    emailError,
    passwordError
  }
}

export function registrationErrorMessage(error: { code?: string, status?: number }): string {
  if (error.code === 'user_already_exists' || error.code === 'email_exists' || error.status === 422) {
    return EMAIL_EXISTS_MESSAGE
  }
  return 'No se pudo crear la cuenta. Inténtalo de nuevo.'
}
