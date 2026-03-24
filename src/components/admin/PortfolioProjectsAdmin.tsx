'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type ProjectRecord = {
  id: string
  slug: string
  date: string | null
  title: string
  src: string
  author: string
  author_title: string | null
  description: string
  read_time: string | null
  sections: { id: string; heading: string; content: string }[]
  key_takeaways: string[]
  content_image: { src: string; afterSectionId?: string; alt?: string } | null
  content_images: { src: string; alt?: string }[]
  sort_order: number | null
  is_published: boolean | null
}

type ProjectForm = {
  slug: string
  date: string
  title: string
  src: string
  author: string
  authorTitle: string
  description: string
  readTime: string
  keyTakeawaysText: string
  sections: { id: string; heading: string; content: string }[]
  contentImageSrc: string
  contentImageAlt: string
  contentImageAfterSectionId: string
  contentImages: { src: string; alt: string }[]
  sortOrder: number
  isPublished: boolean
}

const emptyForm: ProjectForm = {
  slug: '',
  date: '',
  title: '',
  src: '',
  author: 'Hassan Ahmed',
  authorTitle: '',
  description: '',
  readTime: '',
  keyTakeawaysText: '',
  sections: [{ id: 'overview', heading: 'Overview', content: '' }],
  contentImageSrc: '',
  contentImageAlt: '',
  contentImageAfterSectionId: '',
  contentImages: [],
  sortOrder: 0,
  isPublished: true,
}

function toForm(project: ProjectRecord): ProjectForm {
  return {
    slug: project.slug ?? '',
    date: project.date ?? '',
    title: project.title ?? '',
    src: project.src ?? '',
    author: project.author ?? '',
    authorTitle: project.author_title ?? '',
    description: project.description ?? '',
    readTime: project.read_time ?? '',
    keyTakeawaysText: Array.isArray(project.key_takeaways)
      ? project.key_takeaways.join('\n')
      : '',
    sections:
      Array.isArray(project.sections) && project.sections.length > 0
        ? project.sections
        : [{ id: 'overview', heading: 'Overview', content: '' }],
    contentImageSrc: project.content_image?.src ?? '',
    contentImageAlt: project.content_image?.alt ?? '',
    contentImageAfterSectionId: project.content_image?.afterSectionId ?? '',
    contentImages: Array.isArray(project.content_images)
      ? project.content_images.map((img) => ({ src: img.src ?? '', alt: img.alt ?? '' }))
      : [],
    sortOrder: project.sort_order ?? 0,
    isPublished: project.is_published !== false,
  }
}

export default function PortfolioProjectsAdmin() {
  const [projects, setProjects] = useState<ProjectRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingTarget, setUploadingTarget] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectForm>(emptyForm)

  const sortedProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.title.localeCompare(b.title)
      ),
    [projects]
  )

  async function readApiResponse(res: Response): Promise<any> {
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      return res.json()
    }
    const text = await res.text()
    const plain = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    return {
      error:
        plain.slice(0, 220) ||
        `Request failed with status ${res.status}`,
    }
  }

  async function fetchProjects() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/portfolio-projects', {
        cache: 'no-store',
        credentials: 'include',
      })
      const data = await readApiResponse(res)
      if (!res.ok) throw new Error(data?.error || 'Failed to fetch projects')
      setProjects(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...(editingId ? { id: editingId } : {}),
        slug: form.slug.trim().toLowerCase(),
        date: form.date.trim(),
        title: form.title.trim(),
        src: form.src.trim(),
        author: form.author.trim(),
        authorTitle: form.authorTitle.trim(),
        description: form.description.trim(),
        readTime: form.readTime.trim(),
        keyTakeaways: form.keyTakeawaysText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
        sections: form.sections
          .map((section) => ({
            id: section.id.trim(),
            heading: section.heading.trim(),
            content: section.content.trim(),
          }))
          .filter((section) => section.id && section.heading && section.content),
        contentImage: form.contentImageSrc.trim()
          ? {
              src: form.contentImageSrc.trim(),
              ...(form.contentImageAlt.trim() ? { alt: form.contentImageAlt.trim() } : {}),
              ...(form.contentImageAfterSectionId.trim()
                ? { afterSectionId: form.contentImageAfterSectionId.trim() }
                : {}),
            }
          : null,
        contentImages: form.contentImages
          .map((image) => ({ src: image.src.trim(), alt: image.alt.trim() }))
          .filter((image) => image.src),
        sortOrder: Number.isFinite(form.sortOrder) ? form.sortOrder : 0,
        isPublished: form.isPublished,
      }

      const res = await fetch('/api/admin/portfolio-projects', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })
      const data = await readApiResponse(res)
      if (!res.ok) throw new Error(data?.error || 'Failed to save project')

      await fetchProjects()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this project? This cannot be undone.')) return
    setError('')
    try {
      const res = await fetch('/api/admin/portfolio-projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include',
      })
      const data = await readApiResponse(res)
      if (!res.ok) throw new Error(data?.error || 'Failed to delete project')
      await fetchProjects()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
    }
  }

  function startEdit(project: ProjectRecord) {
    setEditingId(project.id)
    setForm(toForm(project))
    setShowForm(true)
    setError('')
  }

  async function uploadImage(file: File, target: string): Promise<string | null> {
    setError('')
    setUploadingTarget(target)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectSlug', form.slug || 'general')
      const res = await fetch('/api/admin/portfolio-upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      const data = await readApiResponse(res)
      if (!res.ok) throw new Error(data?.error || 'Upload failed')
      return typeof data?.url === 'string' ? data.url : null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      return null
    } finally {
      setUploadingTarget('')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black">Projects Admin</h1>
            <p className="text-slate-400 text-sm mt-1">
              Add, edit, publish and delete complete project pages.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-sm text-slate-400 hover:text-white">
              Back to Dashboard
            </Link>
            <button
              onClick={() => {
                setEditingId(null)
                setForm(emptyForm)
                setShowForm(true)
              }}
              className="bg-white text-black text-sm font-bold px-4 py-2 rounded-xl hover:bg-slate-200"
            >
              + New Project
            </button>
          </div>
        </div>

        {error ? <p className="text-red-400 text-sm mb-4">{error}</p> : null}

        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <p className="p-6 text-sm text-slate-400">Loading projects...</p>
          ) : sortedProjects.length === 0 ? (
            <p className="p-6 text-sm text-slate-400">No projects yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-900 border-b border-slate-800">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-400">Title</th>
                  <th className="text-left px-4 py-3 text-slate-400">Slug</th>
                  <th className="text-left px-4 py-3 text-slate-400">Order</th>
                  <th className="text-left px-4 py-3 text-slate-400">Status</th>
                  <th className="text-left px-4 py-3 text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedProjects.map((project, index) => (
                  <tr key={project.id} className={index % 2 ? 'bg-slate-950' : 'bg-black'}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-white">{project.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {project.description?.slice(0, 80)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">/{project.slug}</td>
                    <td className="px-4 py-3 text-slate-300">{project.sort_order ?? 0}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-lg ${
                          project.is_published ? 'bg-green-900/50 text-green-300' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {project.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button className="text-blue-300 hover:text-blue-200" onClick={() => startEdit(project)}>
                          Edit
                        </button>
                        <a
                          href={`/project/${project.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-300 hover:text-white"
                        >
                          View
                        </a>
                        <button
                          className="text-red-300 hover:text-red-200"
                          onClick={() => handleDelete(project.id)}
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
      </div>

      {showForm ? (
        <div className="fixed inset-0 z-50 bg-black/70 p-4 overflow-y-auto">
          <div className="max-w-3xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{editingId ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-white">
                Close
              </button>
            </div>

            <div className="space-y-4">
              {[
                { key: 'slug', label: 'Slug', required: true },
                { key: 'title', label: 'Title', required: true },
                { key: 'date', label: 'Published Date (display)' },
                { key: 'author', label: 'Author', required: true },
                { key: 'authorTitle', label: 'Author Title' },
                { key: 'readTime', label: 'Read Time (e.g. 7 min read)' },
              ].map((field) => (
                <div key={field.key}>
                  <label className="block text-sm text-slate-300 mb-1">
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>
                  <input
                    value={form[field.key as keyof ProjectForm] as string}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                    className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm text-slate-300 mb-1">Hero Image URL *</label>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
                  <input
                    value={form.src}
                    onChange={(event) => setForm((current) => ({ ...current, src: event.target.value }))}
                    className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                  />
                  <label className="inline-flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs cursor-pointer hover:bg-slate-700">
                    {uploadingTarget === 'hero' ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      disabled={uploadingTarget === 'hero'}
                      onChange={async (event) => {
                        const file = event.target.files?.[0]
                        if (!file) return
                        const url = await uploadImage(file, 'hero')
                        if (url) setForm((current) => ({ ...current, src: url }))
                        event.currentTarget.value = ''
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Description *</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">Key Takeaways (one per line)</label>
                <textarea
                  rows={4}
                  value={form.keyTakeawaysText}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, keyTakeawaysText: event.target.value }))
                  }
                  className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div className="border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold">Sections</p>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        sections: [...current.sections, { id: '', heading: '', content: '' }],
                      }))
                    }
                    className="text-xs text-blue-300 hover:text-blue-200"
                  >
                    + Add Section
                  </button>
                </div>
                <div className="space-y-3">
                  {form.sections.map((section, index) => (
                    <div key={`${section.id}-${index}`} className="border border-slate-800 rounded-lg p-3 space-y-2">
                      <input
                        placeholder="Section id (e.g. overview)"
                        value={section.id}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            sections: current.sections.map((item, idx) =>
                              idx === index ? { ...item, id: event.target.value } : item
                            ),
                          }))
                        }
                        className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      />
                      <input
                        placeholder="Heading"
                        value={section.heading}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            sections: current.sections.map((item, idx) =>
                              idx === index ? { ...item, heading: event.target.value } : item
                            ),
                          }))
                        }
                        className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      />
                      <textarea
                        rows={4}
                        placeholder="Section content"
                        value={section.content}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            sections: current.sections.map((item, idx) =>
                              idx === index ? { ...item, content: event.target.value } : item
                            ),
                          }))
                        }
                        className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            sections: current.sections.filter((_, idx) => idx !== index),
                          }))
                        }
                        className="text-xs text-red-300 hover:text-red-200"
                      >
                        Remove section
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 md:col-span-2">
                  <input
                    placeholder="Inline content image URL"
                    value={form.contentImageSrc}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, contentImageSrc: event.target.value }))
                    }
                    className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                  />
                  <label className="inline-flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs cursor-pointer hover:bg-slate-700">
                    {uploadingTarget === 'inline' ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      disabled={uploadingTarget === 'inline'}
                      onChange={async (event) => {
                        const file = event.target.files?.[0]
                        if (!file) return
                        const url = await uploadImage(file, 'inline')
                        if (url) setForm((current) => ({ ...current, contentImageSrc: url }))
                        event.currentTarget.value = ''
                      }}
                    />
                  </label>
                </div>
                <input
                  placeholder="Inline image alt"
                  value={form.contentImageAlt}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, contentImageAlt: event.target.value }))
                  }
                  className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  placeholder="Inline image section id (optional)"
                  value={form.contentImageAfterSectionId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      contentImageAfterSectionId: event.target.value,
                    }))
                  }
                  className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm md:col-span-2"
                />
              </div>

              <div className="border border-slate-800 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold">Additional Content Images</p>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        contentImages: [...current.contentImages, { src: '', alt: '' }],
                      }))
                    }
                    className="text-xs text-blue-300 hover:text-blue-200"
                  >
                    + Add Image
                  </button>
                </div>
                <div className="space-y-2">
                  {form.contentImages.map((image, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2">
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2 md:col-span-1">
                        <input
                          placeholder="Image URL"
                          value={image.src}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              contentImages: current.contentImages.map((item, idx) =>
                                idx === index ? { ...item, src: event.target.value } : item
                              ),
                            }))
                          }
                          className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                        />
                        <label className="inline-flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs cursor-pointer hover:bg-slate-700">
                          {uploadingTarget === `additional-${index}` ? 'Uploading...' : 'Upload'}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            disabled={uploadingTarget === `additional-${index}`}
                            onChange={async (event) => {
                              const file = event.target.files?.[0]
                              if (!file) return
                              const url = await uploadImage(file, `additional-${index}`)
                              if (url) {
                                setForm((current) => ({
                                  ...current,
                                  contentImages: current.contentImages.map((item, idx) =>
                                    idx === index ? { ...item, src: url } : item
                                  ),
                                }))
                              }
                              event.currentTarget.value = ''
                            }}
                          />
                        </label>
                      </div>
                      <input
                        placeholder="Alt text"
                        value={image.alt}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            contentImages: current.contentImages.map((item, idx) =>
                              idx === index ? { ...item, alt: event.target.value } : item
                            ),
                          }))
                        }
                        className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setForm((current) => ({
                            ...current,
                            contentImages: current.contentImages.filter((_, idx) => idx !== index),
                          }))
                        }
                        className="text-xs text-red-300 hover:text-red-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, sortOrder: Number(event.target.value || 0) }))
                    }
                    className="w-full bg-black border border-slate-700 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <label className="md:col-span-2 inline-flex items-center gap-2 mt-7">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(event) => setForm((current) => ({ ...current, isPublished: event.target.checked }))}
                  />
                  <span className="text-sm text-slate-300">Published</span>
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving || !form.slug || !form.title || !form.src || !form.author || !form.description}
                className="bg-white text-black text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-slate-200 disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Project'}
              </button>
              <button onClick={resetForm} className="text-sm text-slate-400 hover:text-white">
                Cancel
              </button>
              {form.slug ? (
                <a
                  href={`/project/${form.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto text-sm text-blue-300 hover:text-blue-200"
                >
                  Preview Project
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
