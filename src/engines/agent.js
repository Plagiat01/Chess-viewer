const { spawn } = require ('child_process')
const { EventEmitter } = require ('events')
const { waitForFirst } = require ('wait-for-event')
var fs = require('fs');


function writeInLog (command) {
    fs.appendFile ('log.txt', command, (err) => {

    }) 
}

function deleteLog () {
    if (fs.existsSync ('log.txt')) {
        fs.unlink('log.txt', (err) => {

        })
    }
}

class Agent {
    constructor () {
        this.not_init_time = true
        this.getConfig ("")
       

        this.is_searching = [new EventEmitter ()]

        deleteLog()
    }

    async getConfig (old_path) {
        var config = JSON.parse(fs.readFileSync('config_engine.json'))

        if (config['path'] !== old_path) {
            this.path = config['path']

            try {
                this.engine_process.kill()
            } catch {}
            
            this.engine_process = spawn(this.path)
            this.setListeners()
        }

        if (config['go_command'] === 'blitz') {

            if (this.not_init_time) {
                this.wtime = parseInt (config['time'])
                this.btime = parseInt (config['time'])
                this.inc = parseInt (config['inc'])
                this.not_init_time = false
            }

            this.blitz = true
        } else {
            this.blitz = false
        }

        this.go_command = config['go_command']
        this.go_command = await this.buildGoCommand ()

    }

    async buildGoCommand () {
        if (this.blitz) {
            return "go wtime " + this.wtime.toString() + " btime " + this.btime.toString() +
                         " winc " + this.inc.toString() + " binc " + this.inc.toString()
        } 
        
        else {
            return this.go_command
        }
    }


    setListeners () {
        this.engine_process.stdout.on('data', (data) => {
            writeInLog (data)

            var data_str = data.toString()

            if (data_str.includes ('bestmove')) {

                while (!data_str.startsWith('bestmove')) {
                    data_str = data_str.substring(1)
                }

                data_str = data_str.substring(9, data_str.length)
                this.bestmove = ""
                while (!data_str.startsWith(' ') && !data_str.startsWith('\n')) {
                    this.bestmove += data_str[0]
                    data_str = data_str.substring(1)
                }

                this.is_searching[0].emit('done')
            }
          });
          
        this.engine_process.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`)
          });
          
        this.engine_process.on('error', (error) => {
            console.error(`error: ${error.message}`)
          });
          
        this.engine_process.on('close', (code) => {
            console.log(`child process exited with code ${code}`)
          });
    }


    async writeCommand (command) {

        await this.getConfig (this.path)

        this.engine_process.stdin.write(command + '\n')
        writeInLog (">>>>>> " + command + '\n')
    }

    setPosition (fen, moves=[]) {
        var command = "position fen " + fen + " moves"

        for (let i = 0; i<moves.length; i++) {
            command += " " + moves[i].from + moves[i].to

            if (moves[i].promotion)
                command += moves[i].promotion
            
        }

        this.writeCommand (command)
    }

    strMoveToMoveObject (move) {
        var res = null
        if (move.length === 4) {
            res = {
                from: move.substring(0, 2),
                to: move.substring (2, 4)
            }
        } else if (move.length === 5) {
            res = {
                from: move.substring(0, 2),
                to: move.substring (2, 4),
                promotion: move.substring(4, 5)
            }
        }
        return res
    } 

    async getBestMove (white) {
        var start = performance.now()

        this.writeCommand (await this.buildGoCommand ())
        this.is_searching = [new EventEmitter ()]

        await waitForFirst ('done', this.is_searching)

        var time = performance.now () - start
        
        if (white) this.wtime = Math.floor(this.wtime - time + this.inc)
        else this.btime = Math.floor(this.btime - time + this.inc)

        return this.strMoveToMoveObject(this.bestmove)
    }
}

var agent = new Agent ()
exports.agent = agent