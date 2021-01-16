const Handlebars = require("handlebars");

class Template {
    constructor(html) {
        this.html = html 
    }

    render(data) {
        return Handlebars.compile(this.html)(data)
    }
}

module.exports = Template