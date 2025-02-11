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

class InfoboxMain extends LitElement {
    static properties = {
		type: "",
		title: ""
	};

	static styles = css`
    .infoboxWrapper {
		clear: right;
		float: right;
		text-align: center;
		display: flex;
		flex-direction: column;
		font-weight: bold;
		height: fit-content;
		width: 25.5em;
		align-items: center;
	}
    
	.infobox {
		clear: right;
		float: right;
		border: 1px solid gray;
		border-spacing: 3px;
		background-color: var(--infobox-bg);
		color: var(--text-color);
		margin: 0.5em 0 0.5em 1em;
		padding: 0.2em;
		font-size: 85%;
		line-height: 1.5em;
		width: 25.5em;
		text-wrap: wrap;
	  
		display: table;
		border-collapse: separate;
		box-sizing: border-box;
		text-indent: initial;
		border-spacing: 2px;
		height: fit-content;
	}

	.infoTitle {
		margin-bottom: -5px;
		margin-left: 1vw;
	}

	@media (max-width:780px)  {
		.infoboxWrapper {
			clear: none;
			float: none;
			width: 95%;
        	margin-left: auto;
        	margin-right: auto;
			align-items: center;
		}

		.infoTitle {
			margin-left: 5vw;
		}
	}
  	`;  

    render() {
        return html`<div class="infoboxWrapper">
			<span class="infoTitle">${this.title}</span>
			<div class="infobox">
            	<slot></slot>
        	</table>
		</div>
        `;
    }
}

class InfoboxImage extends LitElement {
	static properties = {
		url: "",
		caption: ""
	};

	static styles = css`
	.infoboxImg {
		width: 250px;
		height: auto;
		margin-top: 1vh;
	}
	  
	.infoboxImgCaption {
		margin-top: 5px;
		margin-bottom: 5px;
		font-weight: normal;
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
		if (!validator.isURL(this.url, validatorArgs))
		{
			this.url = fetchURL + `${locale}/${pageTitle}/Images/${encodeURI(this.url)}`;
		}

	}
	
	render() {
		//<wi-image>url|caption</wi-image>
		// If there is no | count everything as url
		return html`<div><img class="infoboxImg" src="${this.url}"><p class="infoboxImgCaption">${this.caption}</p></div>`
	}
}
class InfoboxSection extends LitElement
{
	static properties = {
		title: ""
	};

	static styles = css`
	.infoboxHeader {
		text-align: center;
		background: var(--infobox-header);
	}
	`;

	render()
	{
		return html`<div class="infoboxHeader">${this.textContent}</div>`;
	}
}

class InfoboxRow extends LitElement {
	static properties = {
		left: "",
		right: ""
	};

	static styles = css`
	.infoboxRow {
		display: flex;
		font-weight: normal;
		margin-top: 1%;
		margin-left: 1%;
		margin-right: 1%;
		margin-bottom: 1%;
		text-align: left;
		justify-content: flex-start;
		white-space: nowrap;
		text-wrap: wrap;
	}

	ul {
		margin-top: -0px;
		padding-left: 15px;
	}
	  
	.infoboxLeft {
		font-weight: bold;
		width: 40%;
		min-width: 80px;
	}
	  
	  
	.infoboxRight {
		width: 50%;
	}
  	`;

	constructor() {
		super();
		const tx = this.innerHTML;
		let elem = tx.split("|");
		let temp = elem[0];
		elem.shift();
		elem = [elem.join("|")];
		elem.unshift(temp);

		if (elem.length == 2)
		{
			this.left = elem[0];
			this.right = elem[1];
		}
		else console.error("E: Misformatted infobox row, missing left/right");
	}
	
	render() {
		//<wi-row>left|right</wi-row>
		// If there is no | count everything as url
		return html`<div class="infoboxRow"><div class="infoboxLeft">${unsafeHTML(this.left)}</div><div class="infoboxRight">${unsafeHTML(this.right)}</div></div>`
	}
}


class InfoboxCellImage extends LitElement {
	static properties = {
		url: ""
	};

	static styles = css`
	.infoboxRightImg {
		width: 128px;
		height: auto;
	}
  	`;

	constructor() {
		super();
		
		this.url = this.textContent;
		if (!validator.isURL(this.url, validatorArgs))
		{
			this.url = fetchURL + `${locale}/${pageTitle}/Images/${encodeURI(this.url)}`;
		}
	}
	
	render() {
		return html`<img class="infoboxRightImg" src="${this.url}">`
	}
}

class InfoboxVSSection extends LitElement {
	static properties = {
	};

	static styles = css`
		.infoboxVS {
			display: flex;
			flex-direction: row;
			font-weight: normal;
			justify-content: flex-start;
			margin-top: 1vh;
    		margin-left: 1%;
   			margin-right: 1%;
    		margin-bottom: 1vh;
		}
	`;

	constructor() {
		super();

	}
	
	render() {
		return html`
		<div class="infoboxVS"> 
			<slot></slot>
		</div>`
	}
}

class InfoboxVSSide extends LitElement {
}

class InfoboxVSParty extends LitElement {
	static properties = {
		list: "",
		collapsed: "",
		_col: false
	};

	static styles = css`
		span {
			font-weight: normal;
			text-align: left;
		}

		:host {
			display: flex;
		}

		.colbutton {
			float: right;
			appearance: none;
    		background: none;
    		margin: 0;
    		padding-right: 0.2em;
    		padding-left: 0.2em;
    		border: 0;
    		font: inherit;
			cursor: pointer;
		}

		.buttontext:hover {
			text-decoration: underline;
    		color: #447ff5;
		}

		.buttontext:active {
			color: #0b0080;
		}
		
		.buttontext {
			color: #36c;
		}

		.slotdiv {
			display: none;
			margin: 0;
			padding: 0;
		}
	`;

	constructor() {
		super();
	}
	
	hideshow(e)
	{
		if (!this._col || typeof this._col == "undefined") 
		{
			e.target.innerText = "hide";
			e.target.parentNode.parentNode.parentNode.children[1].style.display = "block";
		}
		else {
			e.target.innerText = "show";
			e.target.parentNode.parentNode.parentNode.children[1].style.display = "none";
		}

		this._col = !this._col;
	}

	render() {
		return (typeof this.list != "undefined" && typeof this.collapsed != "undefined")
		? html`<span><div style="display: flex; align-items: flex-start;"><b>${this.list}</b><button class="colbutton">[<span @click=${(e) => {this.hideshow(e)}} class="buttontext">show</span>]</button></div><div class="slotdiv"><slot></slot></div></span>`
		: html`<span><b>${this.list}</b><slot></slot></span>`;
	}
}

customElements.define('w-infobox', InfoboxMain);
customElements.define('wi-image', InfoboxImage);
customElements.define('wi-header', InfoboxSection);
customElements.define('wi-row', InfoboxRow);
customElements.define("wic-image", InfoboxCellImage);
customElements.define("wi-vs", InfoboxVSSection);
customElements.define("wvs-p", InfoboxVSParty);