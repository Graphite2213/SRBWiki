export async function onRequest(context)
{
    const locale = "rs";
    const pageTitle = decodeURIComponent(context.params.page);

    const { request, env } = context;
    const newurl = `https://${request.host}.rs/${locale}/wiki`;
    const response = await env.ASSETS.fetch(newurl);
    let html = await response.text();

    const articleFetch = await fetch(`https://data.graphite.in.rs/${locale}/${pageTitle}/${pageTitle.toLowerCase()}.html`);
    const metaFetch = await fetch(`https://data.graphite.in.rs/${locale}/${pageTitle}/${pageTitle.toLowerCase()}.json`);
    if (articleFetch.status == 404 || metaFetch.status == 404)
    {
        const placeholderFetch = await fetch(`https://data.graphite.in.rs/${locale}/placeholder.html`);
        const placeholder = await placeholderFetch.text();

        html = html.replace(`<div id="postText"></div>`, `<div id="postText">${placeholder}</div>`);
        html = html.replace(`<meta property="og:title" content="">`, `<meta property="og:title" content="${pageTitle}">`);
        html = html.replace(`<div id="postTitle"></div>`, `<div id="postTitle">${pageTitle}</div>`);
        html = html.replace(`<title>SrbijaWiki</title>`, `<title>${pageTitle} - SRBWiki</title>`);
        html = html.replace(`':pe:'`, `false`);
        html = html.replace(`<meta property="og:description" content="">`, `<meta property="og:description" content="Stranica sa ovim imenom ne postoji na SrbijaWiki. Možete je stvoriti.">`);
        html = html.replace(`<meta name="description" content="">`, `<meta name="description" content="Stranica sa ovim imenom ne postoji na SrbijaWiki. Možete je stvoriti.">`);
        html = html.replace(`<meta property="og:image" content="">`, `<meta property="og:image" content="/images/logo.png">`);
        return new Response(html, response);
    }

    let article = await articleFetch.text();
    article = WikiWhitelines(article);
    const _meta = await metaFetch.json();

    html = html.replace(`':pe:'`, `true`);
    html = html.replace(`<div id="postTitle"></div>`, `<div id="postTitle">${pageTitle}</div>`);
    html = html.replace(`<title>SrbijaWiki</title>`, `<title>${pageTitle} - SRBWiki</title>`);
    html = html.replace(`<meta name="description" content="">`, `<meta name="description" content="${_meta.description}">`);
    html = html.replace(`<meta name="keywords" content="">`, `<meta name="keywords" content="${_meta.keywords.join(", ")}">`);
    html = html.replace(`<meta property="og:title" content="">`, `<meta property="og:title" content="SRBWiki - ${pageTitle}">`);
    html = html.replace(`<meta property="og:description" content="">`, `<meta property="og:description" content="${_meta.description}">`);
    html = html.replace(`<meta property="og:url" content="">`, `<meta property="og:url" content="${request.url}">`);
    html = html.replace(`<meta property="og:image" content="">`, `<meta property="og:image" content="https://data.graphite.in.rs/${locale}/${pageTitle}/Images/${_meta.image}">`);
    html = html.replace(`<div id="postText"></div>`, `<div id="postText">${article}</div>`);

    return new Response(html, response);
}

function WikiWhitelines(text)
{
    const splitted = text.replaceAll("<p>", "").replaceAll("</p>", "").split(/\n\s*\n/);
    const arr = [];
    let styleCheck = false;

    splitted.forEach(x =>
    {
        if (x.includes("<style>")) styleCheck = true;
        if (x.includes("</style>")) styleCheck = false;
        if (
            !x.includes('<w-reflist') &&
            !x.includes('<w-annotation') &&
            !x.includes('<w-infobox') &&
            !x.includes('<w-h') &&
            !x.includes('<w-drop') &&
            !x.includes('</w-drop') &&
            !x.includes('<w-img') &&
            !x.includes('<wvs-') &&
            !x.includes('<wi-') &&
            !styleCheck
        )
        {
            arr.push(`<p>${x}</p>`);
        } else arr.push(x);
    });

    return arr.join('\n\n');
}