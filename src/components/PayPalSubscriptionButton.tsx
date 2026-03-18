'use client'

import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    // Broad typing to avoid TS "subsequent property declarations must have same type".
    paypal?: any
  }
}

const SCRIPT_URL = 'https://www.paypal.com/sdk/js'

export default function PayPalSubscriptionButton({
  planId,
  containerId,
  plan = 'pro',
}: {
  planId: string
  containerId: string
  plan?: 'pro' | 'agency'
}) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const rendered = useRef(false)

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  useEffect(() => {
    if (!clientId || !planId) return

    const existing = document.querySelector(`script[src^="${SCRIPT_URL}"]`)
    if (existing) {
      if (window.paypal) {
        setLoaded(true)
      } else {
        existing.addEventListener('load', () => setLoaded(true))
      }
      return
    }

    const params = new URLSearchParams({
      'client-id': clientId,
      vault: 'true',
      intent: 'subscription',
    })
    const script = document.createElement('script')
    script.src = `${SCRIPT_URL}?${params.toString()}`
    script.async = true
    script.setAttribute('data-sdk-integration-source', 'button-factory')
    script.onload = () => setLoaded(true)
    script.onerror = () => setError('contact contact@trackhive.com')
    document.body.appendChild(script)

    return () => {
      // Cleanup: script stays for other instances
    }
  }, [clientId, planId])

  useEffect(() => {
    if (!loaded || !window.paypal || !planId || !containerId || rendered.current) return

    const container = document.getElementById(containerId)
    if (!container || container.hasChildNodes()) return

    rendered.current = true

    window.paypal
      .Buttons({
        style: {
          shape: 'pill',
          color: 'blue',
          layout: 'horizontal',
          label: 'paypal',
        },
        createSubscription: function (_data: unknown, actions: { subscription: { create: (opts: { plan_id: string }) => Promise<unknown> } }) {
          return actions.subscription.create({
            plan_id: planId,
          })
        },
        onApprove: function (data: { subscriptionID?: string; subscriptionId?: string }) {
          const id = data.subscriptionID ?? data.subscriptionId
          if (id) {
            const redirectUrl = `/dashboard?plan=${plan}&welcome=true`
            window.location.href = redirectUrl
          }
        },
      })
      .render(`#${containerId}`)
      .catch(() => {
        setError('contact contact@trackhive.com')
        rendered.current = false
      })
  }, [loaded, planId, containerId, plan])

  if (!clientId) {
    return (
      <p className="text-amber-600 text-sm text-center py-2">
        Add NEXT_PUBLIC_PAYPAL_CLIENT_ID to env.
      </p>
    )
  }

  if (error) {
    return <p className="text-red-500 text-sm text-center py-2">{error}</p>
  }

  return (
    <div className="min-h-[42px] flex flex-col items-center justify-center gap-2">
      {!loaded && (
        <p className="text-slate-500 text-sm">Loading PayPal…</p>
      )}
      <div id={containerId} className="min-h-[42px]" />
    </div>
  )
}
