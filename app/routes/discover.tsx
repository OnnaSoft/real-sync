
import { MarkdownRenderer } from '~/components/markdown-renderer';
import { useLoaderData } from "@remix-run/react";
import { promises as fs } from 'fs';
import path from "path";
import Header from '~/components/Header';
import Footer from '~/components/Footer';

export async function loader() {
  const documentPath = path.join(process.cwd(), './app/documents/discover.md');
  const markdownContent = await fs.readFile(documentPath, 'utf-8');
  return Response.json({ markdownContent });
}

export default function Discover() {
  const { markdownContent } = useLoaderData<typeof loader>();
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <div className="max-w-6xl mx-auto mb-36">
          <MarkdownRenderer content={markdownContent} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

