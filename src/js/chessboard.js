
// NOTE: this example uses the chess.js library:
// https://github.com/jhlywa/chess.js

var board = null
var game = new Chess()
var $fen = $('#fen')
var $pgn = $('#pgn')
var $board = $('#board')
var squareClass = 'square-55d63'

var pgn = ""
var move_list = []
var undo_moves = []
var score_list = []
var undo_scores = []
var startpos = ""
var is_searching = false
var engine_turn = null

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // only pick up pieces for the side to move
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1) ||
      is_searching) {
    return false
  }
}

function onDrop (source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  move_list.push(move)
  undo_moves = []
  undo_scores = []

  highlightMove(move)
  pgn = game.pgn()
  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  board.position(game.fen())
}

function updateStatus () {
  $fen.val (game.fen())
  var pgn_array = pgnToArray(pgn)
  writePGN (pgn_array, pgnToArray(game.pgn()).length-1)
  checkForEngineMove ()
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}


// Functions

function highlightMove (move) {
    removeHighlight()
    $board.find('.square-' + move.from).addClass('highlight')
    $board.find('.square-' + move.to).addClass('highlight')
}

function removeHighlight () {
    $board.find('.' + squareClass).removeClass('highlight')
}

function pgnToArray (PGN) {
    var separated = PGN.split('\n')
    var pgn = PGN
    if (separated.length === 3)
        pgn = ""
    if (separated.length > 3)
        pgn = separated[3]

    return pgn.split(' ')
}

function writePGN (pgn_array, idx) {
    var str_pgn = ""
    for (let i = 0; i<pgn_array.length; i++) {
        var offset = i === pgn_array.length - 1 ? "" : " "

        if (i === idx && idx !== 0)
            str_pgn += "<span style='color: yellow'>" + pgn_array[i] + offset + "</span>"
        else
            str_pgn += pgn_array[i] + offset
    }
    $pgn.html(str_pgn)
}


function playMove (move, reset=false, sloppy=false) {
    g_move = game.move (move, {sloppy: sloppy})

    move_list.push(g_move)
    if (reset) {
        undo_moves = []
        undo_scores = []
        pgn = game.pgn()
    }

    board.position(game.fen())
    updateStatus()
    highlightMove(g_move)
}

function getLastMove () {
    var move = game.undo()
    if (move !== null) {
        game.move(move)
    }
    return move
}

function undoMove () {
    var undo_move = game.undo()
    if(undo_move !== null) {
        undo_moves.push (undo_move)
        move_list.pop()
        undo_scores.push(score_list.pop())
    }
    printScore()
    removeHighlight()
}

function pushBackMove () {
    if (undo_moves.length > 0) {
        var move = undo_moves.pop()
        playMove(move)
        score_list.push(undo_scores.pop())
        printScore()
    }
}

function checkForEngineMove () {
    if (engine_turn == game.turn()) {
        playAgentBestMove ()
    }
}

function printScore () {
  $('#score').html(score_list[score_list.length-1])
}

// Listeners

document.addEventListener('keyup', (e) => {
    if (e.code === "ArrowLeft") {

        uncheckEngineButton ()

        undoMove()

        var last_move = getLastMove()
        if (last_move !== null)
            highlightMove(last_move)

        board.position(game.fen())
        updateStatus()
    } 

    else if (e.code === "ArrowRight") {
        uncheckEngineButton ()
        pushBackMove ()
    }
    
    else if (e.code === "KeyR") {
        board.flip()
    }

    else if (e.code === "Semicolon") {
        console.log(move_list)
        console.log(undo_moves)
    }

    console.log(e.code)
});

$("#fen").on('keyup', function (e) {
    if (e.key === 'Enter') {

        if (game.validate_fen ($('#fen').val())['valid']) {
            game = new Chess ($('#fen').val())
            board.position(game.fen())
            startpos = game.fen()
            move_list = []
            undo_moves = []
            score_list = []
            undo_scores = []
        }

        updateStatus()
    }
});




// Start point

board = Chessboard('board', config)

startpos = game.fen()

updateStatus()