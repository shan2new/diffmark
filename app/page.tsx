import { TopNav } from "@/components/top-nav"
import { AboutAndFaq } from "@/components/about-and-faq"
import { MarkdownEditor } from "@/components/markdown-editor"

export default function Page() {
  return (
    <div className="flex flex-col h-dvh bg-background">
      <TopNav />
      <AboutAndFaq />
      <main className="flex flex-1 min-h-0">
        <MarkdownEditor />
      </main>
    </div>
  )
}
