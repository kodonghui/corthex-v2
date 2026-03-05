import ReactMarkdown from 'react-markdown'

const markdownStyles = [
  '[&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-3',
  '[&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-2',
  '[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1',
  '[&_p]:mb-2',
  '[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2',
  '[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2',
  '[&_li]:mb-0.5',
  '[&_code]:bg-zinc-200 [&_code]:dark:bg-zinc-700 [&_code]:px-1 [&_code]:rounded [&_code]:text-xs',
  '[&_pre]:bg-zinc-200 [&_pre]:dark:bg-zinc-700 [&_pre]:p-3 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-2',
  '[&_blockquote]:border-l-2 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-500',
  '[&_strong]:font-semibold',
  '[&_a]:text-indigo-600 [&_a]:underline',
].join(' ')

export function MarkdownRenderer({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  return (
    <div className={`text-sm leading-relaxed ${markdownStyles} ${className || ''}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
