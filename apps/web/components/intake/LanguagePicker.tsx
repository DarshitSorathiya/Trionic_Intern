'use client'

import React from 'react'
import type { SupportedLanguage } from '@trionic/shared'

const LANGUAGES: { value: SupportedLanguage; label: string; nativeLabel: string; flag: string }[] = [
  { value: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { value: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { value: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી', flag: '🇮🇳' },
  { value: 'mr', label: 'Marathi', nativeLabel: 'मराठी', flag: '🇮🇳' },
  { value: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', flag: '🇮🇳' },
]

interface LanguagePickerProps {
  value: SupportedLanguage
  onChange: (value: SupportedLanguage) => void
}

import { useTranslations } from 'next-intl'

export function LanguagePicker({ value, onChange }: LanguagePickerProps) {
  const t = useTranslations('intake')

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-zinc-800">
        {t('languageQuestion')}
      </label>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {LANGUAGES.map((lang) => {
          const isSelected = value === lang.value
          return (
            <button
              key={lang.value}
              type="button"
              onClick={() => onChange(lang.value)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-950 ${
                isSelected
                  ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm scale-[1.02]'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
              }`}
              id={`lang-picker-${lang.value}`}
              aria-pressed={isSelected}
            >
              <span className="text-xl mb-1">{lang.flag}</span>
              <span className="font-medium text-xs sm:text-sm">{lang.nativeLabel}</span>
              <span className={`text-[10px] sm:text-xs opacity-75 mt-0.5 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                {lang.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
