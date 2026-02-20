'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import type { Node } from '@/lib/types'
import { getPermissionString } from '@/lib/utils'
import { PermissionRow } from './PermissionRow'
import { Input } from '@/components/ui/Input'

interface PermissionListProps {
  permissions: Node[]
  inheritedPermissions?: Array<Node & { source: string }>
  onToggle: (permission: string) => void
  onRemove: (permission: string) => void
}

export function PermissionList({
  permissions,
  inheritedPermissions = [],
  onToggle,
  onRemove,
}: PermissionListProps) {
  const t = useTranslations('editor.permissions')
  const [search, setSearch] = useState('')

  const filteredOwn = permissions.filter((p) => {
    const perm = getPermissionString(p)
    return perm.toLowerCase().includes(search.toLowerCase())
  })

  const filteredInherited = inheritedPermissions.filter((p) => {
    const perm = getPermissionString(p)
    return (
      perm.toLowerCase().includes(search.toLowerCase()) &&
      !permissions.some((own) => getPermissionString(own) === perm)
    )
  })

  const hasPermissions = permissions.length > 0 || inheritedPermissions.length > 0

  return (
    <div className="space-y-4">
      {hasPermissions && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hp-text-muted" />
          <Input
            placeholder={t('filterPermissions')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      <div className="space-y-2">
        {filteredOwn.length === 0 && filteredInherited.length === 0 ? (
          <div className="text-center py-8">
            {search ? (
              <p className="text-sm text-hp-text-muted">{t('noPermissionsMatchSearch')}</p>
            ) : inheritedPermissions.length > 0 ? (
              <div>
                <p className="text-sm text-hp-text-muted">{t('noDirectPermissionsSet')}</p>
                <p className="text-xs text-hp-text-muted mt-1">
                  {t('inheritsFromParents')}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-hp-text-muted">{t('noPermissionsYet')}</p>
                <p className="text-xs text-hp-text-muted mt-1">
                  {t('addPermissionsOrParents')}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Own permissions */}
            {filteredOwn.map((node) => (
              <PermissionRow
                key={node.permission}
                node={node}
                onToggle={onToggle}
                onRemove={onRemove}
              />
            ))}

            {/* Inherited permissions */}
            {filteredInherited.length > 0 && (
              <>
                {filteredOwn.length > 0 && (
                  <div className="border-t border-hp-border my-4" />
                )}
                <p className="text-xs text-hp-text-muted uppercase tracking-wider px-2 mb-2">
                  {t('inheritedPermissions')}
                </p>
                {filteredInherited.map((node) => (
                  <PermissionRow
                    key={`${node.source}-${node.permission}`}
                    node={node}
                    onToggle={onToggle}
                    onRemove={onRemove}
                    inherited
                    source={node.source}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
