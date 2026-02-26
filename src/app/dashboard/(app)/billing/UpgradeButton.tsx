'use client'

export function UpgradeButton() {
  return (
    <button
      type="button"
      onClick={() => alert('Coming soon - contact hassan@itshassanahmed.com')}
      className="w-full py-2.5 rounded-lg font-medium bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition-colors"
    >
      Upgrade to Pro
    </button>
  )
}
