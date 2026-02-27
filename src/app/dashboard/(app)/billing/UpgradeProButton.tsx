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
      className="w-full py-2.5 rounded-lg font-medium border border-zinc-500 text-zinc-200 hover:bg-zinc-800 transition-colors"
    >
      Upgrade to Pro — $10/mo
    </button>
  )
}
