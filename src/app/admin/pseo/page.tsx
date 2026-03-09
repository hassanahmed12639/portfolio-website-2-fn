'use client'

import { useState, useEffect } from 'react'

const PAGE_TYPES = [
  { value: 'integration', label: 'Integration Page', desc: '/integrations/[platform]' },
  { value: 'compare', label: 'Compare Page', desc: '/compare/trackhive-vs-[tool]' },
  { value: 'problem', label: 'Problem/Solution Page', desc: '/blog/[problem]' },
  { value: 'usecase', label: 'Use Case Page', desc: '/for/[usecase]' },
]

const emptyForm = {
  type: 'integration',
  slug: '',
  title: '',
  meta_title: '',
  meta_description: '',
  h1: '',
  hero_subtitle: '',
  platform_name: '',
  platform_slug: '',
  compare_tool_name: '',
  tagline: '',
  stat_1_number: '',
  stat_1_label: '',
  stat_2_number: '',
  stat_2_label: '',
  stat_3_number: '',
  stat_3_label: '',
  section_1_title: '',
  section_1_body: '',
  section_2_title: '',
  section_2_body: '',
  cta_title: '',
  cta_subtitle: '',
  cta_button_text: 'Get Started Free',
  published: false,
}

function getPageUrl(page: { type: string; slug: string }) {
  if (page.type === 'integration') return `/integrations/${page.slug}`
  if (page.type === 'compare') return `/compare/${page.slug}`
  if (page.type === 'usecase') return `/for/${page.slug}`
  return `/blog/${page.slug}`
}

export default function PSEOAdmin() {
  const [pages, setPages] = useState<Record<string, unknown>[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    const res = await fetch('/api/admin/pseo')
    const data = await res.json()
    setPages(Array.isArray(data) ? data : [])
  }

  const handleSave = async () => {
    setSaving(true)
    const method = editing ? 'PUT' : 'POST'
    const body = editing ? { ...form, id: editing.id } : form
    await fetch('/api/admin/pseo', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    await fetchPages()
    setShowForm(false)
    setEditing(null)
    setForm(emptyForm)
    setSaving(false)
  }

  const handleEdit = (page: Record<string, unknown>) => {
    setEditing(page)
    setForm({ ...emptyForm, ...page } as typeof emptyForm)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return
    await fetch('/api/admin/pseo', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchPages()
  }

  const handleTogglePublish = async (page: Record<string, unknown>) => {
    await fetch('/api/admin/pseo', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: page.id, published: !page.published }),
    })
    fetchPages()
  }

  const filteredPages =
    filter === 'all' ? pages : pages.filter((p) => p.type === filter)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Programmatic SEO</h1>
          <p className="text-slate-500 text-sm mt-1">
            Create and manage auto-generated landing pages for SEO
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setForm(emptyForm)
            setShowForm(true)
          }}
          className="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
        >
          + New pSEO Page
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Pages', value: pages.length },
          {
            label: 'Published',
            value: pages.filter((p) => p.published).length,
          },
          { label: 'Drafts', value: pages.filter((p) => !p.published).length },
          {
            label: 'Page Types',
            value: [...new Set(pages.map((p) => p.type))].length,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-slate-100 p-4 text-center"
          >
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'integration', 'compare', 'problem', 'usecase'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' &&
              ` (${pages.filter((p) => p.type === f).length})`}
          </button>
        ))}
      </div>

      {/* Pages list */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {filteredPages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm">No pSEO pages yet.</p>
            <p className="text-slate-400 text-xs mt-1">
              Click New pSEO Page to create your first one.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Title
                </th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  URL
                </th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((page, i) => (
                <tr
                  key={String(page.id)}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{String(page.title)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {String(page.meta_description || '').slice(0, 60)}...
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        page.type === 'integration'
                          ? 'bg-blue-100 text-blue-700'
                          : page.type === 'compare'
                            ? 'bg-purple-100 text-purple-700'
                            : page.type === 'problem'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {String(page.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={getPageUrl(page as { type: string; slug: string })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-xs font-mono"
                    >
                      {getPageUrl(page as { type: string; slug: string })}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublish(page)}
                      className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
                        page.published
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      {page.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(page)}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(String(page.id))}
                        className="text-xs text-red-400 hover:text-red-600 font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl p-6 my-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">
                {editing ? 'Edit pSEO Page' : 'New pSEO Page'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Page type */}
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  Page Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  {PAGE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} — {t.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Basic fields */}
              {[
                {
                  key: 'slug',
                  label: 'URL Slug',
                  placeholder: 'e.g. meta-capi or trackhive-vs-stape',
                },
                {
                  key: 'title',
                  label: 'Page Title',
                  placeholder: 'e.g. Meta CAPI Server-Side Tracking',
                },
                {
                  key: 'meta_title',
                  label: 'SEO Meta Title',
                  placeholder: 'Meta CAPI Integration — TrackHive',
                },
                {
                  key: 'meta_description',
                  label: 'SEO Meta Description',
                  placeholder: 'Under 160 characters',
                },
                {
                  key: 'h1',
                  label: 'H1 Heading',
                  placeholder: 'Main page heading',
                },
                {
                  key: 'hero_subtitle',
                  label: 'Hero Subtitle',
                  placeholder: 'Short subtitle under heading',
                },
                {
                  key: 'platform_name',
                  label: 'Platform Name',
                  placeholder: 'e.g. Meta CAPI',
                },
                {
                  key: 'compare_tool_name',
                  label: 'Competitor Name (compare pages)',
                  placeholder: 'e.g. Stape',
                },
                {
                  key: 'tagline',
                  label: 'Tagline',
                  placeholder: 'Short punchy line',
                },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={String(form[field.key as keyof typeof form] ?? '')}
                    onChange={(e) =>
                      setForm({ ...form, [field.key]: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}

              {/* Stats */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-slate-700 mb-3">
                  3 Stats / Highlights
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="space-y-2">
                      <input
                        type="text"
                        placeholder={`Stat ${n} number`}
                        value={String(
                          form[`stat_${n}_number` as keyof typeof form] ?? ''
                        )}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            [`stat_${n}_number`]: e.target.value,
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                      />
                      <input
                        type="text"
                        placeholder={`Stat ${n} label`}
                        value={String(
                          form[`stat_${n}_label` as keyof typeof form] ?? ''
                        )}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            [`stat_${n}_label`]: e.target.value,
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Content sections */}
              {[
                {
                  titleKey: 'section_1_title',
                  bodyKey: 'section_1_body',
                  label: 'Section 1',
                },
                {
                  titleKey: 'section_2_title',
                  bodyKey: 'section_2_body',
                  label: 'Section 2',
                },
              ].map((section) => (
                <div
                  key={section.label}
                  className="border-t border-slate-100 pt-4"
                >
                  <p className="text-sm font-bold text-slate-700 mb-3">
                    {section.label}
                  </p>
                  <input
                    type="text"
                    placeholder="Section title"
                    value={String(
                      form[section.titleKey as keyof typeof form] ?? ''
                    )}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [section.titleKey]: e.target.value,
                      })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2"
                  />
                  <textarea
                    placeholder="Section body content"
                    value={String(
                      form[section.bodyKey as keyof typeof form] ?? ''
                    )}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [section.bodyKey]: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none"
                  />
                </div>
              ))}

              {/* CTA */}
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-slate-700 mb-3">
                  Call to Action
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="CTA title"
                    value={form.cta_title ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, cta_title: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="CTA subtitle"
                    value={form.cta_subtitle ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, cta_subtitle: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Button text"
                    value={form.cta_button_text ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, cta_button_text: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Publish toggle */}
              <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label
                  htmlFor="published"
                  className="text-sm font-medium text-slate-700"
                >
                  Publish immediately (page will be live and indexed)
                </label>
              </div>
            </div>

            {/* Save */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={handleSave}
                disabled={saving || !form.slug || !form.title}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving
                  ? 'Saving...'
                  : editing
                    ? 'Save Changes'
                    : 'Create Page'}
              </button>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditing(null)
                }}
                className="text-slate-500 text-sm font-medium hover:text-slate-700"
              >
                Cancel
              </button>
              {form.slug && (
                <a
                  href={getPageUrl(form)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-xs text-blue-500 hover:underline"
                >
                  Preview →
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
