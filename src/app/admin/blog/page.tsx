'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BlogContentEditor } from '@/components/admin/BlogContentEditor'

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    meta_title: '',
    meta_description: '',
    primary_keyword: '',
    category: 'Server-Side Tracking',
    author: 'TrackHive Team',
    read_time: 5,
    published: false,
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const res = await fetch('/api/admin/blog')
    const data = await res.json()
    setPosts(data.posts || [])
  }

  const generateSlug = (title: string) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

  const handleTitleChange = (title: string) => {
    setForm((f) => ({ ...f, title, slug: generateSlug(title) }))
  }

  const handleSave = async () => {
    const method = editing ? 'PUT' : 'POST'
    const body = editing ? { ...form, id: editing.id } : form
    await fetch('/api/admin/blog', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setShowForm(false)
    setEditing(null)
    setForm({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image: '',
      meta_title: '',
      meta_description: '',
      primary_keyword: '',
      category: 'Server-Side Tracking',
      author: 'TrackHive Team',
      read_time: 5,
      published: false,
    })
    fetchPosts()
  }

  const handleEdit = (post: any) => {
    setEditing(post)
    setForm(post)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return
    await fetch('/api/admin/blog', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchPosts()
  }

  const handleTogglePublish = async (post: any) => {
    await fetch('/api/admin/blog', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, published: !post.published }),
    })
    fetchPosts()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Blog Posts</h1>
          <p className="text-sm text-slate-500">{posts.length} total posts</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditing(null)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + New Post
        </button>
      </div>

      {!showForm && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                  Title
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                  Category
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                  Views
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="border-t border-slate-50 hover:bg-slate-50"
                >
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-slate-900">
                      {post.title}
                    </p>
                    <p className="text-xs text-slate-400">/blog/{post.slug}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500">
                    {post.category}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        post.published
                          ? 'bg-green-50 text-green-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {post.published ? '✅ Published' : '⏳ Draft'}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500">
                    {post.views}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        View →
                      </Link>
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-xs text-slate-600 hover:text-slate-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {posts.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-4xl mb-3">📝</p>
              <p className="font-medium">No posts yet</p>
              <p className="text-sm">
                Click &quot;New Post&quot; to create your first blog post
              </p>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-900">
              {editing ? 'Edit Post' : 'New Post'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕ Cancel
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Slug
              </label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="post-url-slug"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Excerpt
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) =>
                  setForm((f) => ({ ...f, excerpt: e.target.value }))
                }
                className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Brief description for SEO and previews"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Featured image
              </label>
              <input
                type="url"
                value={form.featured_image || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured_image: e.target.value }))
                }
                className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://... (image URL for post hero)"
              />
              {form.featured_image && (
                <div className="mt-2 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 max-w-md">
                  <img
                    src={form.featured_image}
                    alt="Featured preview"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                SEO Meta Title
              </label>
              <input
                type="text"
                placeholder="Under 60 characters — shown in Google results"
                value={form.meta_title || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, meta_title: e.target.value }))
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                {(form.meta_title || '').length}/60 characters
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                SEO Meta Description
              </label>
              <textarea
                placeholder="Under 160 characters — shown in Google search results"
                value={form.meta_description || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, meta_description: e.target.value }))
                }
                rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                {(form.meta_description || '').length}/160 characters
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Primary Keyword
              </label>
              <input
                type="text"
                placeholder="e.g. meta capi setup shopify"
                value={form.primary_keyword || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, primary_keyword: e.target.value }))
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Category
              </label>
              <select
                value={form.category || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                <option value="Facebook Ads">Facebook Ads</option>
                <option value="TikTok Ads">TikTok Ads</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Conversion Tracking">Conversion Tracking</option>
                <option value="Tracking & Analytics">Tracking & Analytics</option>
                <option value="Agency">Agency</option>
                <option value="Tutorials">Tutorials</option>
                <option value="Server-Side Tracking">Server-Side Tracking</option>
                <option value="Meta CAPI">Meta CAPI</option>
                <option value="TikTok">TikTok</option>
                <option value="Google">Google</option>
                <option value="Analytics">Analytics</option>
                <option value="Tutorial">Tutorial</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Read Time (minutes)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={form.read_time ?? 5}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    read_time: parseInt(e.target.value, 10) || 5,
                  }))
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                Author
              </label>
              <input
                type="text"
                placeholder="TrackHive Team"
                value={form.author || ''}
                onChange={(e) =>
                  setForm((f) => ({ ...f, author: e.target.value }))
                }
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Content (HTML)
              </label>
              <p className="text-xs text-slate-400 mb-2">
                Use the toolbar for bold, link, image, bullet list, numbered list, table, and headings (H1–H6). You can also type HTML directly.
              </p>
              <BlogContentEditor
                value={form.content}
                onChange={(content) =>
                  setForm((f) => ({ ...f, content }))
                }
                rows={20}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={form.published}
                onChange={(e) =>
                  setForm((f) => ({ ...f, published: e.target.checked }))
                }
                className="w-4 h-4 text-blue-600"
              />
              <label
                htmlFor="published"
                className="text-sm text-slate-700"
              >
                Publish immediately
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                {editing ? 'Save Changes' : 'Create Post'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-slate-100 text-slate-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
