var fs = require('fs');
const user_dir = require('electron').remote.app.getPath('userData')

function writeInLog (command) {
    fs.appendFile (user_dir+'/log.txt', command, (err) => {

    }) 
}

function deleteLog () {
    if (fs.existsSync (user_dir+'/log.txt')) {
        fs.unlink(user_dir+'/log.txt', (err) => {

        })
    }
}