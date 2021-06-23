var agent1 = require ('./engines/agent').agent1
var agent2 = require ('./engines/agent').agent2
var agent = agent1

async function playAgentBestMove () {
    $('#engine_move').prop('disabled', true)

    agent.setPosition (startpos, move_list)
    is_searching = true
    var best_move = await agent.getBestMove (game.turn() === 'w')
    
    is_searching = false
    $('#engine_move').prop('disabled', false)

    let score = agent.score
    if (game.turn === 'b') {
      if (score[0] === '-') {
        score.substring(1)
        score = '+' + score
      }
      else {
        score = '-' + score
      }
    }

    if (agent.mate) {
      score = "mate " + score
    }
    
    score_list.push(score)
    playMove(best_move, true)
    printScore()
      
    if (agent.nb == 1)
      agent = agent2
    else
      agent = agent1
}

async function demo () {
    $('#demo_btn').prop('disabled', true)

    while (!game.game_over()) {
        await playAgentBestMove ()
    }

    $('#demo_btn').prop('disabled', false)
}

function uncheckEngineButton () {
    $('#engine_move').prop('checked', false)
    engine_turn = null
}


$('#engine_move').on('change', () => {

    if ($('#engine_move').is(':checked')) {
        engine_turn = game.turn()
        playAgentBestMove ()
    }

    else
        engine_turn = null
})