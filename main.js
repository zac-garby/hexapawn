var board
var state
var width = 5
var height = 10
var selected = null
var potentialPlayerMoves = []
var wins = {red: 0, blue: 0}
var winner

function init() {
    winner = null
    board = document.getElementById("board")
    state = []
    
    for (var y = 0; y < height; y++) {
        var row = []
        
        for (var x = 0; x < width; x++) {
            if (y == 0) {
                row.push("blue")
            } else if (y == (height - 1)) {
                row.push("red")
            } else {
                row.push(null)
            }
        }
        
        state.push(row)
    }
    
    render()
}

function render() {
    board.innerHTML = ""
    
    for (var y = 0; y < height; y++) {
        var row = document.createElement("tr")
        
        for (var x = 0; x < width; x++) {
            var cell = document.createElement("td")
            var colour = document.createElement("div")

            cell.className = state[y][x]
            cell.id = x + "," + y
            
            if (selected != null && x == selected.x && y == selected.y) {
                cell.classList.add("selected")
            }
            
            cell.appendChild(colour)
            row.appendChild(cell)
            
            const ycor = y
            const xcor = x
            
            cell.addEventListener("mousedown", function() {
                clickCell(xcor, ycor)
            })
        }
        
        board.appendChild(row)
    }
    
    document.getElementById("red-wins").innerHTML = wins.red
    document.getElementById("blue-wins").innerHTML = wins.blue
}

// [{from: {x, y}, to: {x, y}}, ...]
function moves(player) {
    if (player == "red") {
        state.reverse()
    }
    
    var other = player == "blue" ? "red" : "blue"
    var moves = []
    
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            if (state[y][x] == player) {
                // move forward
                if (y + 1 < height && state[y+1][x] == null) {
                    moves.push({
                        from: {x: x, y: y},
                        to: {x: x, y: y+1}
                    })
                }
                
                // attack left
                if (y + 1 < height && x - 1 >= 0 && state[y+1][x-1] == other) {
                    moves.push({
                        from: {x: x, y: y},
                        to: {x: x-1, y: y+1}
                    })
                }
                
                // attack right
                if (y + 1 < height && x + 1 < width && state[y+1][x+1] == other) {
                    moves.push({
                        from: {x: x, y: y},
                        to: {x: x+1, y: y+1}
                    })
                }
            }
        }
    }
    
    if (player == "red") {
        state.reverse()
    }
    
    if (player == "red") {
        moves = moves.map(move => {
            move.from.y = height - move.from.y - 1
            move.to.y = height - move.to.y - 1
            return move
        })
    }
    
    return moves
}

function move(from, to) {
    state[to.y][to.x] = state[from.y][from.x]
    state[from.y][from.x] = null
    render()
}

function win(previous) {
    for (var x = 0; x < width; x++) {
        if (state[0][x] == "red") {
            console.log("red reached blue's side so red wins")
            return "red"
        }
        
        if (state[height - 1][x] == "blue") {
            console.log("blue reached red's side so blue wins")
            return "blue"
        }
    }
    
    var flat = state.flat()
    if (!flat.some(x => x == "red")) {
        console.log("no red pieces left so blue wins")
        return "blue"
    } else if (!flat.some(x => x == "blue")) {
        console.log("no blue pieces left so red wins")
        return "red"
    }
    
    var opposer = previous == "red" ? "blue" : "red"
    if (moves(opposer).length == 0) {
        console.log("no moves left for", opposer, "so", previous, "wins")
        return previous
    } else if (moves(previous).length == 0) {
        console.log("no moves left for", previous, "so", opposer, "wins")
        return opposer
    }
    
    return null
}

function clickCell(x, y) {
    var moved = false
    
    if (selected != null) {
        for (var pot of potentialPlayerMoves) {
            if (selected.x == pot.from.x && selected.y == pot.from.y && pot.to.x == x && pot.to.y == y) {
                makePlayerMove(pot.from, pot.to)
                moved = true
                break
            }
        }
    }
    
    if (!moved) {
        if (state[y][x] == "red") {
            selected = {x: x, y: y}
            potentialPlayerMoves = moves("red")
        } else {
            selected = null
            potentialPlayerMoves = []
        }
    }
    
    render()
    checkWinner("red")
}

function makePlayerMove(from, to) {
    move(from, to)
    selected = null
    
    window.setTimeout(makeEnemyMove, 200)
}

function makeEnemyMove() {
    var possible = moves("blue")
    if (possible.length > 0) {
        var choice = possible[Math.round(Math.random() * (possible.length - 1))]
        move(choice.from, choice.to)
    }
    checkWinner("blue")
}

function checkWinner(previous) {
    if (winner != null) {
        return
    }
    
    winner = win(previous)
    if (winner != null) {
        window.setTimeout(() => finishGame(winner), 500)
    }
}

function finishGame(winner) {
    wins[winner]++
    init()
}