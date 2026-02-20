'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { Menu, X, Edit3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'

export function Navbar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations('nav')

  const navLinks = [
    { href: '/editor', label: t('editor'), icon: Edit3 },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-hp-border bg-hp-bg/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/editor"
            className="flex items-center gap-2"
          >
            <Image
              src="/logo.webp"
              alt="HyperPerms"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-hp-text">
              Hyper<span className="text-transparent bg-clip-text bg-gradient-to-r from-hp-primary to-hp-secondary">Perms</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  'after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-hp-primary after:rounded-full after:transition-transform after:duration-200 after:origin-left',
                  pathname === link.href || pathname.startsWith(link.href)
                    ? 'bg-hp-surface-2 text-hp-text after:scale-x-100'
                    : 'text-hp-text-muted hover:text-hp-text hover:bg-hp-surface after:scale-x-0 hover:after:scale-x-100'
                )}
              >
                {link.icon && <link.icon className="w-4 h-4" />}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <button
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav-menu"
              className="p-2 text-hp-text-muted hover:text-hp-text"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-nav-menu" className="md:hidden py-4 border-t border-hp-border">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href || pathname.startsWith(link.href)
                      ? 'bg-hp-surface-2 text-hp-text'
                      : 'text-hp-text-muted hover:text-hp-text hover:bg-hp-surface'
                  )}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
