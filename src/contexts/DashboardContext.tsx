'use client'

import { createContext, useContext } from 'react'

type DashboardContextValue = {
  dashboardType: 'ecommerce' | 'leadgen'
  displayCurrency: string
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({
  children,
  dashboardType,
  displayCurrency = 'USD',
}: {
  children: React.ReactNode
  dashboardType: 'ecommerce' | 'leadgen'
  displayCurrency?: string | null
}) {
  return (
    <DashboardContext.Provider value={{ dashboardType, displayCurrency: displayCurrency ?? 'USD' }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardType(): 'ecommerce' | 'leadgen' {
  const ctx = useContext(DashboardContext)
  return ctx?.dashboardType ?? 'ecommerce'
}

export function useDisplayCurrency(): string {
  const ctx = useContext(DashboardContext)
  return ctx?.displayCurrency ?? 'USD'
}
