'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, 'data');
const CATALOG_PATH = path.join(ROOT, 'data', 'relics.json');
const CREATIONS_PATH = path.join(DATA_DIR, 'creations.json');
const MAX_BODY_BYTES = 5 * 1024 * 1024;
const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || '127.0.0.1';
const SHAPES = {
  jar: '직구단경호',
  pedestal: '고배',
  threeleg: '삼족토기',
};
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mtl': 'text/plain; charset=utf-8',
  '.obj': 'application/octet-stream',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

let writeQueue = Promise.resolve();

function sendJson(response, status, value) {
  const body = JSON.stringify(value);
  response.writeHead(status, {
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
    'Content-Type': 'application/json; charset=utf-8',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(body);
}

function apiError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function readCreations() {
  const contents = await fs.promises.readFile(CREATIONS_PATH, 'utf8');
  const records = JSON.parse(contents);
  if (!Array.isArray(records)) {
    throw new Error('Creation store must contain a JSON array.');
  }
  return records;
}

async function writeCreations(records) {
  const temporaryPath = `${CREATIONS_PATH}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    await fs.promises.writeFile(temporaryPath, `${JSON.stringify(records, null, 2)}\n`, {
      encoding: 'utf8',
      flag: 'wx',
    });
    await fs.promises.rename(temporaryPath, CREATIONS_PATH);
  } catch (error) {
    await fs.promises.unlink(temporaryPath).catch(() => {});
    throw error;
  }
}

async function readJsonBody(request) {
  const chunks = [];
  let totalBytes = 0;
  for await (const chunk of request) {
    totalBytes += chunk.length;
    if (totalBytes > MAX_BODY_BYTES) {
      throw apiError(413, 'PAYLOAD_TOO_LARGE', '요청 본문은 5MB 이하여야 합니다.');
    }
    chunks.push(chunk);
  }
  if (totalBytes === 0) {
    throw apiError(400, 'EMPTY_BODY', 'JSON 요청 본문이 필요합니다.');
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw apiError(400, 'INVALID_JSON', '올바른 JSON 형식이 아닙니다.');
  }
}

function validateColor(value, fieldName) {
  if (typeof value !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(value)) {
    throw apiError(400, 'INVALID_COLOR', `${fieldName}은 #RRGGBB 형식이어야 합니다.`);
  }
  return value;
}

function validateStrokes(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 500) {
    throw apiError(400, 'INVALID_STROKES', '그림은 최대 500개의 획까지 저장할 수 있습니다.');
  }
  let totalPoints = 0;
  return value.map((stroke) => {
    if (!stroke || typeof stroke !== 'object' || !Array.isArray(stroke.points) || stroke.points.length === 0) {
      throw apiError(400, 'INVALID_STROKE', '그림 획에는 하나 이상의 좌표가 필요합니다.');
    }
    totalPoints += stroke.points.length;
    if (stroke.points.length > 10000 || totalPoints > 50000) {
      throw apiError(400, 'TOO_MANY_POINTS', '그림의 좌표가 저장 한도를 초과했습니다.');
    }
    const color = validateColor(stroke.color, '붓 색상');
    const size = Number(stroke.size);
    if (!Number.isFinite(size) || size < 1 || size > 36) {
      throw apiError(400, 'INVALID_BRUSH_SIZE', '붓 굵기는 1에서 36 사이여야 합니다.');
    }
    const points = stroke.points.map((point) => {
      const x = Number(point?.x);
      const y = Number(point?.y);
      if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) {
        throw apiError(400, 'INVALID_POINT', '그림 좌표는 0에서 1 사이여야 합니다.');
      }
      return { x, y };
    });
    return { color, size, points };
  });
}

function validateCreationOptions(value) {
  const defaults = {
    detail: 'round',
    shoulder: true,
    lower: true,
    cover: 'open',
    body: 'bowl',
    depth: 'deep',
    legs: 'inside',
  };
  if (value === undefined) return defaults;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw apiError(400, 'INVALID_OPTIONS', '제작 옵션은 JSON 객체여야 합니다.');
  }
  const options = { ...defaults, ...value };
  if (!['round', 'oval'].includes(options.detail)
    || typeof options.shoulder !== 'boolean'
    || typeof options.lower !== 'boolean'
    || !['open', 'closed'].includes(options.cover)
    || !['bowl', 'dish'].includes(options.body)
    || !['deep', 'shallow'].includes(options.depth)
    || !['inside', 'outside'].includes(options.legs)) {
    throw apiError(400, 'INVALID_OPTIONS', '선택한 세부 형태가 올바르지 않습니다.');
  }
  return options;
}

function validateCreation(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw apiError(400, 'INVALID_BODY', '제작 기록은 JSON 객체여야 합니다.');
  }
  if (!Object.hasOwn(SHAPES, body.shape)) {
    throw apiError(400, 'INVALID_SHAPE', '지원하지 않는 토기 형태입니다.');
  }
  const detail = typeof body.detail === 'string' ? body.detail : '';
  const detailName = typeof body.detailName === 'string' ? body.detailName : '';
  const note = typeof body.note === 'string' ? body.note.trim() : '';
  if (detail.length > 80 || detailName.length > 160 || note.length > 1000) {
    throw apiError(400, 'FIELD_TOO_LONG', '세부 형태 또는 메모의 길이가 너무 깁니다.');
  }
  const migrationKey = body.migrationKey;
  if (migrationKey !== undefined && (typeof migrationKey !== 'string' || migrationKey.length > 120)) {
    throw apiError(400, 'INVALID_MIGRATION_KEY', '이전 기록 식별자가 올바르지 않습니다.');
  }
  return {
    shape: body.shape,
    shapeName: SHAPES[body.shape],
    detail,
    detailName,
    options: validateCreationOptions(body.options),
    pattern: 'none',
    patternName: '직접 그린 창작 문양',
    color: validateColor(body.color, '토기 색상'),
    strokes: validateStrokes(body.strokes),
    note,
    migrationKey,
  };
}

async function createCreation(body) {
  const input = validateCreation(body);
  const task = writeQueue.then(async () => {
    const records = await readCreations();
    if (input.migrationKey) {
      const existing = records.find((record) => record.migrationKey === input.migrationKey);
      if (existing) return { item: existing, created: false };
    }
    const now = new Date();
    const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' })
      .format(now)
      .replaceAll('-', '.');
    const ordinal = ['첫 번째', '두 번째', '세 번째', '네 번째'][Math.min(records.length, 3)];
    const item = {
      id: crypto.randomUUID(),
      title: `나의 ${ordinal} 백제 토기`,
      date,
      createdAt: now.toISOString(),
      ...input,
    };
    records.unshift(item);
    await writeCreations(records);
    return { item, created: true };
  });
  writeQueue = task.then(() => undefined, () => undefined);
  return task;
}

async function handleApi(request, response, url) {
  const pathname = decodeURIComponent(url.pathname);
  if (pathname === '/api/health' && request.method === 'GET') {
    sendJson(response, 200, { status: 'ok' });
    return;
  }
  if (pathname === '/api/relics' && request.method === 'GET') {
    const catalog = JSON.parse(await fs.promises.readFile(CATALOG_PATH, 'utf8'));
    sendJson(response, 200, { items: catalog });
    return;
  }
  const relicMatch = pathname.match(/^\/api\/relics\/([^/]+)$/);
  if (relicMatch && request.method === 'GET') {
    const catalog = JSON.parse(await fs.promises.readFile(CATALOG_PATH, 'utf8'));
    const relic = catalog.find((item) => item.id === relicMatch[1]);
    if (!relic) throw apiError(404, 'RELIC_NOT_FOUND', '유물 정보를 찾을 수 없습니다.');
    sendJson(response, 200, { item: relic });
    return;
  }
  if (pathname === '/api/creations' && request.method === 'GET') {
    sendJson(response, 200, { items: await readCreations() });
    return;
  }
  if (pathname === '/api/creations' && request.method === 'POST') {
    const result = await createCreation(await readJsonBody(request));
    sendJson(response, result.created ? 201 : 200, result);
    return;
  }
  const creationMatch = pathname.match(/^\/api\/creations\/([^/]+)$/);
  if (creationMatch && request.method === 'GET') {
    const record = (await readCreations()).find((item) => item.id === creationMatch[1]);
    if (!record) throw apiError(404, 'CREATION_NOT_FOUND', '제작 기록을 찾을 수 없습니다.');
    sendJson(response, 200, { item: record });
    return;
  }
  if (pathname.startsWith('/api/')) {
    throw apiError(404, 'ENDPOINT_NOT_FOUND', 'API 경로를 찾을 수 없습니다.');
  }
  throw apiError(405, 'METHOD_NOT_ALLOWED', '지원하지 않는 API 요청 방식입니다.');
}

async function serveStatic(request, response, url) {
  if (!['GET', 'HEAD'].includes(request.method)) {
    sendJson(response, 405, { error: { code: 'METHOD_NOT_ALLOWED', message: 'GET 요청만 지원합니다.' } });
    return;
  }
  const pathname = decodeURIComponent(url.pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(ROOT, relativePath);
  const pathFromRoot = path.relative(ROOT, filePath);
  if (pathFromRoot.startsWith('..') || pathFromRoot.split(path.sep).includes('.git')) {
    sendJson(response, 403, { error: { code: 'FORBIDDEN', message: '요청한 파일을 제공할 수 없습니다.' } });
    return;
  }
  if (pathFromRoot === 'data' || pathFromRoot.startsWith(`data${path.sep}`)) {
    sendJson(response, 403, { error: { code: 'FORBIDDEN', message: '데이터 파일은 API를 통해서만 접근할 수 있습니다.' } });
    return;
  }
  let stat;
  try {
    stat = await fs.promises.stat(filePath);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ENOTDIR') {
      sendJson(response, 404, { error: { code: 'FILE_NOT_FOUND', message: '파일을 찾을 수 없습니다.' } });
      return;
    }
    throw error;
  }
  if (!stat.isFile()) {
    sendJson(response, 404, { error: { code: 'FILE_NOT_FOUND', message: '파일을 찾을 수 없습니다.' } });
    return;
  }
  const realPath = await fs.promises.realpath(filePath);
  if (!realPath.startsWith(`${ROOT}${path.sep}`)) {
    sendJson(response, 403, { error: { code: 'FORBIDDEN', message: '요청한 파일을 제공할 수 없습니다.' } });
    return;
  }
  response.writeHead(200, {
    'Cache-Control': 'no-cache',
    'Content-Length': stat.size,
    'Content-Type': MIME_TYPES[path.extname(realPath).toLowerCase()] || 'application/octet-stream',
    'X-Content-Type-Options': 'nosniff',
  });
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  const stream = fs.createReadStream(realPath);
  stream.on('error', (error) => {
    console.error('Static file read failed:', error);
    response.destroy(error);
  });
  stream.pipe(response);
}

async function handleRequest(request, response) {
  let url;
  try {
    url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      await handleApi(request, response, url);
    } else {
      await serveStatic(request, response, url);
    }
  } catch (error) {
    const status = Number.isInteger(error.status) ? error.status : 500;
    if (status >= 500) console.error('Request failed:', error);
    if (!response.headersSent) {
      sendJson(response, status, {
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: status >= 500 ? '요청을 처리하지 못했습니다.' : error.message,
        },
      });
    } else {
      response.destroy(error);
    }
  }
}

async function start() {
  await fs.promises.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.promises.access(CREATIONS_PATH);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await fs.promises.writeFile(CREATIONS_PATH, '[]\n', { encoding: 'utf8', flag: 'wx' });
  }
  const server = http.createServer(handleRequest);
  server.listen(PORT, HOST, () => {
    console.log(`BAEKJE POTTERY STUDIO listening at http://${HOST}:${PORT}`);
  });
  server.on('error', (error) => {
    console.error('HTTP server failed:', error);
    process.exitCode = 1;
  });
}

start().catch((error) => {
  console.error('Unable to start BAEKJE POTTERY STUDIO:', error);
  process.exitCode = 1;
});
