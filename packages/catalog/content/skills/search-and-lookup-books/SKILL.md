---
name: search-and-lookup-books
description: "CLI for AI agents to search and lookup books for their humans. Uses Open Library API. No auth required."
category: "AI & Agents"
author: community
version: "1.0.0"
icon: bot
---

# Book Lookup

CLI for AI agents to search and lookup books for their humans. "What's that fantasy series about the magic university?" — now your agent can answer.

Uses Open Library API. No account or API key needed.

## Usage

```
"Search for books called The Name of the Wind"
"Find books by Patrick Rothfuss"
"Tell me about work ID OL27448W"
"Who is author OL23919A?"
```

## Commands

| Action | Command |
|--------|---------|
| Search | `books search "query"` |
| Get book details | `books info <work_id>` |
| Get author info | `books author <author_id>` |

### Examples

```bash
books search "the name of the wind"     # Find books by title
books search "author:brandon sanderson" # Search by author
books info OL27448W                     # Get full details by work ID
books author OL23919A                   # Get author bio and works
```

## Output

**Search output:**
```
[OL27448W] The Name of the Wind — Patrick Rothfuss, 2007, ⭐ 4.5
```

**Info output:**
```
📚 The Name of the Wind
   Work ID: OL27448W
   First Published: March 27, 2007
   Subjects: Fantasy, Magic, Coming of Age

📖 Description:
[Full description text]

🖼️ Cover: https://covers.openlibrary.org/b/id/12345-L.jpg
```

**Author output:**
```
👤 Patrick Rothfuss
   Born: June 6, 1973
   Author ID: OL23919A

📖 Bio:
[Author biography]

=== Works ===
[OL27448W] The Name of the Wind, 2007
[OL16313124W] The Wise Man's Fear, 2011
```

## Notes

- Uses Open Library API (openlibrary.org)
- No authentication required
- Work IDs look like: OL27448W
- Author IDs look like: OL23919A
- Search supports `author:`, `title:`, `subject:` prefixes
- Cover images available in S, M, L sizes

---

## Agent Implementation Notes

**Script location:** `{skill_folder}/books` (wrapper to `scripts/books`)

**When user asks about books:**
1. Run `./books search "title or author"` to find work ID
2. Run `./books info <work_id>` for full details
3. Run `./books author <author_id>` for author info and bibliography

**Search tips:**
- Use `author:name` to search specifically by author
- Use `title:name` to search specifically by title
- Use `subject:topic` to search by genre/subject

**Don't use for:** E-books, audiobooks, purchasing, or reading the actual content.
