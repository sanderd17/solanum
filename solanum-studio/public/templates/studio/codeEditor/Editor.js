//import * as monaco from '/monaco/esm/vs/editor/editor.main.js'
import Template from "/lib/template.js"

/*
self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		if (label === 'json') {
			return './json.worker.js';
		}
		if (label === 'css') {
			return './css.worker.js';
		}
		if (label === 'html') {
			return './html.worker.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.js';
		}
		return './editor.worker.js';
	},
};
*/

function createMonacoEditor(dom) {
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
		allowNonTsExtensions: true
	});

	// extra libraries
	monaco.languages.typescript.javascriptDefaults.addExtraLib([
		'declare class Facts {',
		'    /**',
		'     * Returns the next fact',
		'     */',
		'    static next():string',
		'}',
	].join('\n'), 'filename/facts.d.ts');

	var jsCode = [
		'"use strict";',
		'',
		"class Chuck {",
		"    greet() {",
		"        return Facts.next();",
		"    }",
		"}"
	].join('\n');

	monaco.editor.create(dom, {
		value: jsCode,
		language: "javascript"
	});
}

class CodeEditor extends Template {

    static childDefinitions = {
    }

    static defaultSize = [200, 50]

    constructor(...args) {
		super(...args)
		setTimeout(() => createMonacoEditor(this.dom))
    }
}

export default CodeEditor