'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Clock, ArrowLeft } from 'lucide-react'

export function SessionExpired() {
  const t = useTranslations('editor.session')

  return (
    <div className="min-h-screen bg-hp-bg flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-hp-danger/20 flex items-center justify-center">
          <Clock className="w-10 h-10 text-hp-danger" />
        </div>

        <h1 className="text-2xl font-bold text-hp-text mb-2">{t('expired')}</h1>
        <p className="text-hp-text-muted mb-8">
          {t('expiredDescription')}
        </p>

        <div className="space-y-4">
          <p className="text-sm text-hp-text-muted">
            {t.rich('toCreateNewSession', {
              command: (chunks) => <code className="text-hp-accent">{chunks}</code>
            })}
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-hp-surface-2 text-hp-text hover:bg-hp-surface border border-hp-border font-medium text-sm gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
