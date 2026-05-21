# GEO Knowledge Base

Place the Obsidian Markdown files for GEO best practices in this folder.

Run:

```bash
pnpm kb:index
```

The indexer reads all nested `.md` files, splits them by H2/H3 headings, creates `text-embedding-3-small` embeddings, and upserts them into `knowledge_chunks`.
