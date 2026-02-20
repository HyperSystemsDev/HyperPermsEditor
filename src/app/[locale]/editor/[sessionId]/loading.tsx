import { SkeletonCard } from '@/components/ui/Skeleton'

export default function EditorLoading() {
  return (
    <div className="flex flex-col h-screen bg-hp-bg">
      {/* Header skeleton */}
      <div className="h-14 border-b border-hp-border bg-hp-surface animate-pulse" />

      {/* Tabs skeleton */}
      <div className="h-12 border-b border-hp-border bg-hp-surface animate-pulse" />

      {/* Content skeleton */}
      <div className="flex-1 flex">
        <div className="w-72 border-r border-hp-border p-4">
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
        <div className="flex-1 p-6">
          <SkeletonCard className="h-full" />
        </div>
      </div>
    </div>
  )
}
