// Base wiki elements
import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { unsafeHTML } from 'https://unpkg.com/lit-html@3.1.3/directives/unsafe-html.js';

// URL validator args
const validatorArgs = {
	protocols: ['http', 'https', 'ftp'],
	require_tld: true,
	require_protocol: true,
	require_host: true,
	require_port: false,
	require_valid_protocol: true,
	allow_underscores: true,
	host_whitelist: false,
	host_blacklist: true,
	allow_trailing_dot: true,
	allow_protocol_relative_urls: true,
	allow_fragments: true,
	allow_query_components: true,
	disallow_auth: false,
	validate_length: false
};

class WikiImage extends LitElement
{
	// You can set these properties in the HTML too
	static properties = {
		url: "",
		caption: ""
	};

	static styles = css`
	figure {
		background-color: var(--infobox-bg);
		border: 1px gray solid;
		color: var(--text-color) !important;
		font-size: 0.9em;
		text-align: center;
		float: right;
    	clear: right;
		margin: 0.5em 0 0.5em 1em;
		width: min-content;
	}

	img {
		width: 15vw;
		min-width: 250px;
    	height: auto;
    	padding: 2px;
    	background-color: var(--infobox-bg);
		float: right;
	}

	figcaption {
		background-color: var(--infobox-bg);
    	padding: 5px;
		padding-top: 0;
	}

	@media (max-width:780px)  {
		figure {
			float: none;
    		clear: none;
			margin-right: auto;
			margin-left: auto;
		}

		img {
			width: 65vw;
        	float: right;
        	clear: right;
		}
	}

  	`;

	constructor()
	{
		super();
		const tx = this.textContent;
		const elem = tx.split("|");
		// If no |, everything is the image link
		if (elem.length == 1) this.url = tx;
		else
		{
			// Otherwise caption first, url second
			this.url = elem[1];
			this.caption = elem[0];
		}

		// If its not a full URL already turn it into one
		if (!validator.isURL(this.url, validatorArgs))
		{
			if (typeof pageTitle == "undefined") return console.warn("W: Page title is undefined, assuming sandbox. Not loading image.");
			this.url = fetchURL + `${locale}/${pageTitle}/Images/${encodeURI(this.url)}`;
		}
	}

	render()
	{
		//<w-img> Caption|URL </w-img>
		return html`<figure class="imgWrapper">
			<img src="${this.url}" class="postImg">
			<figcaption class="imgCaption">${this.caption}</figcaption>
		</figure>`;
	}
}

class WikiLink extends LitElement
{
	static properties = {
		url: "",
		caption: "",
		external: true,
		_exists: "",
		_wikiAddon: ""
	};

	// For some unknown shadow css reasons .InternalLink isnt colored properly even though its supposed to inherit the default link style
	static styles = css`
		a {
			cursor: pointer;
			color: var(--link-basic-color);
			cursor: pointer;
			text-decoration: none;
		}

		:hover {
    		text-decoration: underline;
    		color: var(--link-hover-color);
		}

		:visited {
    		color: var(--link-visited-color);
		}


		.nonExistent {
			color: var(--link-nonexistent-color);
		}

		.nonExistent:hover {
			color: var(--link-nonexistent-color);
			text-decoration: underline;
		}

		.nonExistent:visited {
    		color: var(--link-nonexistent-color);
		}

		.externalLink {
			background-image: url(https://en.wikipedia.org/w/skins/Vector/resources/skins.vector.styles.legacy/images/link-external-small-ltr-progressive.svg?fb64d);
			background-position: center right;
    		background-repeat: no-repeat;
    		padding-right: 1em;
    		cursor: pointer;
		}
	`;

	// Generate wikilink from title
	GenerateWikilink(name)
	{
		PageExists(locale, name).then((exists) =>
		{
			this.external = false;
			this._exists = !exists ? " nonExistent" : "";
			this.url = `${selfURL}/${locale}/wiki/` + encodeURIComponent(name);
		});
	}

	constructor()
	{
		super();
		const tx = this.textContent;
		const elem = tx.split("|");

		// LIT doesn't let you set default values for these...
		this._wikiAddon = "";
		this._exists = "";
		this.external = false;

		// If there's no |, everything is the link, and a wikilink at that
		if (elem.length == 1)
		{
			this.GenerateWikilink(tx);
			this.caption = tx;
		}
		else if (elem.length == 2)
		{
			this.caption = elem[0];
			if (!validator.isURL(elem[1]))
			{
				// If validator fails then it's a wikilink
				this.GenerateWikilink(elem[1]);
			}
			else
			{
				// External link
				if (elem[1].includes("wikipedia.org"))
				{
					// Wiki-ex link
					this.external = false;
					this._exists = "";
					this._wikiAddon = `<sup style="font-size: x-small">w</sup>`;
					this.url = elem[1];
				}
				else
				{
					// True external link
					this.external = true;
					this.url = elem[1];
				}
			}
		} else console.warn("W: Bad link formatting!");
	}


	render()
	{
		// <w-a> Caption|Wiki Link </w-a>
		// OR
		// <w-a> Caption|https://example.com/ </w-a>

		return this.external
			// If external link
			? html`<a href="${this.url}" class="externalLink" rel="nofollow">${this.caption}</a>`
			// If internal link
			: html`<a href="${this.url}" class="InternalLink${this._exists}" rel="nofollow">${this.caption}${unsafeHTML(this._wikiAddon)}</a>`;
	}
}

class Annotation extends LitElement
{
	static properties = {
		type: "",
		image: "",
		_annotationType: "",
		_Infobox: ""
	};

	static styles = css`
		.annotationWarn {
    		width: fit-content;
    		background-color: var(--infobox-bg);
    		border-left: 10px solid #d9931a;
    		border-right: 1px solid grey;
    		border-top: 1px solid grey;
    		border-bottom: 1px solid grey;
    		padding: 5px;
			text-align: center;
			margin-right: auto;
			margin-left: 10vh;
			margin-top: 2vh;
			margin-bottom: 2vh;
			display: flex;
    		justify-content: space-evenly;
    		flex-direction: row;
    		align-items: center;
    		gap: 5px;
			color: var(--text-color);
			text-align: left;
		}

		.annotationDanger {
    		width: fit-content;
    		background-color: var(--infobox-bg);
    		border-left: 10px solid #eb7175;
    		border-right: 1px solid grey;
    		border-top: 1px solid grey;
    		border-bottom: 1px solid grey;
    		padding: 5px;
			text-align: center;
			margin-right: auto;
			margin-left: 10vh;
			margin-top: 2vh;
			margin-bottom: 2vh;
			display: flex;
    		justify-content: space-evenly;
    		flex-direction: row;
    		align-items: center;
    		gap: 5px;
			color: var(--text-color);
			text-align: left;
		}

		.annotationDef {
			width: fit-content;
			font-style: italic;
			padding: 5px;
			text-align: center;
			margin-right: auto;
			margin-left: 10vh;
			margin-top: 2vh;
			margin-bottom: 2vh;
			color: var(--text-color);
			text-align: left;
		}

		.annoImg {	
			width: 75px;
			height: auto;
		}

		@media (max-width:780px)  {
			.annotationDef {
				width: 90%;
				margin-left: 3vw;
			}

			.annotationDanger {
				width: 90%;
				margin-left: 3vw;
			}

			.annotationWarn {
				width: 90%;
				margin-left: 3vw;
			}
		}
	`;

	render()
	{
		this._Infobox = "Infobox";
		let imageAdd = "";
		if (this.type == "warn") this._annotationType = "annotationWarn";
		else if (this.type == "danger") this._annotationType = "annotationDanger";
		else 
		{
			this._annotationType = "annotationDef";
			this._Infobox = "";
		}
		if (this.image != "" && typeof this.image != "undefined")
		{
			imageAdd = `<img class="annoImg" src="${this.image}">`;
		}

		return html`<div class="${this._annotationType} ${this._Infobox}">${unsafeHTML(imageAdd)}<span id="slottedText"><slot></slot></span></div>`;
	}
}

class iIcon extends LitElement
{
	static properties = {
		tooltip: "",
	};

	static styles = css`
	.tooltipIcon {
		width: 15px;
    	filter: var(--toolbar-item-filter) opacity(0.2);
    	margin-left: 5px;
	}
	
	@media (max-width:780px)  {
		.tooltipIcon {
			display: none;
		}
	}
	`;

	render()
	{
		return html`<img class="tooltipIcon" src="https://www.svgrepo.com/show/390989/info-filled.svg" title="${this.tooltip}">`;
	}
}

class WikiRedirect extends LitElement
{
	static styles = css`
		#LoadDetector {
			display: none;
		}

		#RedirectBox {
			padding: 20px;
    		background-color: var(--infobox-bg);
    		border: 1px solid grey;
			text-align: center;
		}
	`;

	render()
	{
		return html`
		<div id="RedirectBox">
			${unsafeHTML(lang[locale].RedirectMessage.replaceAll("\"\"", `<a href="${selfURL}/${locale}/wiki/${encodeURIComponent(this.textContent)}?re=${pageTitle}">${this.textContent}</a>`))}
			<img id="LoadDetector" onload="WikiRedirect('${this.textContent}')" src="https://imageio.forbes.com/specials-images/imageserve/5ed6636cdd5d320006caf841/0x0.jpg">
		</div>
		`;
	}
}

class WikiDropdown extends LitElement
{
	static properties = {
		title: "",
	};

	static styles = css`
	`;

	render()
	{
		return html`
		<details>
			<summary>${this.title}</summary>
			<slot></slot>
		</details>
		`;
	}
}

customElements.define('w-img', WikiImage);
customElements.define('w-a', WikiLink);
customElements.define("w-annotation", Annotation);
customElements.define("w-ii", iIcon);
customElements.define("w-redirect", WikiRedirect);
customElements.define("w-drop", WikiDropdown);