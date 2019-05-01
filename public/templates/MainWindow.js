// import whatever gui template/screens needed
import Template, {RawProp} from "../lib/template.js"
import Motor from "./Motor.js"
import ts from '../lib/TagSet.js'
class MainWindow extends Template {
    constructor(p) {
        super(p)

        let children = {}

        let size = 15
        for (let i = 0; i < 1500; i++) {
            children['motor_' + i] = new Motor({
                position: {left: (size * Math.floor(i/50)) + 'px', width: size + 'px', top: (size * (i % 50)) + 'px', height: size + 'px'},
                props: {
                    color: new RawProp("red"),
                    motor: new RawProp(`M${i}`),
                },
                eventHandlers: {}
            })
        }

        this.setChildren(children)
    }
}

export default MainWindow
