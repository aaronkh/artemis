// you must do all scene changes in JS
// document.getElementsByTagName('style')[0].innerHTML="";
const SHELL = `
<!DOCTYPE html>
<html>
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet"> 
    <style type="text/css">
        
    </style>
    </head>
    <body>
        <div id="body"></div>
       <script>
       const vscode = acquireVsCodeApi()

       window.addEventListener('message', ({data}) => {
           console.log(data)
            if(data.type !== 'render') return 
            const {html, css, js} = data
            // Replace HTML 
            document.getElementById('body').innerHTML = html
            // Replace CSS
            document.getElementsByTagName('style')[0].innerHTML = css;
            // Replace JS
            console.log(js)
            eval(js)
       })
    </script>
    </body>
</html>
`

module.exports = SHELL