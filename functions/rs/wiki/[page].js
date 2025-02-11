export function onRequest(context) {
    return new Response(context.data)
}