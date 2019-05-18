// import whatever gui template/screens needed
import Template from "/lib/template.js"
import P from '/lib/Prop.js'
import Motor from "/templates/Motor.js"
import ts from '/lib/TagSet.js'
class MainWindow extends Template {
    init(p) {
        let children = {}

        let size = 15
        for (let i = 0; i < 1500; i++) {
            children['motor_' + i] = new Motor({
                position: {left: (size * Math.floor(i/50)) + 'px', width: size + 'px', top: (size * (i % 50)) + 'px', height: size + 'px'},
                props: {
                    color: P.Raw("red"),
                    motor: P.Raw(`M${i}`),
                },
                eventHandlers: {}
            })
        }

        this.setChildren(children)
    }
}

export default MainWindow
