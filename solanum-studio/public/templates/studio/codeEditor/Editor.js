import Template from "/lib/template.js"
import Prop from "/lib/ComponentProp.js"


// TODO TODO TODO: see https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.itextmodel.html for merging / getting edits

/**
 * Add an extra lib to the monaco editor
 * @param {string} fileName
 */
function addLib(fileName) {

	fetch(fileName).then((res) => {
		return res.text()
	}).then((text) => {
		monaco.languages.typescript.javascriptDefaults.addExtraLib(text, fileName)
	}).catch((err) => console.error(err))
}


class CodeEditor extends Template {

    static defaultSize = [200, 50]

    constructor(...args) {
		super(...args)
		this.createDomNode()
		// create editor after loading dom
		setTimeout(() => this.createMonacoEditor())
	}
	
	properties = {
		code: new Prop('null', (newValue) => {
			if (newValue)
				// TODO bring complete custom field setter into property
				this.code = newValue
		})
	}

	eventTimerId = null
	eventOldCode = ''
	/**
	 * Send the contentChanged event after some time of inactivity
	 * @param {string} oldCode 
	 * @param {string} newCode 
	 * @param {Event} event 
	 */
	sendContentChangedEvent(oldCode, newCode, event) {
		if (this.eventTimerId) {
			clearTimeout(this.eventTimerId)
		} else {
			this.eventOldCode = oldCode
		}
		this.eventTimerId = setTimeout(() => {
			this.dispatchEvent('codeContentChanged', {newCode, oldCode: this.eventOldCode})
			this.eventTimerId = null
		}, 2000)
	}

	_code = ''
	/**
	 * Code prop set externally
	 */
	set code(code) {
		this._code = code
		if (this.codeChangedEvent)
			this.codeChangedEvent.dispose()

		monaco.editor.getModels()[0].setValue(code)

		this.codeChangedEvent = monaco.editor.getModels()[0].onDidChangeContent(ev => {
			// update private _code value to circumvent setter
			let oldCode = this._code
			this._code = this.monacoEditor.getValue()
			this.sendContentChangedEvent(oldCode, this.code, ev)

		})
		//this.monacoEditor.getAction('editor.foldLevel3').run()
	}

	get code() {
		return this._code
	}

	/**
	 * Create the monaco editor in the component's dom
	 */
	createMonacoEditor() {
		// Add additonal d.ts files to the JavaScript language service and change.
		// Also change the default compilation options.
		// The sample below shows how a class Facts is declared and introduced
		// to the system and how the compiler is told to use ES6 (target=2).

		// validation settings
		monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
			noSemanticValidation: true,
			noSyntaxValidation: false
		});

		// compiler options
		monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
			target: monaco.languages.typescript.ScriptTarget.ES6,
			//module: monaco.languages.typescript.ModuleKind.None,
			allowNonTsExtensions: true,
			allowJs: true,
		});

		// extra libraries
		addLib('/lib/template.js')
		addLib('/lib/TagSet.js')
		addLib('/templates/draw/Circle.js')

		this.monacoEditor = monaco.editor.create(this.dom, {
			value: '',
			language: "javascript"
		})


	}

	decorations = []
	highlightLoc(loc) {
		let range = {
			startColumn: loc.start.column + 1,
			startLineNumber: loc.start.line,
			endColumn: loc.end.column + 1,
			endLineNumber: loc.end.line,
		} 
		this.decorations = this.monacoEditor.deltaDecorations(this.decorations, [
			{ range, options: { inlineClassName: 'textHighlight' }},
		])
        this.monacoEditor.revealRangeInCenterIfOutsideViewport(range)
	}

}

export default CodeEditor