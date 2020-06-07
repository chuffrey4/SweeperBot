// made by jeff

function Minesweeper() {
  window._this = this;
  this.setup = function () {
    // get canvas context
    this.canvas = document.getElementById("game");
    this.canvasWidth = 600, this.canvasHeight = 600;
    this.gfx = this.canvas.getContext("2d");
    this.fieldWidth = 25, this.fieldHeight = 25; // match this w/h ratio to canvas' for square mines.
    this.generatedMines = 75;
    this.minesFlagged = 0;

    this.gameOver = false;
    this.won = false;
    this.flagging = false; // if flagging is currently enabled.

    this.infoParagraph = document.getElementById("info");
    this.infoParagraph.innerHTML = `<b>${this.fieldWidth}x${this.fieldHeight}</b> with <b>${this.generatedMines} mine${this.generatedMines != 1 ? "s" : ""}.</b>`

    //determine mine dimensions
    this.mineWidth = Math.floor(this.canvasWidth / this.fieldWidth); // use floor() because float math can leave gaps between
    this.mineHeight = Math.floor(this.canvasHeight / this.fieldHeight);

    this.textSize = Math.floor(this.mineHeight * 0.7);
    this.mineRadius = Math.ceil(this.mineHeight * 0.25);
    this.flagGap = Math.ceil(this.mineHeight * 0.2);

    this.gfx.textBaseline = "middle";
    this.gfx.textAlign = "center";
    this.gfx.font = `bold ${this.textSize}px sans-serif`;

    this.gameOver = false;
    this.wonGame = false;

    // clear background
    this.gfx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.generateField(); // gen field

    this.game = this;
  }

  this.generateField = function () { // width, height, and number of mines
    this.field = [];
    this.searched = [];
    this.flagged = [];
    var totalSize = this.fieldWidth * this.fieldHeight;
    var minesLeft = this.generatedMines; // mines left to generate
    if (this.generatedMines >= totalSize) {
      alert("Too many mines for current size of field");
      return;
    }
    var x, y; // x and y coordinates for the below for loop.
    for (var i = 0; i < totalSize; i++) {
      this.field[i] = 0;
      this.searched[i] = false;
      this.flagged[i] = false;
      x = i % this.fieldWidth;
      y = Math.floor(i / this.fieldWidth);
      this.gfx.fillStyle = (x + (y % 2)) % 2 == 0 ? "#555555" : "#666666";
      this.gfx.fillRect(x * this.mineWidth,
        y * this.mineHeight,
        this.mineWidth,
        this.mineHeight);
    }
    while (minesLeft > 0) { // loop to place all mines
      var rx = Math.floor(Math.random() * this.fieldWidth);
      var ry = Math.floor(Math.random() * this.fieldHeight);
      var idx = ry * this.fieldWidth + rx; // find a random coordinate within field
      if (this.field[idx] < 9) {
        this.field[idx] += 9; // arithmetically place mine?
        this.incrementAdjacent(idx);
        minesLeft--; // mine has been placed
      }
    }
  }

  this.incrementAdjacent = function (idx) { // tool for generating mines that checks the bounds of the field.
    var x = this.getFieldX(idx), y = this.getFieldY(idx);
    var xp = x < this.fieldWidth - 1, xn = x > 0; // x +/- available
    var yp = y < this.fieldHeight - 1, yn = y > 0; // y +/- availableif (xn&&yp) searchCell(x-1,y+1);
    if (xp && yp) this.field[this.getFieldIDX(x + 1, y + 1)]++;
    if (xn && yp) this.field[this.getFieldIDX(x - 1, y + 1)]++;
    if (xp && yn) this.field[this.getFieldIDX(x + 1, y - 1)]++;
    if (xn && yn) this.field[this.getFieldIDX(x - 1, y - 1)]++;
    if (xp) this.field[this.getFieldIDX(x + 1, y)]++;
    if (xn) this.field[this.getFieldIDX(x - 1, y)]++;
    if (yp) this.field[this.getFieldIDX(x, y + 1)]++;
    if (yn) this.field[this.getFieldIDX(x, y - 1)]++;
  }

  this.triggerCell = function (x,y) { // tool for bot argument
    if (!this.gameOver) {
      if (!this.flagging) {
        this.searchCell(x,y, true);
      } else {
        this.flagCell(x,y);
      }
    }
  }

  this.getFieldIDX = function (x, y) {
    return y * this.fieldWidth + x;
  }

  this.getFieldX = function (idx) {
    return (idx % this.fieldWidth);
  }

  this.getFieldY = function (idx) {
    return Math.floor(idx / this.fieldWidth);
  }

  this.flagCell = function (x, y) {
    var idx = this.getFieldIDX(x, y);
    if (!this.searched[idx]) {
      this.flagged[idx] = !this.flagged[idx];
      this.drawFlagStatus(x, y, this.flagged[idx]);
      if (this.field[idx] > 8) {
        if (this.flagged[idx]) {
          this.minesFlagged++;
          if (this.minesFlagged == this.generatedMines) {
            this.wonGame = true;
            this.endGame();
          }
        } else {
          this.minesFlagged--;
        }
      }
    }
  }

  this.drawFlagStatus = function (x, y, status) {
    this.gfx.fillStyle = (x + (y % 2)) % 2 == 0 ? "#555555" : "#666666";
    this.gfx.fillRect(x * this.mineWidth,
      y * this.mineHeight,
      this.mineWidth,
      this.mineHeight);
    if (status) {
      this.gfx.fillStyle = "#00CC00";
      this.gfx.fillRect(x * this.mineWidth + this.flagGap,
        y * this.mineHeight + this.flagGap,
        this.mineWidth - this.flagGap * 2,
        this.mineHeight - this.flagGap * 2);
    }
  }

  this.searchCell = function (x, y, manual = false) {
    var idx = this.getFieldIDX(x, y);
    if (!this.searched[idx] && !this.flagged[idx]) {
      if (this.field[idx] <= 0) {
        this.searched[idx] = true;
        this.gfx.fillStyle = (x + (y % 2)) % 2 == 0 ? "#FFFFFF" : "#EEEEEE";
        this.gfx.fillRect(x * this.mineWidth, y * this.mineHeight, this.mineWidth, this.mineHeight);
        var xp = x < this.fieldWidth - 1, xn = x > 0; // x +/- available
        var yp = y < this.fieldHeight - 1, yn = y > 0; // y +/- available
        if (xn && yp) this.searchCell(x - 1, y + 1);
        if (xp && yp) this.searchCell(x + 1, y + 1);
        if (xn && yn) this.searchCell(x - 1, y - 1);
        if (xp && yn) this.searchCell(x + 1, y - 1);
        if (xp) this.searchCell(x + 1, y);
        if (xn) this.searchCell(x - 1, y);
        if (yp) this.searchCell(x, y + 1);
        if (yn) this.searchCell(x, y - 1);
      } else if (this.field[idx] < 9) {
        this.searched[idx] = true;
        this.gfx.fillStyle = (x + (y % 2)) % 2 == 0 ? "#FFFFFF" : "#EEEEEE";
        this.gfx.fillRect(x * this.mineWidth, y * this.mineHeight, this.mineWidth, this.mineHeight);
        this.gfx.fillStyle = "#000000";
        this.gfx.fillText(this.field[idx], (x + 0.5) * this.mineWidth, (y + 0.5) * this.mineHeight);
      } else if (manual) {
        this.searched[idx] = true;
        this.gfx.fillStyle = "#FFFFFF";
        this.gfx.fillRect(x * this.mineWidth, y * this.mineHeight, this.mineWidth, this.mineHeight);
        this.gfx.fillStyle = "#FF0000";
        this.gfx.beginPath();
        this.gfx.ellipse((x + 0.5) * this.mineWidth, (y + 0.5) * this.mineHeight, this.mineRadius,
          this.mineRadius, 0, 0, 2 * Math.PI);
        this.gfx.fill();
        this.wonGame = false;
        this.endGame();
      }
    }
  }

  this.endGame = function () {
    this.gameOver = true;
    this.gfx.fillStyle = this.wonGame ? "#00AA00" : "#AA0000";
    this.gfx.fillText(`YOU HAVE ${this.wonGame ? "WON" : "LOST"} THE GAME!`, this.canvasWidth / 2, this.canvasHeight / 2 - this.textSize * 2);
    this.gfx.fillText("PRESS R TO PLAY AGAIN", this.canvasWidth / 2, this.canvasHeight / 2 + this.textSize * 2);
  }

  this.restart = function () {
    this.gameOver = false;
    this.setup();
  }
  this.enableFlagging = function () {
    this.flagging = true;
    //document.body.style.backgroundColor = "darkgreen";
  }
  this.disableFlagging = function () {
    this.flagging = false;
    //document.body.style.backgroundColor = "darkred";
  }
}

function Sweeperbot(ms) {
  this.ms = ms; // minesweeper object to be botted.

  this.setup = function() {
    this.restart();
  }

  this.restart = function () {
    this.ms.restart();
    var totalSize = this.ms.fieldWidth*this.ms.fieldHeight;
    this.solved = [];
    for (var i=0;i<totalSize;i++) {
      this.solved[i] = false;
    }
    this.useful = []; // list of indices in the minefield that are useful to solve using bot.
    this.startedSearching = false;
  }

  this.tick = function () {
    if (this.ms.gameOver) { // restarting counts as a tick
      this.restart();
    } else {
      var moveCompleted = false;
      if (this.startedSearching) {
        var ogTotal = this.useful.length;
        var cellsSearched = 0;
        while(!moveCompleted) {
          if (cellsSearched<ogTotal) {
            var cellToTry = this.useful.shift();
            cellsSearched++;
            if (this.solveCell(cellToTry)) {
              moveCompleted = true;
              this.solved[cellToTry] = true;
            } else {
              this.useful.push(cellToTry);
            }
          } else {
            this.searchRandom();
            this.findAllUseful();
            moveCompleted = true;
          }
        }
      } else {
        this.searchRandom();
        this.findAllUseful();
        this.startedSearching = true;
      }
    }
  }

  this.searchRandom = function () {
    this.ms.disableFlagging();
    this.ms.triggerCell(Math.floor(Math.random()*this.ms.fieldWidth),
      Math.floor(Math.random()*this.ms.fieldHeight));
  }

  this.findAllUseful = function () {
    this.useful = [];
    var totalSize = this.ms.fieldWidth * this.ms.fieldHeight;
    for (var i=0;i<totalSize;i++) {
      if (this.ms.searched[i]&&this.ms.field[i]>0&&!this.solved[i]) // if the bot has actually searched the field for this value.
        this.useful.push(i);
    }
  }

  this.solveCell = function (idx) {
    var x = this.ms.getFieldX(idx), y = this.ms.getFieldY(idx);
    var cellValue = this.ms.field[idx];
    console.log(`${cellValue} @ ${x}, ${y} :: f=${this.getFlaggedAdjacents(idx)}  u=${this.getUnsearchedAdjacents(idx)}`);
    if (this.getFlaggedAdjacents(idx) == cellValue) {
      this.searchAllAdjacents(idx);
      return true;
    }
    if (this.getUnsearchedAdjacents(idx) == cellValue) {
      this.flagAllAdjacents(idx);
      return true;
    }
    return false;
  }

  this.adjacentsBool = function (idx) { // starting top-left, clockwise, true false if there is an available cell to bounds.
    var results = [], x = this.ms.getFieldX(idx), y = this.ms.getFieldY(idx);
    var xp = x < this.ms.fieldWidth - 1, xn = x > 0; // x +/- available
    var yp = y < this.ms.fieldHeight - 1, yn = y > 0; // y +/- available
    results.push(xn && yn);
    results.push(yn);
    results.push(xp && yn);
    results.push(xp);
    results.push(xp && yp);
    results.push(yp);
    results.push(xn && yp);
    results.push(xn);
    return results;
  }
  this.adjacentsNumber = function (idx) { // starting top-left, clockwise, true false if there is an available cell to bounds.
    var results = this.adjacentsBool(idx);
    var adjs = 0;
    for (var i=0;i<8;i++) {
      if (results[i]) adjs++;
    }
    return adjs;
  }
  this.getAdjacentIDX = function (idx,rl) {// idx and relative location 0-7
    if (rl <= 0 || rl >= 6) idx--; // x-1
    if (rl <= 4 && rl >= 2) idx++; // x + 1
    if (rl <= 2) idx -= this.ms.fieldWidth; // y-1
    if (rl <= 6 && rl >= 4) idx += this.ms.fieldWidth // y + 1
    if (idx < 0 || idx >= this.ms.fieldWidth * this.ms.fieldHeight) console.error(`getAdjacentIDX out of range: ${idx}, ${rl}`);
    return idx;
  }
  this.getUnsearchedAdjacents = function (idx) {
    var abs = this.adjacentsBool(idx);
    var us = 0; // unsearched
    if (abs[0]&&!this.ms.searched[idx-this.ms.fieldWidth-1]) us++;
    if (abs[1]&&!this.ms.searched[idx-this.ms.fieldWidth]) us++;
    if (abs[2]&&!this.ms.searched[idx-this.ms.fieldWidth+1]) us++;
    if (abs[3]&&!this.ms.searched[idx+1]) us++;
    if (abs[4]&&!this.ms.searched[idx+this.ms.fieldWidth+1]) us++;
    if (abs[5]&&!this.ms.searched[idx+this.ms.fieldWidth]) us++;
    if (abs[6]&&!this.ms.searched[idx+this.ms.fieldWidth-1]) us++;
    if (abs[7]&&!this.ms.searched[idx-1]) us++;
    return us;
  }
  this.getFlaggedAdjacents = function (idx) {
    var abs = this.adjacentsBool(idx);
    var flj = 0; // flagged adjacents
    if (abs[0]&&this.ms.flagged[idx-this.ms.fieldWidth-1]) flj++;
    if (abs[1]&&this.ms.flagged[idx-this.ms.fieldWidth]) flj++;
    if (abs[2]&&this.ms.flagged[idx-this.ms.fieldWidth+1]) flj++;
    if (abs[3]&&this.ms.flagged[idx+1]) flj++;
    if (abs[4]&&this.ms.flagged[idx+this.ms.fieldWidth+1]) flj++;
    if (abs[5]&&this.ms.flagged[idx+this.ms.fieldWidth]) flj++;
    if (abs[6]&&this.ms.flagged[idx+this.ms.fieldWidth-1]) flj++;
    if (abs[7]&&this.ms.flagged[idx-1]) flj++;
    return flj;
  }
  this.flagAllAdjacents = function(idx) {
    var abs = this.adjacentsBool(idx);
    var x = this.ms.getFieldX(idx), y = this.ms.getFieldY(idx);
    console.log(`flagging all adj at ${x}, ${y}`);
    this.ms.enableFlagging();
    if (abs[0]&&!this.ms.flagged[idx-this.ms.fieldWidth-1]) this.ms.triggerCell(x-1,y-1);
    if (abs[1]&&!this.ms.flagged[idx-this.ms.fieldWidth]) this.ms.triggerCell(x,y-1);
    if (abs[2]&&!this.ms.flagged[idx-this.ms.fieldWidth+1]) this.ms.triggerCell(x+1,y-1);
    if (abs[3]&&!this.ms.flagged[idx+1]) this.ms.triggerCell(x+1,y);
    if (abs[4]&&!this.ms.flagged[idx+this.ms.fieldWidth-1]) this.ms.triggerCell(x+1,y+1);
    if (abs[5]&&!this.ms.flagged[idx+this.ms.fieldWidth]) this.ms.triggerCell(x,y+1);
    if (abs[6]&&!this.ms.flagged[idx+this.ms.fieldWidth-1]) this.ms.triggerCell(x-1,y+1);
    if (abs[7]&&!this.ms.flagged[idx-1]) this.ms.triggerCell(x-1,y);
  }
  this.searchAllAdjacents = function (idx) {
    var abs = this.adjacentsBool(idx);
    var x = this.ms.getFieldX(idx), y = this.ms.getFieldY(idx);
    this.ms.disableFlagging();
    if (abs[0]) this.ms.triggerCell(x-1,y-1);
    if (abs[1]) this.ms.triggerCell(x,y-1);
    if (abs[2]) this.ms.triggerCell(x+1,y-1);
    if (abs[3]) this.ms.triggerCell(x+1,y);
    if (abs[4]) this.ms.triggerCell(x+1,y+1);
    if (abs[5]) this.ms.triggerCell(x,y+1);
    if (abs[6]) this.ms.triggerCell(x-1,y+1);
    if (abs[7]) this.ms.triggerCell(x-1,y);
  }
}

window.minesweeper = new Minesweeper();
window.sweeperbot = new Sweeperbot(minesweeper);
function start() {
  sweeperbot.setup();
  setInterval(tickit, 50);
}
function tickit() {
  sweeperbot.tick();
}
window.addEventListener("load", start);
