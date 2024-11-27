import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';


class Title1 extends LitElement {

    // Erm achtually 🤓 its bad practice to import css files into lit
	static styles = css`
	:host([flex]) {
		display: flex
	 }

	.head1 {
		font-size: var(--h1-font-size);
    	margin-top: 2vh;
		margin-bottom: 1vh;
    	font-weight: 500;
		border-bottom: 1px #a6a6a6 solid;
		overflow: hidden;
        font-family: 'Georgia', 'Times New Roman', serif;
	}
	`;

	render() {
        window._titles.push(this.textContent);
		//<w-h1> Header <w-h1>
		return html`<div id="${this.textContent}" class="head1">${this.textContent}</div>`;
	}
}

class Title2 extends LitElement {
    static styles = css`
	:host([flex]) {
		display: flex
	 }

     .head2 {
        font-size: var(--h2-font-size);
        margin-top: 2vh;
        margin-bottom: 0vh;
        font-weight: bold;
    }
    `;

    render() {
        //<w-h2> Header <w-h2>
        return html`<h2 class="head2">${this.textContent}</h2>`;
    }
}

class Title3 extends LitElement {
    static styles = css`
	:host([flex]) {
		display: flex
	 }

     .head3 {
        font-size: var(--h3-font-size);
        margin-top: 0vh;
        margin-bottom: .5vh;
        font-weight: bold;
    }
    `;

    render() {
        //<w-h3> Header <w-h3>
        return html`<h3 class="head3">${this.textContent}</h3>`;
    }
}

customElements.define('w-h1', Title1);
customElements.define('w-h2', Title2);
customElements.define('w-h3', Title3);