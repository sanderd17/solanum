import recast from 'recast'
import { isImportDeclaration } from '../node_modules/typescript/lib/typescript';
/*    
* Add / Remove new child template (and fix imports)
* Set position of child template
* Set props object of child template
* Set default props of own template
* Add / remove / change event handlers
*/

class ComponentModifier {

    constructor(code) {
        this.code = code
        this.ast = recast.parse(code)
    }

    /**
     * @returns {string} new module code
     */
    print() {
        return recast.print(this.ast).code
    }

    /**
     * @param {string} childId: id under which the child component will be referenced
     * @param {string} childPath: path to the child component 
     * @param {string} childClassName: Class name of the child component
     * @param {*} position: Without position, child cannot be displayed
     */
    addChildComponent(childId, childClassName, childPath, position) {
        this.addImportStatement(childClassName, childPath)
    }

    removeChildComponent() {

    }

    setChildPosition() {

    }

    setChildProp() {

    }

    removeChildProp() {

    }

    setChildEventHandler() {

    }

    removeChildEventHandler() {

    }

    setOwnDefaultProps() {

    }

    // methods for internal use

    /**
     * Add the import of a new class to a component
     * Checks existing default imports to avoid duplicates,
     * and adds a new default import with the given names
     * @param {string} importName 
     * @param {string} importPath 
     */
    addImportStatement(importName, importPath) {
        const astBody = this.ast.program.body
        let lastImportLine = -1
        for (let [i, statement] of astBody.entries()) {
            if (statement.type != 'ImportDeclaration')
                continue
            lastImportLine = i
            if (statement.source.value == importPath)
                return
        }

        // determine the position of the import (add to the end of imports)
        let importString = `import ${importName} from '${importPath}'`

        let newImportAst = recast.parse(importString).program.body[0]
        astBody.splice(lastImportLine + 1,0,newImportAst)
    }
}

export default ComponentModifier