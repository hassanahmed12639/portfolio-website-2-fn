'use client'

export function UpgradeProButton() {
  return (
    <button
      type="button"
      onClick={() =>
        alert(
          'Stripe coming soon — contact hassan@itshassanahmed.com to upgrade manually'
        )
      }
      className="w-full py-2.5 rounded-lg font-medium border border-[var(--dash-border-strong)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] transition-colors"
    >
      Upgrade to Pro — $10/mo
    </button>
  )
}




