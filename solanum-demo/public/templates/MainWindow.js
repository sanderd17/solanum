// import whatever gui template/screens needed
import Template from "/lib/template.js"
import Motor from "/templates/Motor.js"
import Label from "/templates/forms/Label.js"
import tag from '/lib/Tag.js'
import Icon from "/templates/draw/Icon.js"

class MainWindow extends Template {
    constructor(args) {
        super(args)
        this.init()

        this.addChild('label', new Label({
            parent: this,
            position: {right: '10px', width: '100px', top: '10px', height: '20px'},
            properties: {text: tag.system.hostname},
            eventHandlers: {}
        }))

        this.addChild('label2', new Label({
            parent: this,
            position: {right: '10px', width: '100px', top: '30px', height: '20px'},
            properties: {text: tag.default.watchDog},
            eventHandlers: {}
        }))

        this.addChild('icon', new Icon({
            parent: this,
            position: {right: '10px', top: '40px', width: '15px', height: '15px'},
            properties: {iconSet: 'material-design', iconPath: 'device/svg/production/ic_battery_80_24px.svg'}
        }))

        let size = 15
        for (let i = 0; i < 3000; i++) {
            let child = new Motor({
                parent: this,
                position: {left: (size * Math.floor(i/60)) + 'px', width: size + 'px', top: (size * (i % 60)) + 'px', height: size + 'px'},
                properties: {
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
