'use client'

import { useEffect } from 'react'
import { initSmoothScroll, destroySmoothScroll } from '@/lib/smooth-scroll'

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    initSmoothScroll()
    return () => destroySmoothScroll()
  }, [])

  return <>{children}</>
}
