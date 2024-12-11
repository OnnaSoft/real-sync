import ReactMarkdown from 'react-markdown'

interface MarkdownRendererProps {
	readonly content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
	return (
		<div className="prose dark:prose-invert max-w-none">
			<ReactMarkdown>{content}</ReactMarkdown>
		</div>
	)
}

