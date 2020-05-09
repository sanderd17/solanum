import FunctionTag from '../tagTypes/FunctionTag.js'
import os from 'os'



/**
 * A special set of tags for showing the system status
 */
let tags = {
    hostname: {
        type: FunctionTag,
        pollRate: 0, //ms
        asyncFunction: false,
        function: () => os.hostname()
    },
}

 export default tags