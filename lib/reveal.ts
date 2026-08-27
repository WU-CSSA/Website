const REVEAL_CDN = "https://cdn.jsdelivr.net/npm/reveal.js@5.1.0"

function isFullHtmlDocument(content: string): boolean {
  return /^\s*<!DOCTYPE\s+html/i.test(content) || /^\s*<html/i.test(content)
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export function buildRevealHtml(
  content: string,
  type: "REVEAL_MD" | "REVEAL_HTML",
  title: string
): string {
  // For full HTML documents, return as-is
  if (type === "REVEAL_HTML" && isFullHtmlDocument(content)) {
    return content
  }

  const isMarkdown = type === "REVEAL_MD"

  // For markdown, let RevealJS's Markdown plugin handle everything
  const slidesHtml = isMarkdown
    ? `<section data-markdown data-separator="^---$" data-separator-vertical="^----$" data-separator-notes="^Note:">
        <textarea data-template>
${content}
        </textarea>
      </section>`
    : content

  const markdownPlugin = isMarkdown
    ? `<script src="${REVEAL_CDN}/plugin/markdown/markdown.js"></script>`
    : ""
  const markdownInit = isMarkdown ? "RevealMarkdown," : ""

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${REVEAL_CDN}/dist/reset.css">
  <link rel="stylesheet" href="${REVEAL_CDN}/dist/reveal.css">
  <link rel="stylesheet" href="${REVEAL_CDN}/dist/theme/black.css">
  <link rel="stylesheet" href="${REVEAL_CDN}/plugin/highlight/monokai.css">
</head>
<body>
  <div class="reveal">
    <div class="slides">
${slidesHtml}
    </div>
  </div>
  <script src="${REVEAL_CDN}/dist/reveal.js"></script>
  ${markdownPlugin}
  <script src="${REVEAL_CDN}/plugin/highlight/highlight.js"></script>
  <script src="${REVEAL_CDN}/plugin/notes/notes.js"></script>
  <script src="${REVEAL_CDN}/plugin/math/math.js"></script>
  <script src="${REVEAL_CDN}/plugin/zoom/zoom.js"></script>
  <script src="${REVEAL_CDN}/plugin/search/search.js"></script>
  <script>
    Reveal.initialize({
      hash: true,
      fragmentInURL: true,
      slideNumber: 'c/t',
      showSlideNumber: 'all',
      progress: true,
      controls: true,
      center: true,
      transition: 'slide',
      backgroundTransition: 'fade',
      katex: {
        version: '0.16.11',
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\\\[', right: '\\\\]', display: true },
          { left: '\\\\(', right: '\\\\)', display: false }
        ],
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code']
      },
      plugins: [${markdownInit} RevealHighlight, RevealNotes, RevealMath.KaTeX, RevealZoom, RevealSearch]
    });
  </script>
</body>
</html>`
}
