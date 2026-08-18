import {
  DECK_NAME_MAX_LENGTH,
  DECK_NAME_REQUIRED_MESSAGE,
  DECK_NAME_TOO_LONG_MESSAGE,
  EMAIL_EXISTS_MESSAGE,
  EMAIL_INVALID_MESSAGE,
  PASSWORD_MIN_LENGTH,
  isValidEmail,
  isValidPassword,
  registrationErrorMessage,
  validateDeckName,
  validateRegistration
} from '../../app/utils/validation'

describe('HU-01 · criterio: correo con formato válido y contraseña de al menos ocho caracteres', () => {
  it('crea la cuenta y lleva a la pantalla principal (validación pasa sin errores)', () => {
    const result = validateRegistration('estudiante01@itla.edu.do', 'MemoLab2026')
    expect(result.valid).toBe(true)
    expect(result.emailError).toBeNull()
    expect(result.passwordError).toBeNull()
  })

  it('acepta contraseñas de exactamente ocho caracteres', () => {
    expect(isValidPassword('12345678')).toBe(true)
    expect(isValidEmail('estudiante@itla.edu.do')).toBe(true)
  })
})

describe('HU-01 · criterio: correo con formato inválido', () => {
  it('muestra «Ingresa un correo electrónico válido» y no deja crear la cuenta', () => {
    const result = validateRegistration('estudiante01itla', 'MemoLab2026')
    expect(result.valid).toBe(false)
    expect(result.emailError).toBe(EMAIL_INVALID_MESSAGE)
  })

  it.each([
    'sin-arroba.com',
    'sin-dominio@',
    '@sin-usuario.com',
    'espacios en blanco@itla.edu.do'
  ])('rechaza el correo mal escrito «%s»', (email) => {
    expect(isValidEmail(email)).toBe(false)
  })

  it('ignora los espacios al inicio y al final del correo', () => {
    expect(isValidEmail('  estudiante@itla.edu.do  ')).toBe(true)
  })
})

describe('HU-01 · criterio: correo que ya está registrado', () => {
  it('muestra «Este correo ya está registrado» cuando Supabase devuelve user_already_exists', () => {
    const message = registrationErrorMessage({ code: 'user_already_exists', status: 400 })
    expect(message).toBe(EMAIL_EXISTS_MESSAGE)
  })

  it('muestra «Este correo ya está registrado» cuando Supabase devuelve email_exists', () => {
    expect(registrationErrorMessage({ code: 'email_exists', status: 400 })).toBe(EMAIL_EXISTS_MESSAGE)
  })

  it('muestra «Este correo ya está registrado» ante un error 422 sin código específico', () => {
    expect(registrationErrorMessage({ status: 422 })).toBe(EMAIL_EXISTS_MESSAGE)
  })

  it('no crea una cuenta repetida: cualquier error de Supabase detiene el registro', () => {
    expect(registrationErrorMessage({ code: 'unexpected_failure', status: 500 })).toBe(
      'No se pudo crear la cuenta. Inténtalo de nuevo.'
    )
  })
})

describe('HU-01 · criterio: contraseña con menos de ocho caracteres', () => {
  it('muestra el mensaje de validación', () => {
    const result = validateRegistration('estudiante01@itla.edu.do', 'corta')
    expect(result.valid).toBe(false)
    expect(result.passwordError).toBe(`La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`)
  })

  it('deja la validación inválida para que el botón de guardar siga deshabilitado', () => {
    expect(isValidPassword('1234567')).toBe(false)
    expect(validateRegistration('estudiante01@itla.edu.do', '1234567').valid).toBe(false)
  })
})

describe('HU-03 · criterio: nombre del mazo', () => {
  it('acepta un nombre válido', () => {
    expect(validateDeckName('Programación III')).toBeNull()
  })

  it('muestra «El nombre del mazo es obligatorio» cuando queda vacío', () => {
    expect(validateDeckName('')).toBe(DECK_NAME_REQUIRED_MESSAGE)
    expect(validateDeckName('    ')).toBe(DECK_NAME_REQUIRED_MESSAGE)
  })

  it('indica el límite cuando el nombre pasa de 60 caracteres', () => {
    expect(validateDeckName('a'.repeat(61))).toBe(DECK_NAME_TOO_LONG_MESSAGE)
  })

  it('acepta un nombre de exactamente 60 caracteres', () => {
    expect(validateDeckName('a'.repeat(DECK_NAME_MAX_LENGTH))).toBeNull()
  })
})
