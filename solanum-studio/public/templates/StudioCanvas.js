import Template from "../lib/template.js"
import P from '../lib/Prop.js'
import StudioCanvasPreview from './StudioCanvasPreview.js'

class StudioCanvas extends Template {
    init() {
        this.setChildren({
            preview: new StudioCanvasPreview({
                position: {left:0, right:0, top:0, bottom:0},
                props: {},
                eventHandlers: {},
            })
        })
    }

    setComponent(mod, cmp) {
        this.children.preview.setComponent(mod, cmp)
    }
}

export default StudioCanvas