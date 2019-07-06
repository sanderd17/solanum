// import whatever gui template/screens needed
import Template from "/lib/template.js"
import P from '/lib/Prop.js'
import Motor from "/templates/Motor.js"
import ts from '/lib/TagSet.js'
class MainWindow extends Template {
    constructor(...args) {
        super(...args)
        let children = {}

        let size = 15
        for (let i = 0; i < 1500; i++) {
            children['motor_' + i] = {
                type: Motor,
                position: {left: (size * Math.floor(i/50)) + 'px', width: size + 'px', top: (size * (i % 50)) + 'px', height: size + 'px'},
                props: {
                    color: "green",
                    motor: P.Raw(`M${i}`),
                },
                eventHandlers: {}
            }
        }

        this.setChildren(children)
    }
}

MainWindow.prototype.defaultSize = [500, 850]

export default MainWindow
