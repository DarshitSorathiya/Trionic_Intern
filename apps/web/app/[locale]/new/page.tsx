'use client'

import React, { useState } from 'react'
import { Link } from '@/i18n/routing'
import type { DocumentType, SupportedLanguage } from '@trionic/shared'
import { LanguagePicker } from '@/components/intake/LanguagePicker'
import { StreamingIndicator } from '@/components/intake/StreamingIndicator'
import { ArrowLeft, Scale, FileText, Landmark } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function NewDraftPage() {
  const t = useTranslations('intake')
  const tCommon = useTranslations('common')

  const [docType, setDocType] = useState<DocumentType>('rti_application')
  const [intakeText, setIntakeText] = useState('')
  const [language, setLanguage] = useState<SupportedLanguage>('en')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // SSE streaming lifecycle trigger states
  const [isStreaming, setIsStreaming] = useState(false)
  const [documentId, setDocumentId] = useState<string | null>(null)

  const DOC_TYPES = [
    {
      value: 'rti_application',
      label: t('docTypeOptionRti'),
      description: t('docTypeOptionRtiDesc'),
      icon: <FileText className="size-5 text-emerald-500" />,
    },
    {
      value: 'legal_notice',
      label: t('docTypeOptionNotice'),
      description: t('docTypeOptionNoticeDesc'),
      icon: <Scale className="size-5 text-blue-500" />,
    },
    {
      value: 'cheque_bounce_notice',
      label: t('docTypeOptionCheque'),
      description: t('docTypeOptionChequeDesc'),
      icon: <Landmark className="size-5 text-orange-500" />,
    },
  ] as const

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!intakeText.trim()) {
      setError(t('situationPlaceholder'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doc_type: docType,
          language,
          intake_text: intakeText,
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || 'Failed to initialize document draft.')
      }

      const { document_id } = await response.json()
      setDocumentId(document_id)
      setIsStreaming(true)
    } catch (err: unknown) {
      console.error(err)
      const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.'
      setError(message)
      setLoading(false)
    }
  }

  function handleCancelStream() {
    setIsStreaming(false)
    setLoading(false)
    setDocumentId(null)
  }

  if (isStreaming && documentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
        <StreamingIndicator
          documentId={documentId}
          intakeText={intakeText}
          targetLanguage={language}
          docType={docType}
          onCancel={handleCancelStream}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 font-sans pb-16">
      {/* Top Navbar */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-900 transition-colors text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-400 rounded-lg p-1"
          >
            <ArrowLeft className="size-4" />
            {t('backButton')}
          </Link>
          <div className="h-4 w-px bg-zinc-200" />
          <h1 className="text-base font-bold text-zinc-900">{t('title')}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Header Info */}
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">{t('title')}</h2>
              <p className="text-sm text-zinc-500 mt-1">
                {t('situationPlaceholder')}
              </p>
            </div>

            {/* Document Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-zinc-800">
                {t('docTypeQuestion')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {DOC_TYPES.map((type) => {
                  const isSelected = docType === type.value
                  return (
                    <label
                      key={type.value}
                      className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-zinc-900 bg-zinc-950 text-white shadow-sm ring-1 ring-zinc-900'
                          : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="docType"
                        value={type.value}
                        checked={isSelected}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onChange={() => setDocType(type.value as any as DocumentType)}
                        className="sr-only"
                      />
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-zinc-850' : 'bg-zinc-100'}`}>
                        {type.icon}
                      </div>
                      <div>
                        <span className="font-semibold text-sm block">{type.label}</span>
                        <span className={`text-xs block mt-0.5 leading-relaxed ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          {type.description}
                        </span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Situation Textarea */}
            <div className="space-y-2">
              <label htmlFor="intake-text" className="block text-sm font-semibold text-zinc-850">
                {t('situationQuestion')}
              </label>
              <textarea
                id="intake-text"
                rows={6}
                value={intakeText}
                onChange={(e) => setIntakeText(e.target.value)}
                className="w-full border border-zinc-200 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:border-transparent leading-relaxed placeholder:text-zinc-400 bg-white shadow-inner"
                placeholder={t('situationPlaceholder')}
              />
            </div>

            {/* Language Selector */}
            <LanguagePicker value={language} onChange={setLanguage} />

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-medium flex gap-2 items-center">
                <span className="inline-block size-1.5 rounded-full bg-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Action */}
            <div className="flex justify-end border-t border-zinc-100 pt-6">
              <button
                type="submit"
                disabled={loading || !intakeText.trim()}
                className="px-8 py-3 bg-zinc-900 hover:bg-zinc-850 text-white font-semibold rounded-2xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.01]"
                id="btn-generate-draft"
              >
                {loading ? t('loading') : t('submitButton')}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Persistent Disclaimer */}
      <footer className="max-w-4xl mx-auto px-4 mt-8 text-center">
        <p className="text-xs text-zinc-400">
          ⚠ {tCommon('disclaimer')}
        </p>
      </footer>
    </div>
  )
}

