import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { getArticleBySlug } from "@/lib/articles";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function ArticleDetail({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold">文章不存在</h1>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
      <h1 className="text-3xl font-bold mb-4 text-slate-900">{article.title}</h1>
      <div className="flex gap-3 mb-8 text-sm text-slate-500">
        <span>{article.date}</span>
        <span className="bg-slate-100 px-2 py-0.5 rounded">{article.tag}</span>
      </div>
      <div className="prose prose-slate max-w-none prose-headings:font-bold prose-code:before:content-none prose-code:after:content-none">
        <ReactMarkdown
          components={{
            code(props) {
              // 去掉 node 解构，只拿需要的字段
              const { className, children, ...rest } = props as {
                className?: string;
                children?: React.ReactNode;
              };
              const match = /language-(\w+)/.exec(className || "");
              return match ? (
                <SyntaxHighlighter
                  style={oneDark as never}  // 解决类型不匹配
                  language={match[1]}
                  PreTag="div"
                  {...rest}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...rest}>
                  {children}
                </code>
              );
            },
          }}
        >
          {article.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
