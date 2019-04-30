// import whatever gui template/screens needed
import Template, {RawProp} from "../lib/template.js"
import Motor from "./Motor.js"
import ts from '../lib/TagSet.js'
class MainWindow extends Template {
    constructor(p) {
        super(p)

        let children = {}

        for (let i = 0; i < 3000; i++) {
            children['motor_' + i] = new Motor({
                position: {left: (15 * Math.floor(i/100)) + 'px', width: '15px', top: (15 * (i % 100)) + 'px', height: '15px'},
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
