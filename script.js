// made by jeff

var canvas, gfx;
var canvasWidth = 600, canvasHeight = 600;

var infoParagraph; // reference to info p element

const fieldWidth = 25, fieldHeight = 25; // match this w/h ratio to canvas' for square mines.
var generatedMines;

var mineWidth, mineHeight;

// 0=no mine here or adjacent, 1-8 mine adjacent, <9 is a mine
var field; // variable for array for field
var searched;
var flagged;

var textSize, mineRadius, flagGap;

var gameOver = false;
var won = false;
var flagging = false; // if flagging is currently enabled.

var minesFlagged;

function setup() {
  // get canvas context
  canvas = document.getElementById("game");
  gfx = canvas.getContext("2d");
  generatedMines = 100;
  minesFlagged = 0;

  infoParagraph = document.getElementById("info");
  infoParagraph.innerHTML = `<b>${fieldWidth}x${fieldHeight}</b> with <b>${generatedMines} mines</b>`

  //determine mine dimensions
  mineWidth = Math.floor(canvasWidth / fieldWidth); // use floor() because float math can leave gaps between
  mineHeight = Math.floor(canvasHeight / fieldHeight);

  textSize = Math.floor(mineHeight * 0.7);
  mineRadius = Math.ceil(textSize * 0.35);
  flagGap = Math.ceil(textSize * 0.2);

  gfx.textBaseline = "middle";
  gfx.textAlign = "center";
  gfx.font = `bold ${textSize}px sans-serif`;

  gameOver = false;
  wonGame = false;

  // clear background
  gfx.clearRect(0, 0, canvasWidth, canvasHeight);
  generateField(); // gen field

  canvas.addEventListener("click", mouseClicked);
}

function generateField() { // width, height, and number of mines
  field = [];
  searched = [];
  flagged = [];
  var totalSize = fieldWidth * fieldHeight;
  var minesLeft = generatedMines; // mines left to generate
  if (generatedMines >= totalSize) {
    alert("Too many mines for current size of field");
    return;
  }
  var x, y; // x and y coordinates for the below for loop.
  for (var i = 0; i < totalSize; i++) {
    field[i] = 0;
    searched[i] = false;
    flagged[i] = false;
    x = i % fieldWidth;
    y = Math.floor(i / fieldWidth);
    gfx.fillStyle = (x + (y % 2)) % 2 == 0 ? "#555555" : "#666666";
    gfx.fillRect(x * mineWidth,
      y * mineHeight,
      mineWidth,
      mineHeight);
  }
  while (minesLeft > 0) { // loop to place all mines
    var rx = Math.floor(Math.random() * fieldWidth);
    var ry = Math.floor(Math.random() * fieldHeight);
    var idx = ry * fieldWidth + rx; // find a random coordinate within field
    if (field[idx] < 9) {
      field[idx] += 9; // arithmetically place mine?
      incrementAdjacent(idx);
      minesLeft--; // mine has been placed
    }
  }
}

function incrementAdjacent(idx) { // tool for generating mines that checks the bounds of the field.
  var x = getFieldX(idx), y = getFieldY(idx);
  var xp = x < fieldWidth - 1, xn = x > 0; // x +/- available
  var yp = y < fieldHeight - 1, yn = y > 0; // y +/- availableif (xn&&yp) searchCell(x-1,y+1);
  if (xp && yp) field[getFieldIDX(x + 1, y + 1)]++;
  if (xn && yp) field[getFieldIDX(x - 1, y + 1)]++;
  if (xp && yn) field[getFieldIDX(x + 1, y - 1)]++;
  if (xn && yn) field[getFieldIDX(x - 1, y - 1)]++;
  if (xp) field[getFieldIDX(x + 1, y)]++;
  if (xn) field[getFieldIDX(x - 1, y)]++;
  if (yp) field[getFieldIDX(x, y + 1)]++;
  if (yn) field[getFieldIDX(x, y - 1)]++;
}

function mouseClicked(me) { // mouseevent argument
  if (!gameOver) {
    if (!flagging) {
      searchCell(Math.floor(me.offsetX / mineWidth),
        Math.floor(me.offsetY / mineHeight), true);
    } else {
      flagCell(Math.floor(me.offsetX / mineWidth),
        Math.floor(me.offsetY / mineHeight));
    }
  }
}

function getFieldIDX(x, y) {
  return y * fieldWidth + x;
}

function getFieldX(idx) {
  return (idx % fieldWidth);
}

function getFieldY(idx) {
  return Math.floor(idx / fieldWidth);
}

function flagCell(x, y) {
  var idx = getFieldIDX(x, y);
  if (!searched[idx]) {
    flagged[idx] = !flagged[idx];
    drawFlagStatus(x, y, flagged[idx]);
    if (field[idx] > 8) {
      if (flagged[idx]) {
        minesFlagged++;
        if (minesFlagged >= generatedMines) {
          wonGame = true;
          endGame();
        }
      } else {
        minesFlagged--;
      }
    }
  }
}

function drawFlagStatus(x, y, status) {
  gfx.fillStyle = (x + (y % 2)) % 2 == 0 ? "#555555" : "#666666";
  gfx.fillRect(x * mineWidth,
    y * mineHeight,
    mineWidth,
    mineHeight);
  if (status) {
    gfx.fillStyle = "#00CC00";
    gfx.fillRect(x * mineWidth + flagGap,
      y * mineHeight + flagGap,
      mineWidth - flagGap * 2,
      mineHeight - flagGap * 2);
  }
}

function searchCell(x, y, manual = false) {
  var idx = getFieldIDX(x, y);
  if (!searched[idx] && !flagged[idx]) {
    if (field[idx] <= 0) {
      searched[idx] = true;
      gfx.fillStyle = "#FFFFFF";
      gfx.fillRect(x * mineWidth, y * mineHeight, mineWidth, mineHeight);
      var xp = x < fieldWidth - 1, xn = x > 0; // x +/- available
      var yp = y < fieldHeight - 1, yn = y > 0; // y +/- available
      if (xn && yp) searchCell(x - 1, y + 1);
      if (xp && yp) searchCell(x + 1, y + 1);
      if (xn && yn) searchCell(x - 1, y - 1);
      if (xp && yn) searchCell(x + 1, y - 1);
      if (xp) searchCell(x + 1, y);
      if (xn) searchCell(x - 1, y);
      if (yp) searchCell(x, y + 1);
      if (yn) searchCell(x, y - 1);
    } else if (field[idx] < 9) {
      searched[idx] = true;
      gfx.fillStyle = "#FFFFFF";
      gfx.fillRect(x * mineWidth, y * mineHeight, mineWidth, mineHeight);
      gfx.fillStyle = "#000000";
      gfx.fillText(field[idx], (x + 0.5) * mineWidth, (y + 0.5) * mineHeight);
    } else if (manual) {
      searched[idx] = true;
      gfx.fillStyle = "#FFFFFF";
      gfx.fillRect(x * mineWidth, y * mineHeight, mineWidth, mineHeight);
      gfx.fillStyle = "#FF0000";
      gfx.beginPath();
      gfx.ellipse((x + 0.5) * mineWidth, (y + 0.5) * mineHeight, mineRadius,
        mineRadius, 0, 0, 2 * Math.PI);
      gfx.fill();
      wonGame = false;
      endGame();
    }
  }
}

function endGame() {
  gameOver = true;
  gfx.fillStyle = wonGame ? "#00AA00" : "#AA0000";
  gfx.fillText(`YOU HAVE ${wonGame ? "WON" : "LOST"} THE GAME!`, canvasWidth / 2, canvasHeight / 2 - textSize * 2);
  gfx.fillText("PRESS R TO PLAY AGAIN", canvasWidth / 2, canvasHeight / 2 + textSize * 2);
}

function keyResponse(e) {
  if (e.code == "KeyR") {
    gameOver = false;
    setup();
  }
  if (e.code == "KeyI" && !gameOver) {
    flagging = !flagging;
    if (flagging)
      document.body.style.backgroundColor = "darkgreen";
    else
      document.body.style.backgroundColor = "darkred";
  }
}

document.addEventListener("keypress", keyResponse)

window.addEventListener("load", setup);