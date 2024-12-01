import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { unsafeHTML } from 'https://unpkg.com/lit-html@3.1.3/directives/unsafe-html.js';

const validatorArgs = { 
	protocols: ['http','https','ftp'], 
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

class WikiImage extends LitElement {

	// You can set these properties in the HTML too
	static properties = {
		url: "",
		caption: ""
	};

	static styles = css`
	figure {
		background-color: #e6e6e6;
		border: 1px gray solid;
		color: black !important;
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
    	background-color: #e6e6e6;
	}

	figcaption {
		background-color: #e6e6e6;
    	padding: 5px;
	}

	@media (max-width:641px)  {
		figure {
			float: none;
    		clear: none;
			margin-right: auto;
			margin-left: auto;
		}

		img {
			width: 65vw;
			min-width: 0;
		}
	}

  	`;

	constructor() {
		super();
		const tx = this.textContent;
		const elem = tx.split("|");
		if (elem.length == 0) {
			this.url = tx;
		}
		else {
			this.url = elem[1];
			this.caption = elem[0];
		}
		// If its not an URL already turn it into one
		if (!validator.isURL(this.url, validatorArgs))
		{
			if (typeof pageTitle == "undefined") return console.warn("W: Page title is undefined, assuming editor. Not loading image.");
			this.url = fetchURL + `${locale}/${pageTitle}/Images/${encodeURI(this.url)}`;
		}
	}
	
	render() {
		//<w-img> Caption|URL </w-img>
		// If there is no | count everything as url
		return html`<figure class="imgWrapper">
			<img src="${this.url}" class="postImg">
			<figcaption class="imgCaption">${this.caption}</figcaption>
		</figure>`
	}
}

class WikiLink extends LitElement {
	static properties = {
		url: "",
		caption: "",
		external: true,
		_exists: ""
	};

	// For some unknown shadow css reasons .InternalLink isnt colored properly even though its supposed to inherit the default link style
	static styles = css`
		a {
			cursor: pointer;
			color: #36c;
			cursor: pointer;
			text-decoration: none;
		}

		:hover {
    		text-decoration: underline;
    		color: #447ff5;
		}

		:active {
    		color: #0b0080;
		}

		:visited {
    		color: #6b4ba1;
		}


		.nonExistent {
			color: #bf3c2c;
		}

		.externalLink {
			background-image: url(https://en.wikipedia.org/w/skins/Vector/resources/skins.vector.styles.legacy/images/link-external-small-ltr-progressive.svg?fb64d);
			background-position: center right;
    		background-repeat: no-repeat;
    		padding-right: 1em;
    		cursor: pointer;
		}
	`;

	constructor() {
		super();
		const tx = this.textContent;
		const elem = tx.split("|");
		this.external = true;

		if (elem.length == 2 || elem.length == 1)
		{
			this.url = elem[1];
			if (elem.length == 1) this.url = elem[0];
			this.caption = elem[0];
			if (!validator.isURL(this.url)) {
				this.external = false;
				this._exists = !window._searchMeta.pages.includes(elem[0]) ? " nonExistent" : "";
    			this.url = `${selfURL}/${locale}/wiki?page=` + encodeURI(elem[0]);
			}
			else if (elem[1].includes("wikipedia.org")) 
			{
				this.external = false;
				this._exists = true;
			}
		}
		else console.warn("W: Bad link formatting!");
	}

	render() {
		// <w-a> Caption|Wiki Link </w-a>
		// OR
		// <w-a> Caption|https://example.com/ </w-a>

		return this.external
		// If external link
    	? html`<a href="${this.url}" class="externalLink">${this.caption}</a>`
		// If internal link
    	: html`<a href="${this.url}" class="InternalLink${this._exists}">${this.caption}</a>`;
	}
}

class Annotation extends LitElement {
	static properties = {
		type: "",
		image: "",
		_annotationType: "",
		_followModeInfobox: ""
	};

	static styles = css`
		.annotationWarn {
    		width: fit-content;
    		background-color: #e6e6e6;
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
			color: black;
		}

		.annotationDanger {
    		width: fit-content;
    		background-color: #e6e6e6;
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
			color: black;
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
			color: black;
		}

		.annoImg {	
			width: 75px;
			height: auto;
		}

		@media (max-width:641px)  {
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
	`
	
	render() {
		this._followModeInfobox = "followModeInfobox";
		let imageAdd = "";
		if (this.type == "warn") this._annotationType = "annotationWarn";
		else if (this.type == "danger") this._annotationType = "annotationDanger";
		else 
		{
			this._annotationType = "annotationDef";
			this._followModeInfobox = "";
		}
		if (this.image != "")
		{
			imageAdd = `<img class="annoImg" src="${this.image}">`;
		}

		return html`<div class="${this._annotationType} ${this._followModeInfobox}">${unsafeHTML(imageAdd)}<span id="slottedText"><slot></slot></span></div>`
	}
}

customElements.define('w-img', WikiImage);
customElements.define('w-a', WikiLink)
customElements.define("w-annotation", Annotation);