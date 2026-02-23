import { TopNav } from "@/components/top-nav"
import { MarkdownEditor } from "@/components/markdown-editor"

export default function Page() {
  return (
    <div className="flex flex-col h-dvh bg-background">
      <TopNav />
      <main className="flex flex-1 min-h-0">
        <MarkdownEditor />
      </main>
    </div>
  )
}
