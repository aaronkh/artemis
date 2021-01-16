const vscode = require('vscode');
const Provider = require('./Provider');


// Within panel... do stuff
// If panel open and joined in a (ready) game then send user code

function activate(context) {
	const provider = new Provider(context.extensionPath)
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('coding-in-the-dark.startPlaying', function () {
		try{provider.activateWindows(vscode.window)}catch(e) {console.log(e)}
		// Progress API to log state of the timer
	});
	context.subscriptions.push(disposable);

	vscode.window.showInformationMessage('Run "Code in the Dark!" from the command palette to get started!');
}


// VS Code requires both exports and module.exports...
exports.activate = activate;
module.exports = {
	activate,
}
