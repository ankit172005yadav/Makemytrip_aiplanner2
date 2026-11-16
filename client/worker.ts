import { plannerReply } from '../server/src/services/plannerReply'

type Bindings = {
    GROQ_API_KEY?: string
    CARTO_BASEMAPS_API_KEY?: string
    PLANNER_LIMIT: { limit(options: { key: string }): Promise<{ success: boolean }> }
}

const error = (message: string, status: number) => Response.json({ error: message }, { status })

async function serveTile(path: string, key?: string) {
    const coordinates = /^\/api\/map-tiles\/(\d{1,7})\/(\d{1,7})\/(\d{1,7})\.png$/.exec(path)
    if (!coordinates) return error('Invalid tile coordinates.', 400)
    const [z, x, y] = coordinates.slice(1).map(Number)
    if (z > 19 || x >= 2 ** z || y >= 2 ** z) return error('Invalid tile coordinates.', 400)
    if (!key) return error('CARTO is unavailable.', 503)
    const url = new URL(`https://basemaps.cartocdn.com/rastertiles/dark_nolabels/${z}/${x}/${y}.png`)
    url.searchParams.set('key', key)
    try {
        const upstream = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(8000) })
        if (upstream.ok && upstream.headers.get('Content-Type')?.startsWith('image/png')) {
            return new Response(upstream.body, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'private, max-age=86400' } })
        }
        await upstream.body?.cancel()
    } catch { /* Return a generic error without exposing the upstream URL. */ }
    return error('CARTO could not return the tile.', 502)
}

async function readPlannerBody(request: Request) {
    const reader = request.body?.getReader()
    if (!reader) throw new SyntaxError()
    const decoder = new TextDecoder()
    let body = ''
    let bytes = 0
    while (true) {
        const { done, value } = await reader.read()
        if (done) return JSON.parse(body + decoder.decode())
        bytes += value.byteLength
        if (bytes > 16_384) {
            await reader.cancel()
            throw new RangeError()
        }
        body += decoder.decode(value, { stream: true })
    }
}

export default {
    async fetch(request: Request, env: Bindings) {
        const { pathname, origin } = new URL(request.url)
        if (request.method === 'GET') {
            if (pathname === '/api/health') return Response.json({ ok: true })
            if (pathname === '/api/planner/status') {
                return Response.json({ configured: Boolean(env.GROQ_API_KEY), canConnect: false }, { headers: { 'Cache-Control': 'no-store' } })
            }
            if (pathname.startsWith('/api/map-tiles/')) return serveTile(pathname, env.CARTO_BASEMAPS_API_KEY)
        }
        if (request.method === 'POST' && pathname === '/api/planner/reply') {
            if (request.headers.get('Origin') !== origin) return error('Use the trip planner to send a request.', 403)
            if (request.headers.get('Content-Type')?.split(';')[0].trim() !== 'application/json') return error('Send a JSON request.', 415)
            const { success } = await env.PLANNER_LIMIT.limit({ key: request.headers.get('CF-Connecting-IP') || 'local' })
            if (!success) return error('Too many planner requests. Try again shortly.', 429)
            let body
            try {
                body = await readPlannerBody(request)
            } catch (cause) {
                return cause instanceof RangeError ? error('Planner request is too large.', 413) : error('Invalid JSON.', 400)
            }
            return plannerReply(body, env.GROQ_API_KEY ?? '')
        }
        return error('Not found.', 404)
    },
}
