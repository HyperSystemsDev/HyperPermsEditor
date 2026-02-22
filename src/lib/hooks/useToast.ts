'use client'

import { useState, useCallback } from 'react'
import type { Toast } from '@/lib/types'
import { generateId } from '@/lib/utils'

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((
    type: Toast['type'],
    title: string,
    message?: string,
    duration?: number
  ) => {
    const toast: Toast = {
      id: generateId(),
      type,
      title,
      message,
      duration: duration ?? 5000,
    }
    setToasts(prev => {
      // Deduplicate: skip if a toast with the same type + title already exists
      if (prev.some(t => t.type === type && t.title === title)) {
        return prev
      }
      return [...prev, toast]
    })
    return toast.id
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((title: string, message?: string) => {
    return addToast('success', title, message)
  }, [addToast])

  const error = useCallback((title: string, message?: string) => {
    return addToast('error', title, message, 10000)
  }, [addToast])

  const warning = useCallback((title: string, message?: string) => {
    return addToast('warning', title, message)
  }, [addToast])

  const info = useCallback((title: string, message?: string) => {
    return addToast('info', title, message)
  }, [addToast])

  return {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    warning,
    info,
  }
}
