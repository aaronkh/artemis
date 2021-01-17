const vscode = require('vscode');
const Provider = require('./Provider');

// Get Settings
// vscode.workspace.getConfiguration('myExtension')

function activate(context) {
	const provider = new Provider()
	let disposable = vscode.commands.registerCommand('coding-in-the-dark.startPlaying', function () {
		try {
			provider.activateWindows(vscode.window)
		} catch (e) { console.log(e) }
	});
	context.subscriptions.push(disposable);
	vscode.window.showInformationMessage('Run "Code in the Dark!" from the command palette to get started!');
}

// VS Code requires both exports and module.exports...
module.exports = {
	activate
}
