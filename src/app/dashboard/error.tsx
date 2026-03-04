'use client'

export default function DashboardError({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      <p className="text-slate-900 font-semibold">Something went wrong</p>
      <p className="text-slate-500 text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  )
}
