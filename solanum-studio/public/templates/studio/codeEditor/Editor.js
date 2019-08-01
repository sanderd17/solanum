import Template from "/lib/template.js"


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

    static childDefinitions = {
    }

    static defaultSize = [200, 50]

    constructor(...args) {
		super(...args)
		setTimeout(() => this.createMonacoEditor())
		this.cnt = 1
	}
	
	/**
	 * Create teh monaco editor in the component's dom
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
			allowNonTsExtensions: true
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

	async loadCode(mod, cmp) {
		let response = await fetch(`/API/Studio/openComponent?module=${mod}&component=${cmp}`, { cache: "no-cache" })
		let text = await response.text()
        this.cnt++
		this.monacoEditor.setValue(text)
	}
}

export default CodeEditor