"use client"

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useDeferredValue,
  Component,
} from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
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

## Tables

| Feature       | Status    | Priority |
| ------------- | --------- | -------- |
| Live preview  | Done      | High     |
| GFM support   | Done      | High     |
| Dark mode     | Done      | Medium   |
| Export to PDF  | Planned   | Low      |

## Task Lists

- [x] Set up markdown parser
- [x] Add syntax highlighting
- [x] Implement GFM support
- [ ] Add export functionality
- [ ] Write documentation

## Links

Explore resources like [GitHub](https://github.com) or [MDN Web Docs](https://developer.mozilla.org).

---

*Resize the panels by dragging the center divider.*
`

// ---------------------------------------------------------------------------
// Error Boundary – prevents malformed markdown from crashing the whole app
// ---------------------------------------------------------------------------
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class PreviewErrorBoundary extends Component<
  { children: React.ReactNode; markdown: string },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; markdown: string }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidUpdate(prevProps: { markdown: string }) {
    // Reset error state when the user edits the markdown (give them a chance to fix it)
    if (prevProps.markdown !== this.props.markdown && this.state.hasError) {
      this.setState({ hasError: false, error: null })
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="preview-error">
          <div className="preview-error-icon">!</div>
          <p className="preview-error-title">Preview unavailable</p>
          <p className="preview-error-detail">
            Something in your markdown caused a rendering error. Edit the source to recover.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

// ---------------------------------------------------------------------------
// Small UI helpers
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Code utilities
// ---------------------------------------------------------------------------
function getCodeString(children: React.ReactNode): string {
  if (typeof children === "string") return children
  if (Array.isArray(children))
    return children.map((c) => (typeof c === "string" ? c : "")).join("")
  if (
    React.isValidElement(children) &&
    (children as React.ReactElement<{ children?: React.ReactNode }>).props.children
  ) {
    return getCodeString(
      (children as React.ReactElement<{ children?: React.ReactNode }>).props.children
    )
  }
  return String(children ?? "")
}

// ---------------------------------------------------------------------------
// Copy-to-clipboard button for code blocks
// ---------------------------------------------------------------------------
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 1800)
    })
  }, [text])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="code-copy-btn"
      aria-label={copied ? "Copied" : "Copy code"}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------------
// CodeBlock – handles both inline and fenced code
// ---------------------------------------------------------------------------
function CodeBlock({
  className,
  children,
  node,
  ...props
}: Readonly<
  React.HTMLAttributes<HTMLElement> & {
    className?: string
    children?: React.ReactNode
    node?: unknown
  }
>) {
  const { resolvedTheme } = useTheme()
  // Fallback to "light" during SSR / before hydration to avoid flash
  const isDark = resolvedTheme === "dark"

  // react-markdown v9: inline code has no className, block code has className="language-xxx"
  // Additionally, block code is rendered inside a <pre> by react-markdown, so if there's
  // no language class, this is inline code.
  const match = /language-(\w+)/.exec(className ?? "")
  const isInline = !match

  if (isInline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  }

  const lang = match[1]
  const theme = isDark ? oneDark : oneLight
  const codeStr = getCodeString(children).replace(/\n$/, "")

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-block-lang">{lang}</span>
        <CopyButton text={codeStr} />
      </div>
      <SyntaxHighlighter
        language={lang}
        style={theme}
        PreTag="pre"
        codeTagProps={{ style: {} }}
        customStyle={{
          margin: 0,
          borderRadius: "0 0 8px 8px",
          fontSize: "12.5px",
          lineHeight: 1.7,
          padding: "1em 1.25em",
        }}
        useInlineStyles
      >
        {codeStr}
      </SyntaxHighlighter>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Memoised markdown components map – stable reference across renders
// ---------------------------------------------------------------------------
function useMarkdownComponents() {
  return useMemo(
    () => ({
      code: CodeBlock,
      table: ({
        children,
        ...props
      }: React.HTMLAttributes<HTMLTableElement> & { node?: unknown }) => (
        <div className="table-wrapper">
          <table {...props}>{children}</table>
        </div>
      ),
      input: ({
        type,
        checked,
        ...props
      }: React.InputHTMLAttributes<HTMLInputElement> & { node?: unknown }) => {
        if (type === "checkbox") {
          return (
            <input
              type="checkbox"
              checked={checked}
              disabled
              className="task-checkbox"
              {...props}
            />
          )
        }
        return <input type={type} {...props} />
      },
      img: ({
        src,
        alt,
        ...props
      }: React.ImgHTMLAttributes<HTMLImageElement> & { node?: unknown }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget
            target.style.display = "none"
            const fallback = document.createElement("span")
            fallback.className = "img-error-fallback"
            fallback.textContent = alt ? `Image: ${alt}` : "Image failed to load"
            target.parentNode?.insertBefore(fallback, target)
          }}
          {...props}
        />
      ),
    }),
    []
  )
}

// ---------------------------------------------------------------------------
// Remarkplugins – stable array reference
// ---------------------------------------------------------------------------
const remarkPlugins = [remarkGfm]

// ---------------------------------------------------------------------------
// Scroll-sync hook
// ---------------------------------------------------------------------------
function useScrollSync(
  editorRef: React.RefObject<HTMLTextAreaElement | null>,
  previewRef: React.RefObject<HTMLDivElement | null>
) {
  const isEditorScrolling = useRef(false)
  const isPreviewScrolling = useRef(false)
  const editorRaf = useRef<number>(0)
  const previewRaf = useRef<number>(0)

  useEffect(() => {
    const editor = editorRef.current
    const preview = previewRef.current
    if (!editor || !preview) return

    const syncPreviewToEditor = () => {
      if (isPreviewScrolling.current) return
      isEditorScrolling.current = true
      cancelAnimationFrame(editorRaf.current)
      editorRaf.current = requestAnimationFrame(() => {
        const editorMax = editor.scrollHeight - editor.clientHeight
        const ratio = editorMax > 0 ? editor.scrollTop / editorMax : 0
        const previewMax = preview.scrollHeight - preview.clientHeight
        preview.scrollTop = ratio * previewMax
        // Reset flag after a tick to avoid feedback loops
        requestAnimationFrame(() => {
          isEditorScrolling.current = false
        })
      })
    }

    const syncEditorToPreview = () => {
      if (isEditorScrolling.current) return
      isPreviewScrolling.current = true
      cancelAnimationFrame(previewRaf.current)
      previewRaf.current = requestAnimationFrame(() => {
        const previewMax = preview.scrollHeight - preview.clientHeight
        const ratio = previewMax > 0 ? preview.scrollTop / previewMax : 0
        const editorMax = editor.scrollHeight - editor.clientHeight
        editor.scrollTop = ratio * editorMax
        requestAnimationFrame(() => {
          isPreviewScrolling.current = false
        })
      })
    }

    editor.addEventListener("scroll", syncPreviewToEditor, { passive: true })
    preview.addEventListener("scroll", syncEditorToPreview, { passive: true })

    return () => {
      editor.removeEventListener("scroll", syncPreviewToEditor)
      preview.removeEventListener("scroll", syncEditorToPreview)
      cancelAnimationFrame(editorRaf.current)
      cancelAnimationFrame(previewRaf.current)
    }
  }, [editorRef, previewRef])
}

// ---------------------------------------------------------------------------
// Main editor component
// ---------------------------------------------------------------------------
export function MarkdownEditor() {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN)
  // useDeferredValue lets React deprioritize the preview re-render while the
  // user is actively typing, keeping the editor input responsive.
  const deferredMarkdown = useDeferredValue(markdown)
  const isPending = markdown !== deferredMarkdown

  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const previewRef = useRef<HTMLDivElement | null>(null)

  const components = useMarkdownComponents()

  useScrollSync(editorRef, previewRef)

  const stats = useMemo(() => {
    const text = deferredMarkdown.trim()
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0
    const chars = deferredMarkdown.length
    return { words, chars }
  }, [deferredMarkdown])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setMarkdown(e.target.value)
    },
    []
  )

  return (
    <PanelGroup direction="horizontal" className="flex-1 min-h-0">
      {/* Editor */}
      <Panel defaultSize={50} minSize={30}>
        <div className="flex flex-col h-full">
          <PanelLabel>Editor</PanelLabel>
          <div className="flex-1 min-h-0 relative">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-background to-transparent z-10" />
            <textarea
              ref={editorRef}
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
            <div
              ref={previewRef}
              className={`absolute inset-0 overflow-y-auto px-6 pt-5 pb-8 custom-scrollbar${
                isPending ? " preview-pending" : ""
              }`}
            >
              <PreviewErrorBoundary markdown={deferredMarkdown}>
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
                  {deferredMarkdown ? (
                    <ReactMarkdown
                      remarkPlugins={remarkPlugins}
                      components={components}
                    >
                      {deferredMarkdown}
                    </ReactMarkdown>
                  ) : (
                    <div className="preview-empty">
                      <p>Nothing to preview</p>
                      <p>Start typing in the editor to see a live preview here.</p>
                    </div>
                  )}
                </article>
              </PreviewErrorBoundary>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-foreground/[0.018] dark:from-[hsl(220_10%_4%)] to-transparent z-10" />
          </div>
        </div>
      </Panel>
    </PanelGroup>
  )
}
