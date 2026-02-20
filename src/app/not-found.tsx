import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-hp-bg flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-hp-text mb-4">Page Not Found</h1>
        <p className="text-hp-text-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/editor"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-hp-primary hover:bg-hp-primary/90 text-white font-medium transition-colors"
        >
          Go to Editor
        </Link>
      </div>
    </div>
  )
}
