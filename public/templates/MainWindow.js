// import whatever gui template/screens needed
import Template from "../lib/template.js"
import Motor from "./Motor.js"
import ts from '../lib/TagSet.js'
class MainWindow extends Template {
    constructor(p) {
        super(p)

        this.setChildren({
            motor_1: new Motor({
                position: {left: '15px', width: '200px', top: '150px', height: '100px'},
                props: {st_motor: 'Motors/M1'},
                eventHandlers: {}
            })
        })
    }
}

export default MainWindow
