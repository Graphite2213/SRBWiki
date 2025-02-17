export async function onRequest(context)
{
    const locale = "en";

    const { request, env } = context;
    const newurl = `https://${request.host}.rs/${locale}/home`;
    const response = await env.ASSETS.fetch(newurl);
    let html = await response.text();

    const featuredFetch = await fetch(`https://data.graphite.in.rs/${locale}/featured.html`);
    const newsFetch = await fetch(`https://data.graphite.in.rs/${locale}/news.html`);

    const featured = await featuredFetch.text();
    const news = await newsFetch.text();

    html = html.replaceAll(`<i-featured></i-featured>`, featured);
    html = html.replaceAll(`<i-news></i-news>`, news);

    return new Response(html, response);
}