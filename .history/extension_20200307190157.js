// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

/**
 * List of supported language IDs that the extension renders in
 * This is part of the script to prevent hightlighting for stuff like TS types, eg: "const stuff: <CustomType>"
 * @type {[string]}
 */
const supportedLanguages = [
  "scss",
  "stylus"
]

let decorationsActive = true

/**
 * This method is called when your extension is activated.
 * Your extension is activated the very first time the command is executed.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const decorationType = vscode.window.createTextEditorDecorationType({after: {margin: '0 0 0 1rem'}});

	let activeEditor = vscode.window.activeTextEditor;

	let timeout;
	
	function updateDecorations() {

  // Instantly kill this if the language is wrong
  if (!supportedLanguages.includes(activeEditor.document.languageId)) {
    return;
  }

		if (!activeEditor || !decorationsActive) {
			return;
		}
		if(!isBalancedParenthesis(activeEditor.document.getText())) {
			activeEditor.setDecorations(decorationType, [])
			return
		}

		const regEx = /(.*{$)/gm;
		const text = activeEditor.document.getText();
		const found = [];
		let match;
		while (match = regEx.exec(text)) {
			const start = findClosingBracket(activeEditor.document.getText(), match.index + match[0].length - 1)

			const contentText = '// ' + match[0].substring(0, match[0].length - 1)
			
			const decoration = { 
				range: new vscode.Range(activeEditor.document.positionAt(start), activeEditor.document.positionAt(start + 1)), 
				// hoverMessage: 'Number **' + match[0] + '**', 
				renderOptions: {
					light: {
						after: {
							contentText,
							color: 'rgba(0,0,0,.3)'
						}	
					},
					dark: {
						after: {
							contentText,
							color: 'rgba(255,255,255,.3)'
						}	
					}
				},
			};
			found.push(decoration);
		}
		activeEditor.setDecorations(decorationType, found);
	}

	function triggerUpdateDecorations() {
		if (timeout) {
			clearTimeout(timeout);
			timeout = undefined;
		}
		timeout = setTimeout(updateDecorations, 500);
	}

	// On startup
	if (activeEditor) {
		triggerUpdateDecorations();
	}

	vscode.window.onDidChangeActiveTextEditor(editor => {
		activeEditor = editor;
		if (editor) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument(event => {
		if (activeEditor && event.document === activeEditor.document) {
			triggerUpdateDecorations();
		}
	}, null, context.subscriptions);

	context.subscriptions.push(vscode.commands.registerCommand('scss-scope-helper.show', function() {
		decorationsActive = true
		triggerUpdateDecorations()
	}));

	context.subscriptions.push(vscode.commands.registerCommand('scss-scope-helper.hide', function() {
		decorationsActive = false
		activeEditor.setDecorations(decorationType, [])
	}));
}

// this method is called when your extension is deactivated
function deactivate() {}

// https://www.geeksforgeeks.org/find-index-closing-bracket-given-opening-bracket-expression/
function findClosingBracket(expression, index) {
	let i;  
	
	// If index given is invalid and is not an opening bracket.  
	if (expression[index] !== '{') {  
		return -1;
	}  

	// Stack to store opening brackets.  
	let st = [];  

	// Traverse through string starting from given index.  
	for (i = index; i < expression.length; i++) {  
		
		// If current character is an opening bracket push it in stack.  
		if (expression[i] === '{') {  
			st.push(expression[i]);  
		} // If current character is a closing bracket, pop from stack. If stack is empty, then this closing bracket is required bracket.  
		else if (expression[i] === '}') {  
			st.pop();  
			if (st.length === 0) {  
				return i;  
			}  
		}  
	}  
}

// https://rohan-paul.github.io/javascript/2018/05/25/Parenthesis-Matching-Problem-in-JavaScript/
function isBalancedParenthesis(str)  {
    return !str.split('').reduce((uptoPrevChar, thisChar) => {
        if(thisChar === '(' || thisChar === '{' || thisChar === '[' ) {
            return ++uptoPrevChar;
        } else if (thisChar === ')' || thisChar === '}' || thisChar === ']') {
            return --uptoPrevChar;
        }

        return uptoPrevChar
    }, 0);
}

module.exports = {
	activate,
	deactivate
}
