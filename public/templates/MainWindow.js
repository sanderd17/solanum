// import whatever gui template/screens needed
import Template from "../lib/template.js"
import Motor from "./Motor.js"
import ts from '../lib/TagSet.js'
class MainWindow extends Template {
    constructor(...args) {
        super(...args)

        this.setChildren({
            motor_1: new Motor(
                {left: '15px', width: '20px', top: '15px', height: '20px'},
                {st_motor: 'Motors/M1'},
                {click: (ev) => {ts.writeTag('Motors/M1', 'black')}}
            )
        })
    }
}

export default MainWindow
