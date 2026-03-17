'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Tool = {
  id: string
  slug: string
  name: string
  sort_order: number
  is_active: boolean
}

export default function PortfolioToolsAdmin() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ id: '', slug: '', name: '', sort_order: 0, is_active: true })

  const sorted = useMemo(() => [...tools].sort((a, b) => a.sort_order - b.sort_order), [tools])

  async function fetchTools() {
    setLoading(true)
    const res = await fetch('/api/admin/portfolio-tools', { cache: 'no-store' })
    const data = await res.json()
    if (!res.ok) setError(data?.error || 'Failed to load tools')
    else setTools(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    fetchTools()
  }, [])

  async function saveTool() {
    setError('')
    const method = form.id ? 'PUT' : 'POST'
    const res = await fetch('/api/admin/portfolio-tools', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) setError(data?.error || 'Failed to save tool')
    else {
      await fetchTools()
      setForm({ id: '', slug: '', name: '', sort_order: 0, is_active: true })
    }
  }

  async function deleteTool(id: string) {
    if (!confirm('Delete this tool?')) return
    const res = await fetch('/api/admin/portfolio-tools', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    if (!res.ok) setError(data?.error || 'Failed to delete tool')
    else fetchTools()
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black">Tools Admin</h1>
          <Link href="/admin" className="text-sm text-slate-400 hover:text-white">
            Back to Dashboard
          </Link>
        </div>

        {error ? <p className="text-sm text-red-400 mb-4">{error}</p> : null}

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-5 grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            placeholder="slug (simpleicons)"
            value={form.slug}
            onChange={(e) => setForm((s) => ({ ...s, slug: e.target.value }))}
            className="bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm md:col-span-2"
          />
          <input
            placeholder="name"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            className="bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm md:col-span-2"
          />
          <input
            type="number"
            value={form.sort_order}
            onChange={(e) => setForm((s) => ({ ...s, sort_order: Number(e.target.value || 0) }))}
            className="bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
          />
          <label className="inline-flex items-center gap-2 text-sm text-slate-300 md:col-span-3">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))}
            />
            Active
          </label>
          <div className="md:col-span-2 flex gap-2">
            <button onClick={saveTool} className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold">
              {form.id ? 'Update' : 'Add'}
            </button>
            {form.id ? (
              <button
                onClick={() => setForm({ id: '', slug: '', name: '', sort_order: 0, is_active: true })}
                className="text-sm text-slate-400"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <p className="p-5 text-slate-400 text-sm">Loading tools...</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="text-left px-4 py-2 text-slate-400">Name</th>
                  <th className="text-left px-4 py-2 text-slate-400">Slug</th>
                  <th className="text-left px-4 py-2 text-slate-400">Order</th>
                  <th className="text-left px-4 py-2 text-slate-400">Active</th>
                  <th className="text-left px-4 py-2 text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((tool) => (
                  <tr key={tool.id} className="border-b border-slate-900">
                    <td className="px-4 py-2">{tool.name}</td>
                    <td className="px-4 py-2 font-mono text-xs">{tool.slug}</td>
                    <td className="px-4 py-2">{tool.sort_order}</td>
                    <td className="px-4 py-2">{tool.is_active ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-2 flex gap-3">
                      <button onClick={() => setForm(tool)} className="text-blue-300">
                        Edit
                      </button>
                      <button onClick={() => deleteTool(tool.id)} className="text-red-300">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
