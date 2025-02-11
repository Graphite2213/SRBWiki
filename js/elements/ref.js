import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';
import { unsafeHTML } from 'https://unpkg.com/lit-html@3.1.3/directives/unsafe-html.js';

class ReferenceManager {
    pageRefs = new Map();
    freeNumber = 1;

    AddRef(text, name)
    {
        if (typeof name != "undefined")
        {
            if (this.pageRefs.has(name)) return;
        }
        else name = this.freeNumber;
        const obj = {
            refText: text,
            refNumber: this.freeNumber++,
            name: name
        };
        this.pageRefs.set(name, obj);
        return obj;
    }

    GetRef(name)
    {
        if (!this.pageRefs.has(name)) return -1;
        return this.pageRefs.get(name);
    }

    GetRefByNumber(num)
    {
        for (const [key, value] of this.pageRefs) 
        {
            if (value["refNumber"] == num) return this.pageRefs.get(key);
        }
    }

    GetAllRefs()
    {
        let val = [];
        for (const [key, value] of this.pageRefs)
        {
            val.push([key, value]);
        }
        return val;
    }

    ClearRefs()
    {
        this.pageRefs.clear();
        this.freeNumber = 1;
    }
}

window._BackupRef = new ReferenceManager();
window._RefManager = new ReferenceManager();


class RefContain extends LitElement {
    static properties = {
        title: "",
        allRefs: ` `
    }

    static styles = css`
    :host([flex]) {
		display: flex;
	 }

	.head1 {
		font-size: var(--h1-font-size);
        margin-top: 2vh;
        margin-bottom: 1vh;
        font-weight: 500;
        border-bottom: 1px solid rgb(166, 166, 166);
        overflow: hidden;
        font-family: Georgia, "Times New Roman", serif;
	}

	.seperator {
		width: 95%;
    	height: 1px;
    	border-top: grey 1px solid;
    	align-self: center;
		display: block;
	}
        
    .references {
        font-size: 90%;
        margin-bottom: 0;
        list-style-type: inherit;
    }


    ol {
        margin: 0.3em 0 0 3.2em;
        padding: 0;
        list-style-image: none;
    }

    li {
        page-break-inside: avoid;
        break-inside: avoid-column;
    }
    
    li:target {
        background-color: red;
    }

    .reflist {
        width: 80%;
        font-size: 95%;
        margin-bottom: 0.5em;
        list-style-type: decimal;
        margin-top: 0.3em;
        column-width: 20em;
        padding-bottom: 2vh;
    }
    
    a {
        color: var(--link-basic-color);
    }

    @media (max-width:780px)  {
        .reflist {
            column-width: 90vw;
        }
    }
    `;

    constructor() {
		super();
	}
    
    render() {
        setTimeout(() => {
            const allRefs = window._RefManager.GetAllRefs();
            this.allRefs = '';
            for (const x of allRefs)
            {
                this.allRefs += `<li id="ref_link_${x[1].refNumber}">${x[1].refText}</li>`
            }
        }, 100);

        if (typeof this.title == "undefined") this.title = (locale == "en") ? "References" : "Izvori";
        window._titles.push(this.title);

        return html`<div class="head1">${this.title}</div>
        <div class="reflist">
            <ol class="references">
                ${unsafeHTML(this.allRefs)}
            </ol>
        </div>`
    }
}

class InlineRef extends LitElement {
    static properties = {
		name: undefined,
        instRef: undefined
	};

	static styles = css`
        a {
            color: var(--link-basic-color);
            cursor: pointer;
            text-decoration: none;
        }
  	`;

	constructor() {
		super();
	}
	
	render() {
        if (typeof this.name != "undefined") 
        {
            this.instRef = window._RefManager.GetRef(this.name);
        }

        if (this.instRef == -1 || typeof this.name == "undefined")
        {
            const text = this.innerHTML;
            this.instRef = window._RefManager.AddRef(text, this.name);
        }
		return html`<sup><a data-ref_number="${this.instRef.refNumber}" onmouseover="NotationHover(event)" onmouseout="NotationHoverClear(event)" onclick="ScrollRefIntoView(event)">[${this.instRef.refNumber}]</a></sup>`
	}
}

customElements.define('w-ref', InlineRef);
customElements.define('w-reflist', RefContain);