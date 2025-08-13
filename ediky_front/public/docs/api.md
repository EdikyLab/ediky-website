
# API -- Quick Reference

**Base URL**<br>
`https://your-domain.com/api/v1` _(replace with your deployment)_

**Content type**<br>
All requests/returns use `application/json; charset=utf-8`.

**Auth**<br>
Use a **Bearer token** in the `Authorization` header:

```
Authorization: Bearer <TOKEN>

`
```

--------------------------------------------------------------------------------

## Conventions

- **Timestamps**: ISO 8601 (`2025-08-09T12:34:56Z`)
- **IDs**: strings (ULIDs/UUIDs)
- **Pagination**: `?limit=<int>&cursor=<string>`
- **Errors**: consistent shape:

  ```json
  {
  "error": { "code": "not_found", "message": "Document not found" }
  }
  `
  ```

--------------------------------------------------------------------------------

## Health

### GET `/health`

Checks service status.

**200**

```json
{ "ok": true, "service": "docs-api", "version": "1.0.0" }
```

--------------------------------------------------------------------------------

## Auth (example)

### POST `/auth/login`

Login with email/password (or exchange a Firebase ID token if you use Firebase).

**Request**

```json
{ "email": "user@example.com", "password": "secret" }
```

**200**

```json
{ "token": "JWT_OR_ID_TOKEN", "user": { "id": "uid_123", "email": "user@example.com" } }
```

--------------------------------------------------------------------------------

## Docs

### GET `/docs/:file`

Fetch a Markdown document by file name.

**Example**: `/docs/intro.md`

**200**

```json
{
  "file": "intro.md",
  "title": "Intro to C++ & Python",
  "content": "# Heading\n\nMarkdown body…",
  "updatedAt": "2025-08-09T11:20:00Z"
}
```

**404**

```json
{ "error": { "code": "not_found", "message": "File not found" } }
```

--------------------------------------------------------------------------------

## Annotations

### GET `/annotations`

List annotations for a document.

**Query**

- `docId` (required) -- e.g. `"docs_intro_md"`
- `limit`, `cursor` (optional)

**200**

```json
{
  "items": [
    { "id": "a1", "type": "highlight", "text": "Hello", "color": "#fff59d", "opacity": 0.8, "createdAt": "2025-08-09T10:00:00Z" },
    { "id": "a2", "type": "underline", "text": "world", "color": "#4f80ff", "thickness": 2, "style": "solid", "createdAt": "2025-08-09T10:05:00Z" }
  ],
  "nextCursor": null
}
```

--------------------------------------------------------------------------------

### POST `/annotations`

Create an annotation (highlight/underline/note).

**Request**

```json
{
  "docId": "docs_intro_md",
  "type": "note",                    // "highlight" | "underline" | "note"
  "text": "Selected snippet…",
  "note": "My comment (for type=note)",
  "color": "#fff59d",
  "opacity": 0.85,
  "thickness": 2,
  "style": "solid"
}
```

**201**

```json
{
  "id": "a3",
  "docId": "docs_intro_md",
  "type": "note",
  "text": "Selected snippet…",
  "note": "My comment (for type=note)",
  "createdAt": "2025-08-09T10:10:00Z"
}
```

**400**

```json
{ "error": { "code": "bad_request", "message": "Missing docId or type" } }
```

--------------------------------------------------------------------------------

### DELETE `/annotations/:id`

Remove a single annotation.

**200**

```json
{ "deleted": true, "id": "a3" }
```

**404**

```json
{ "error": { "code": "not_found", "message": "Annotation not found" } }
```

--------------------------------------------------------------------------------

## Examples

### cURL

```bash
# List annotations
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://your-domain.com/api/v1/annotations?docId=docs_intro_md"

# Add a note
curl -s -X POST -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"docId":"docs_intro_md","type":"note","text":"Intro para","note":"Re-read later"}' \
  https://your-domain.com/api/v1/annotations
```

### fetch (JS)

```javascript
const BASE = "https://your-domain.com/api/v1";
const token = "YOUR_TOKEN";

const res = await fetch(`${BASE}/annotations?docId=docs_intro_md`, {
  headers: { Authorization: `Bearer ${token}` }
});
const data = await res.json();
console.log(data.items);
```

--------------------------------------------------------------------------------

## Status Codes

- **200** OK -- success
- **201** Created -- resource created
- **400** Bad Request -- invalid input
- **401** Unauthorized -- missing/invalid token
- **403** Forbidden -- not allowed
- **404** Not Found -- resource missing
- **429** Too Many Requests -- rate limit
- **500** Server Error -- unexpected failure