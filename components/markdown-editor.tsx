"use client"

import React, { useState, useCallback, useMemo } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import oneLight from "react-syntax-highlighter/dist/cjs/styles/prism/one-light"
import oneDark from "react-syntax-highlighter/dist/cjs/styles/prism/one-dark"
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"
import { useTheme } from "next-themes"


const INITIAL_MARKDOWN = `# Welcome to Markos

A minimal, elegant markdown editor with live preview.

## Getting Started

Start typing on the left and watch the rendered output appear in real time on the right. Drag the divider to resize the panels.

## Typography

Markos renders your content with **carefully tuned typography** designed for readability. You can use *italics*, **bold**, or ~~strikethrough~~ to emphasize your text.

## Lists

Ordered lists work naturally:

1. First item with context
2. Second item builds on the first
3. Third item wraps things up

Unordered lists are clean and readable:

- Design systems and tokens
- Component architecture
- Responsive layouts
  - Mobile-first approach
  - Breakpoint strategy

## Code

Inline code like \`const x = 42\` renders with a subtle background.

Code blocks get their own treatment:

\`\`\`javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
\`\`\`

## Blockquotes

> Good design is as little design as possible. Less, but better, because it concentrates on the essential aspects.
>
> — Dieter Rams

## Links

Explore resources like [GitHub](https://github.com) or [MDN Web Docs](https://developer.mozilla.org).

---

*Resize the panels by dragging the center divider.*
`

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center px-5 h-9 shrink-0">
      <span className="text-[10px] font-medium text-foreground/20 uppercase tracking-[0.12em] select-none">
        {children}
      </span>
    </div>
  )
}

function ResizeHandle() {
  return (
    <PanelResizeHandle className="resize-handle">
      <div className="handle-line" />
    </PanelResizeHandle>
  )
}



function getCodeString(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (Array.isArray(children)) return children.map((c) => (typeof c === "string" ? c : "")).join("")
  return String(children)
}

function CodeBlock({
  inline,
  className,
  children,
  ...props
}: Readonly<React.HTMLAttributes<HTMLElement> & {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}>) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }

  const match = /language-(\w+)/.exec(className ?? "")
  const lang = match ? match[1] : "text"
  const theme = isDark ? oneDark : oneLight

  return (
    <SyntaxHighlighter
      language={lang}
      style={theme}
      PreTag="pre"
      codeTagProps={{ style: {} }}
      customStyle={{
        margin: 0,
        borderRadius: 8,
        fontSize: "12.5px",
        lineHeight: 1.7,
        padding: "1em 1.25em",
      }}
      useInlineStyles
    >
      {getCodeString(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  )
}

export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN)

  const stats = useMemo(() => {
    const words = markdown.trim().split(/\s+/).filter(Boolean).length
    const chars = markdown.length
    return { words, chars }
  }, [markdown])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value)
  }, [])

  return (
    <PanelGroup direction="horizontal" className="flex-1 min-h-0">
      {/* Editor */}
      <Panel defaultSize={50} minSize={30}>
        <div className="flex flex-col h-full">
          <PanelLabel>Editor</PanelLabel>
          <div className="flex-1 min-h-0 relative">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-background to-transparent z-10" />
            <textarea
              value={markdown}
              onChange={handleChange}
              className="editor-textarea absolute inset-0 w-full h-full resize-none bg-transparent px-5 pt-5 pb-12 text-[13px] leading-[1.8] font-mono text-foreground/75 placeholder:text-foreground/[0.15] focus:outline-none caret-accent tabular-nums"
              placeholder="Start writing..."
              spellCheck={false}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent z-10" />
            <div className="absolute bottom-3 right-5 text-[10px] text-muted-foreground/25 select-none tabular-nums z-20">
              {stats.words.toLocaleString()}w · {stats.chars.toLocaleString()}c
            </div>
          </div>
        </div>
      </Panel>

      <ResizeHandle />

      {/* Preview */}
      <Panel defaultSize={50} minSize={30}>
        <div className="flex flex-col h-full bg-foreground/[0.018] dark:bg-foreground/[0.03]">
          <PanelLabel>Preview</PanelLabel>
          <div className="flex-1 min-h-0 relative">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-foreground/[0.018] dark:from-[hsl(220_10%_4%_/_0.03)] to-transparent z-10" />
            <div className="absolute inset-0 overflow-y-auto px-6 pt-5 pb-8 custom-scrollbar">
              <article
                className="preview-prose prose prose-sm max-w-[640px] dark:prose-invert
                  prose-headings:font-sans prose-headings:text-foreground
                  prose-h1:text-[24px] prose-h1:leading-[1.2] prose-h1:mb-4 prose-h1:mt-0
                  prose-h2:text-[15px] prose-h2:leading-[1.35] prose-h2:mt-10 prose-h2:mb-3
                  prose-h3:text-[13.5px] prose-h3:leading-[1.4] prose-h3:mt-8 prose-h3:mb-2
                  prose-p:text-[13.5px] prose-p:leading-[1.85] prose-p:text-foreground/65
                  prose-strong:text-foreground/80 prose-strong:font-semibold
                  prose-em:text-foreground/60
                  prose-li:text-[13.5px] prose-li:text-foreground/65 prose-li:leading-[1.85] prose-li:my-0
                  prose-ul:my-2 prose-ol:my-2
                  prose-code:before:content-none prose-code:after:content-none prose-code:font-mono
                  prose-a:font-medium
                  prose-img:rounded-lg"
              >
                <ReactMarkdown components={{ code: CodeBlock }}>
                  {markdown}
                </ReactMarkdown>
              </article>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-foreground/[0.018] dark:from-[hsl(220_10%_4%)] to-transparent z-10" />
          </div>
        </div>
      </Panel>
    </PanelGroup>
  )
}
