'use client'

import { useRef, useCallback } from 'react'

type BlogContentEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
}

export function BlogContentEditor({
  value,
  onChange,
  placeholder = 'Write your blog post content in HTML...',
  rows = 20,
  className = '',
}: BlogContentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const getSelection = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return { start: 0, end: 0, text: '' }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const text = value.slice(start, end)
    return { start, end, text }
  }, [value])

  const insertAtCursor = useCallback(
    (before: string, after: string = '', replaceSelection: boolean = false) => {
      const ta = textareaRef.current
      if (!ta) return
      const { start, end, text } = getSelection()
      const selected = replaceSelection ? text : ''
      const newContent =
        value.slice(0, start) + before + selected + after + value.slice(end)
      onChange(newContent)
      setTimeout(() => {
        ta.focus()
        const newPos = start + before.length + selected.length
        ta.setSelectionRange(newPos, newPos)
      }, 0)
    },
    [value, onChange, getSelection]
  )

  const wrapSelection = useCallback(
    (openTag: string, closeTag: string) => {
      const { start, end, text } = getSelection()
      const newContent =
        value.slice(0, start) + openTag + text + closeTag + value.slice(end)
      onChange(newContent)
      setTimeout(() => {
        const ta = textareaRef.current
        if (ta) {
          ta.focus()
          ta.setSelectionRange(start + openTag.length, end + openTag.length)
        }
      }, 0)
    },
    [value, onChange, getSelection]
  )

  const applyBold = () => wrapSelection('<strong>', '</strong>')
  const applyHeading = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    const tag = `h${level}`
    wrapSelection(`<${tag}>`, `</${tag}>`)
  }

  const insertLink = () => {
    const url = window.prompt('Link URL (e.g. /blog/other-post or https://...):', 'https://')
    if (url == null || url === '') return
    const { start, end, text } = getSelection()
    const hasSelection = text.length > 0
    const label = hasSelection ? null : window.prompt('Link text (leave empty to use URL):', url)
    const display = label != null && label !== '' ? label : url
    if (hasSelection) {
      const newContent =
        value.slice(0, start) + `<a href="${url}">${text}</a>` + value.slice(end)
      onChange(newContent)
    } else {
      insertAtCursor(`<a href="${url}">${display}</a>`, '')
    }
  }

  const insertImage = () => {
    const src = window.prompt('Image URL:', 'https://')
    if (src == null || src === '') return
    const alt = window.prompt('Alt text (for accessibility):', '')
    const altAttr = alt != null && alt !== '' ? ` alt="${alt.replace(/"/g, '&quot;')}"` : ''
    insertAtCursor(`<img src="${src}"${altAttr} />`, '', true)
  }

  const insertBulletList = () => {
    const { start, end, text } = getSelection()
    if (text.trim()) {
      const items = text.trim().split(/\n/).map((line) => line.trim()).filter(Boolean)
      const lis = items.map((item) => `  <li>${item}</li>`).join('\n')
      const newContent = value.slice(0, start) + '<ul>\n' + lis + '\n</ul>' + value.slice(end)
      onChange(newContent)
    } else {
      insertAtCursor('<ul>\n<li>', '</li>\n</ul>', false)
    }
  }

  const insertNumberedList = () => {
    const { start, end, text } = getSelection()
    if (text.trim()) {
      const items = text.trim().split(/\n/).map((line) => line.trim()).filter(Boolean)
      const lis = items.map((item) => `  <li>${item}</li>`).join('\n')
      const newContent = value.slice(0, start) + '<ol>\n' + lis + '\n</ol>' + value.slice(end)
      onChange(newContent)
    } else {
      insertAtCursor('<ol>\n<li>', '</li>\n</ol>', false)
    }
  }

  const insertTable = () => {
    const rowsStr = window.prompt('Number of rows:', '3')
    const colsStr = window.prompt('Number of columns:', '3')
    if (rowsStr == null || colsStr == null) return
    const rows = Math.max(1, Math.min(20, parseInt(rowsStr, 10) || 3))
    const cols = Math.max(1, Math.min(10, parseInt(colsStr, 10) || 3))
    const headerRow = '  <tr>\n' + Array(cols).fill('    <th>Header</th>').join('\n') + '\n  </tr>'
    const bodyRows = Array(rows - 1)
      .fill(null)
      .map(
        (_, i) =>
          '  <tr>\n' +
          Array(cols)
            .fill(null)
            .map((_, j) => `    <td>Cell ${i + 1},${j + 1}</td>`)
            .join('\n') +
          '\n  </tr>'
      )
      .join('\n')
    const tableHtml =
      '<table class="min-w-full border border-slate-200">\n' +
      '  <thead>\n' +
      headerRow +
      '\n  </thead>\n' +
      '  <tbody>\n' +
      bodyRows +
      '\n  </tbody>\n</table>'
    insertAtCursor('\n' + tableHtml + '\n', '')
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-1 p-2 border border-slate-200 rounded-t-lg border-b-0 bg-slate-50">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
          Format
        </span>
        <button
          type="button"
          onClick={applyBold}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 font-bold text-sm"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={insertLink}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-sm underline"
          title="Insert link"
        >
          Link
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-sm"
          title="Insert image"
        >
          🖼 Image
        </button>
        <button
          type="button"
          onClick={insertBulletList}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-sm"
          title="Bullet list"
        >
          • Bullet
        </button>
        <button
          type="button"
          onClick={insertNumberedList}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-sm"
          title="Numbered list"
        >
          1. Numbered
        </button>
        <button
          type="button"
          onClick={insertTable}
          className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-sm"
          title="Insert table"
        >
          Table
        </button>
        <span className="w-px h-5 bg-slate-200 mx-1" />
        {([1, 2, 3, 4, 5, 6] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => applyHeading(level)}
            className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-sm font-medium"
            title={`Heading ${level}`}
          >
            H{level}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full border border-slate-200 rounded-b-lg rounded-t-none px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
      />
    </div>
  )
}
