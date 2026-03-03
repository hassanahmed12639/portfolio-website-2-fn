'use client'

export function UpgradeButton() {
  return (
    <button
      type="button"
      onClick={() => alert('Coming soon - contact hassan@itshassanahmed.com')}
      className="w-full py-2.5 rounded-lg font-medium bg-[var(--dash-success)] text-white hover:bg-[var(--dash-success-strong)] transition-colors"
    >
      Upgrade to Pro
    </button>
  )
}




