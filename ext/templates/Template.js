const Handlebars = require("handlebars");

class Template {
    constructor(html, styles, script) {
        this.html = html 
        this.styles = styles
        this.script = script
    }

    render(data) {
        const html = Handlebars.compile(this.html)({...data})
        const css = Handlebars.compile(this.styles)({...data})
        const js = Handlebars.compile(this.script)({...data})
        return {css, html, js}
    }
}

module.exports = Template