const remote = require('electron').remote
const user_dir = remote.app.getPath('userData')

var fs = require('fs');

function createConfig () {

   var path = "/Users/gaetanserre/Documents/Projets/Chess/Engines/maia-1900/maia"

   try {
      path = document.getElementById('engine_path').files[0].path
   } catch {}

   var go_command = ''
   var time_str = ''
   var inc_str = ''

   switch ($('input[name=go_command]').filter(':checked').val()) {
      case 'depth':
         go_command = "go depth " + $('#depth_val').val()
         break

      case 'nodes':
         go_command = "go nodes " + $('#nodes_val').val()
         break
      
      case 'movetime':
         go_command = "go movetime " + (parseInt($('#movetime_val').val()) * 1000).toString()
         break

      case 'blitz': 
         var time_min = parseInt($('#blitz_min_val').val()) * 60000 // mn to ms
         var time_sec = parseInt($('#blitz_sec_val').val()) * 1000 // sec to ms
         var time = time_min + time_sec

         var inc = parseInt($('#blitz_bonus_sec_val').val()) * 1000

         //go_command = "go wtime " + time.toString() + " btime " + time.toString() + " winc " + inc.toString() + " binc " + inc.toString()
         go_command = "blitz"
         time_str = time.toString()
         inc_str = inc.toString()
         break
   }

   config_json = {
      path: path,
      go_command: go_command     
   }

   if (go_command === 'blitz') {
      config_json = {
         path: path,
         go_command: go_command,
         time: time_str,
         inc: inc_str
      }
   }

   fs.writeFileSync (user_dir+'/config_engine.json', JSON.stringify (config_json))

   remote.getCurrentWindow().close()
}
