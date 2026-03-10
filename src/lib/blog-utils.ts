export type TocItem = { text: string; id: string; level: number }

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '') || 'section'
}

/**
 * Extract h2/h3 headings from HTML and inject id attributes for anchor links.
 * Returns the modified HTML and TOC items.
 */
export function extractHeadingsAndInjectIds(html: string): {
  html: string
  toc: TocItem[]
} {
  const toc: TocItem[] = []
  let idCounter = 0

  const withIds = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_, level: string, attrs: string, content: string) => {
      const rawText = content.replace(/<[^>]*>/g, '').trim()
      const id = slugify(rawText) || `section-${++idCounter}`
      toc.push({ text: rawText, id, level: parseInt(level, 10) })
      return `<h${level}${attrs} id="${id}">${content}</h${level}>`
    }
  )

  return { html: withIds, toc }
}
