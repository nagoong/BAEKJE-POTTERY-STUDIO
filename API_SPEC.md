# BAEKJE POTTERY STUDIO API

The local MVP uses a dependency-free Node.js HTTP server. The API is served from the same origin as the website.

## Run

```sh
node server.js
```

By default the server listens on `http://localhost:4173`. Set `PORT` to use another port.

## Endpoints

### `GET /api/health`

Returns `{ "status": "ok" }` when the server is ready.

### `GET /api/relics`

Returns the catalog as `{ "items": [...] }`.
Each catalog item includes its identifying and display metadata, an optional `referenceImage`/`referenceCaption`, and a `guide` object shared by the gallery and the post-creation detail screen. `guide` contains `subtitle` and `introduction`; its optional `sections` array supports ordered feature lists, paragraphs, and observation-point lists.

### `GET /api/relics/:id`

Returns a single catalog item or `404` when it does not exist.

### `GET /api/creations`

Returns saved creations, newest first, as `{ "items": [...] }`.

### `GET /api/creations/:id`

Returns a single saved creation or `404` when it does not exist.

### `POST /api/creations`

Creates a saved pottery record and returns `201` with `{ "item": {...}, "created": true }`. An idempotent migration request may return `200` with the existing item and `"created": false`.

Request body:

```json
{
  "shape": "jar",
  "detail": "round",
  "detailName": "원형 몸체",
  "options": {
    "detail": "round",
    "shoulder": true,
    "lower": true,
    "cover": "open",
    "body": "bowl",
    "depth": "deep",
    "legs": "inside"
  },
  "color": "#875844",
  "strokes": [],
  "note": "둥근 몸체에 직접 그린 장식"
}
```

`shape` must be `jar`, `pedestal`, or `threeleg`. The exhibition-only `sinbal` relic is not a maker shape. `options` stores the selected body, lid, depth, and leg settings so saved models can be reconstructed. Stroke colors and coordinates, color values, and note length are validated. An optional `migrationKey` makes migration of older browser records idempotent.

## Errors and storage

Errors use `{ "error": { "code": "...", "message": "..." } }`. Creation records are stored in the ignored runtime file `data/creations.json`; the relic catalog is committed in `data/relics.json`.

This is a local, single-user prototype: it has no authentication or production database. Do not expose it to the public internet as-is.
