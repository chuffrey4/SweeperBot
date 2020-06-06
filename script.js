// made by jeff

function Minesweeper() {
  window._this = this;
  this.setup = function () {
    // get canvas context
    this.canvas = document.getElementById("game");
    this.canvasWidth = 600, this.canvasHeight = 600;
    this.gfx = this.canvas.getContext("2d");
    this.fieldWidth = 25, this.fieldHeight = 25; // match this w/h ratio to canvas' for square mines.
    this.generatedMines = 1;
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
        this.gfx.fillStyle = "#FFFFFF";
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
        this.gfx.fillStyle = "#FFFFFF";
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
    this.flagging = false;
    document.body.style.backgroundColor = "darkgreen";
  }
  this.disableFlagging = function () {
    this.flagging = false;
    document.body.style.backgroundColor = "darkred";
  }
}
window.minesweeper = new Minesweeper();
function start() {
  minesweeper.setup();
}
window.addEventListener("load", start);
