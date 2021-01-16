const Template = require("./Template");

const Game = new Template(`
<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <link rel="preconnect" href="https://fonts.gstatic.com">
    <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
    <style type="text/css">
        * {
            transition: 0.2s
        }

        body,
        html {
            background: black;
            color: white;
            font-family: 'Poppins', sans-serif;
            height: 100%;
            width: 100%;
            margin: 0;
            padding: 0;
            min-width: 100px;
        }

        #main {
            margin: 0.5rem;
            margin-left: 1rem;
            margin-right: 1rem;
        }

        a {
            color: inherit;
        }

        .invisible {
            display: none;
        }

        .button {
            background: #49b738;
            text-align: center;
            margin-top: 6px;
            cursor: pointer;
            padding: 1rem;
            margin-bottom: 4px;
            width: 200px
        }

        .button-red {
            background: #dc004e;
        }

        #content {
            /* reset body styles */
            background: white;
            color: black;
            font-family: serif;
            margin: 0;
            padding: 0;
        }
    </style>
</head>

<body>
    <div id="main">
        <h1 id="please-wait"> Please wait... </h1>
        <h1 id="time" class="invisible"> {{4:58}}</h1>
        <p> 
            We'll begin as soon as everyone's ready.
        <p>
        <div class="button">Ready</div>
        <p> 
            Editing as <b>{{name}}</b>. Not you? 
            <a href="http://localhost:{{port}}/sign-out">Sign out.</a> 
        </p>
    </div>
    <div id="content"></div>
    <script>
            // Ready button signal 
            // Show progress bar?
            // On Game end
            let isReady = false
            const rdyButton = document.querySelector('.button')

            rdyButton.addEventListener('click', async () => {
                if(!isReady) {
                    // TODO: Do websockets logic
                    rdyButton.classList.add('button-red')
                    rdyButton.innerText = 'Unready'
                } else {
                    // TODO: Do websockets logic
                    rdyButton.classList.remove('button-red')
                    rdyButton.innerText = 'Ready'
                }
                isReady = !isReady
            })

            const content = document.querySelector('#id')
            function start() {
                // Start timer
                // Load page
            }
    </script>
</body>

</html>
`)

module.exports = Game