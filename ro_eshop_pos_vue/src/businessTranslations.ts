import { portugueseDemo } from './portuguese';
import { locale, languageOptions } from './i18n';
export type BusinessTranslations = Record<string, Record<string, string>>;
export function validateTranslations(value: unknown, fields: string[]): BusinessTranslations {
  if (value == null) return {};
  if (typeof value !== 'object' || Array.isArray(value)) throw new Error('翻译数据格式不正确');
  const result: BusinessTranslations = {};
  for (const [language, entries] of Object.entries(value)) {
    if (!languageOptions.some(option => option.value === language) || !entries || typeof entries !== 'object' || Array.isArray(entries)) throw new Error('翻译数据格式不正确');
    result[language] = {};
    for (const [field, text] of Object.entries(entries)) {
      if (!fields.includes(field) || typeof text !== 'string' || text.length > (field === 'description_sale' ? 5000 : 200)) throw new Error('翻译字段或长度不正确');
      result[language][field] = text;
    }
  }
  return result;
}
export function businessText(record: any, field: string): string {
  return record.translations?.[locale.value]?.[field] || (locale.value==='pt-PT' && /^de[0-9a-f]{6}-0000-4000-8000-/.test(record.uid||'') ? portugueseDemo(record[field]||'') : '') || record[field] || '';
}
