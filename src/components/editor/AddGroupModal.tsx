'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Group } from '@/lib/types'
import { DEFAULT_GROUP } from '@/lib/constants'

interface AddGroupModalProps {
  existingGroups: Group[]
  onAdd: (group: Group) => void
  onClose: () => void
}

export function AddGroupModal({
  existingGroups,
  onAdd,
  onClose,
}: AddGroupModalProps) {
  const t = useTranslations('editor.groups')
  const tCommon = useTranslations('buttons')

  const [name, setName] = useState('')
  const [weight, setWeight] = useState('0')
  const [parent, setParent] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmedName = name.trim().toLowerCase()

    if (!trimmedName) {
      setError(t('groupNameCannotBeEmpty'))
      return
    }

    if (!/^[a-z0-9_-]+$/.test(trimmedName)) {
      setError(t('groupNameInvalidChars'))
      return
    }

    if (existingGroups.some((g) => g.name.toLowerCase() === trimmedName)) {
      setError(t('groupAlreadyExists'))
      return
    }

    const newGroup: Group = {
      ...DEFAULT_GROUP,
      name: trimmedName,
      weight: parseInt(weight) || 0,
      parents: parent ? [parent] : [],
    }

    onAdd(newGroup)
    onClose()
  }

  return (
    <Modal isOpen onClose={onClose} title={t('createNewGroup')}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('groupName')}
          placeholder={t('groupNamePlaceholder')}
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          error={error}
          hint={t('groupNameHint')}
          autoFocus
        />

        <Input
          label={t('weight')}
          type="number"
          placeholder="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          hint={t('weightHint')}
        />

        {existingGroups.length > 0 && (
          <Select
            label={t('parentGroup')}
            placeholder={t('selectParentGroup')}
            value={parent}
            onChange={setParent}
            options={existingGroups.map((g) => ({
              value: g.name,
              label: g.displayName || g.name,
            }))}
          />
        )}

        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {tCommon('cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {t('createGroup')}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
