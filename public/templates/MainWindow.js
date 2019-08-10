// import whatever gui template/screens needed
import Template from "/lib/template.js"
import Motor from "/templates/Motor.js"
import ts from '/lib/TagSet.js'
class MainWindow extends Template {
    constructor(...args) {
        super(...args)

        let size = 15
        for (let i = 0; i < 3000; i++) {
            let child = new Motor({
                parent: this,
                position: {left: (size * Math.floor(i/50)) + 'px', width: size + 'px', top: (size * (i % 50)) + 'px', height: size + 'px'},
                props: {
                    motor: `M${i}`,
                },
                eventHandlers: {}
            })
            this.addChild('motor_' + i, child)
        }
    }
}

MainWindow.prototype.defaultSize = [500, 850]

export default MainWindow
