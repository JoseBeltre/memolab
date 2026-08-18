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

export const DECK_NAME_REQUIRED_MESSAGE = 'El nombre del mazo es obligatorio'
export const DECK_NAME_MAX_LENGTH = 60
export const DECK_NAME_TOO_LONG_MESSAGE = `El nombre no puede pasar de ${DECK_NAME_MAX_LENGTH} caracteres`

export function validateDeckName(name: string): string | null {
  const value = name.trim()

  if (value === '') {
    return DECK_NAME_REQUIRED_MESSAGE
  }

  if (value.length > DECK_NAME_MAX_LENGTH) {
    return DECK_NAME_TOO_LONG_MESSAGE
  }

  return null
}
