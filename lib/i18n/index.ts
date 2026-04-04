// ============================================================
// i18n — Carregador de traduções
// ============================================================
import { ptBR, type TranslationKey } from './pt-BR'
import { en } from './en'
import { es } from './es'
import { ja } from './ja'

export type Idioma = 'pt-BR' | 'en' | 'es' | 'ja'

export const idiomas: { value: Idioma; label: string; flag: string }[] = [
  { value: 'pt-BR', label: 'Português (BR)', flag: '🇧🇷' },
  { value: 'en',    label: 'English',         flag: '🇺🇸' },
  { value: 'es',    label: 'Español',         flag: '🇪🇸' },
  { value: 'ja',    label: '日本語',           flag: '🇯🇵' },
]

const traducoes: Record<Idioma, Record<TranslationKey, string>> = {
  'pt-BR': ptBR,
  en,
  es,
  ja,
}

export function t(idioma: Idioma, chave: TranslationKey): string {
  return traducoes[idioma]?.[chave] ?? traducoes['pt-BR'][chave] ?? chave
}

export { ptBR, type TranslationKey }
