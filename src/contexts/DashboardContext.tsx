'use client'

import { createContext, useContext } from 'react'

type DashboardContextValue = {
  dashboardType: 'ecommerce' | 'leadgen'
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({
  children,
  dashboardType,
}: {
  children: React.ReactNode
  dashboardType: 'ecommerce' | 'leadgen'
}) {
  return (
    <DashboardContext.Provider value={{ dashboardType }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardType(): 'ecommerce' | 'leadgen' {
  const ctx = useContext(DashboardContext)
  return ctx?.dashboardType ?? 'ecommerce'
}
