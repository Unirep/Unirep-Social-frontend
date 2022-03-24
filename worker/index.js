import { getAssetFromKV } from '@cloudflare/kv-asset-handler'

// Enables edge cdn - https://developers.cloudflare.com/workers/learning/how-the-cache-works/
const DEBUG = true
const ENABLE_ASSET_CACHE = false

addEventListener('fetch', (event) => {
    event.respondWith(generateResponse(event))
})

async function generateResponse(event) {
    // https://www.npmjs.com/package/@cloudflare/kv-asset-handler#optional-arguments
    const asset = await getAssetFromKV(event, {
        bypassCache: !ENABLE_ASSET_CACHE,
    })
    let body = asset.body
    if (ENABLE_ASSET_CACHE) {
        // put the asset in the cache
        // split the response stream, give one to the cache
        if (DEBUG) {
            console.log('Stream split')
        }
        const [b1, b2] = asset.body.tee()
        // cause the script to stay alive until this promise resolves
        event.waitUntil(
            caches.default.put(event.request.url, new Response(b1, asset))
        )
        body = b2
    }
    // build response from body
    const response = new Response(body, asset)
    response.headers.set('Referrer-Policy', 'unsafe-url')
    return response
}
