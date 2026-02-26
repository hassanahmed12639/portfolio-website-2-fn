'use client'

type Section = { id: string; heading: string; content: string }

function buildPrompt(
  title: string,
  url: string,
  description: string,
  sections: Section[]
): string {
  const lines: string[] = [
    "Summarize this case study from Hassan Ahmed's Portfolio website:",
    "",
    `Title: "${title}"`,
    `URL: ${url}`,
    "",
    "Content",
    "",
    description,
  ]
  for (const sec of sections) {
    lines.push("", sec.heading, sec.content)
  }
  return lines.join("\n")
}

export default function SummarizeInChatGPT({
  title,
  description,
  sections,
  slug,
}: {
  title: string
  description: string
  sections: Section[]
  slug: string
}) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const url =
      typeof window !== "undefined"
        ? window.location.origin + "/project/" + slug
        : ""
    const prompt = buildPrompt(title, url, description, sections)
    const encoded = encodeURIComponent(prompt)
    window.open(`https://chat.openai.com/?q=${encoded}`, "_blank", "noopener,noreferrer")
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-2 text-[var(--color-accent)] hover:underline underline-offset-2 bg-transparent border-none cursor-pointer p-0 font-inherit text-inherit"
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
      </svg>
      Summarize in ChatGPT
    </button>
  )
}
