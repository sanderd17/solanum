// import whatever gui template/screens needed
import Template, {RawProp} from "../lib/template.js"
import Motor from "./Motor.js"
import ts from '../lib/TagSet.js'
class MainWindow extends Template {
    constructor(p) {
        super(p)

        this.setChildren({
            motor_1: new Motor({
                position: {left: '15px', width: '200px', top: '150px', height: '100px'},
                props: {
                    st_motor: new RawProp('Motors/M1'),
                    color: new RawProp("red")
                },
                eventHandlers: {}
            })
        })
    }
}

export default MainWindow
