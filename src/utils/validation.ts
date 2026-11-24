const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Remove espaços em branco de entradas de e-mail.
 */
export function sanitizeEmail(value: string): string {
  return value.replace(/\s/g, '');
}

/**
 * Retorna mensagem de erro caso o e-mail seja vazio ou inválido, ou null se válido.
 */
export function getEmailError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Informe seu e-mail.';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Digite um e-mail válido (ex.: nome@email.com).';
  }
  return null;
}
