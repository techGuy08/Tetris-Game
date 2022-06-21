window.addEventListener("load", function () {
  let canvas = document.querySelector("#canvas");
  let ctx = canvas.getContext("2d");
  ctx.scale(20, 20);
  let isPlaying = true;
  let score = 0;
  let d = new Date().getTime();
  let dropCounter = 0;
  let dropInterval = 1000;
  let lastTime = 0;
  let step = function (time = 0) {
    if (isPlaying) {
      const dTime = time - lastTime;
      lastTime = time;
      dropCounter += dTime;
      if (dropCounter >= dropInterval) {
        playerDrop();
      }
      draw();
      checkcollide();
      stageSweep();
      let playTime = parseInt((new Date().getTime() - d) / 1000);
      if (playTime > 60) {
        let m, s;
        m = parseInt(playTime / 60);
        s = playTime - m * 60;
        playTime = m + "m " + s + "s";
      }
      document.querySelector(".time").innerHTML = playTime;
    }
    window.requestAnimationFrame(step);
  };
  const player = {
    pos: { x: 5, y: 0 },
    matrix: createPiece("T"),
  };
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShape(player.matrix, player.pos);
    drawShape(stage, { x: 0, y: 0 });
  }

  function drawShape(matrix, offset) {
    matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          let colors = [
            null,
            " #ff471a",
            "#3399ff",
            "#40bf40",
            "#ffa31a",
            "#b366ff",
            "#ff4da6",
            "#d2a679",
          ];
          ctx.fillStyle = "white";
          ctx.fillRect(x + offset.x - 0.05, y + offset.y - 0.05, 1, 1);
          ctx.fillStyle = colors[value];
          ctx.fillRect(x + offset.x, y + offset.y, 0.95, 0.95);
        }
      });
    });
  }
  function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
      matrix.push(new Array(w).fill(0));
    }
    return matrix;
  }
  let stage = createMatrix(12, 20);
  stage.push(new Array(20).fill(1));
  function merge(stage, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          stage[y + player.pos.y][x + player.pos.x] = value;
        }
      });
    });
  }
  function collide(stage, player) {
    let [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; y++) {
      for (let x = 0; x < m[y].length; x++) {
        if (m[y][x] !== 0 && stage[y + o.y] && stage[y + o.y][x + o.x] !== 0) {
          return true;
        }
      }
    }
    return false;
  }
  function playerDrop() {
    checkcollide();
    player.pos.y++;

    dropCounter = 0;
  }
  function checkcollide() {
    if (
      collide(stage, player) ||
      player.pos.y + player.matrix.length > stage.length
    ) {
      player.pos.y--;
      merge(stage, player);
      playerReset();
      score += 10;
      document.querySelector(".score").innerHTML = score;
    }
  }
  function playerMove(dir) {
    player.pos.x += dir;
    if (collide(stage, player)) {
      player.pos.x -= dir;
    }
  }
  function playerReset() {
    pieces = "ILJOTSZ";
    player.matrix = createPiece(pieces[(pieces.length * Math.random()) | 0]);
    player.pos.y = 0;
    player.pos.x =
      ((stage[0].length / 2) | 0) - ((player.matrix[0].length / 2) | 0);
    if (collide(stage, player)) {
      stage = createMatrix(12, 20);
      stage.push(new Array(20).fill(1));
      isPlaying = false;
      document.querySelector(".screen .title").classList.add("red");
      document.querySelector(".screen .title").innerHTML = "Game Over";
    }
  }
  function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
      }
    }
    if (dir > 0) {
      matrix.forEach((row) => {
        row.reverse();
      });
    } else {
      matrix.reverse();
    }
  }
  function createPiece(type) {
    let matrix;
    if (type == "T") {
      matrix = [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
    } else if (type == "O") {
      matrix = [
        [7, 7],
        [7, 7],
      ];
    } else if (type == "L") {
      matrix = [
        [0, 6, 0],
        [0, 6, 0],
        [0, 6, 6],
      ];
    } else if (type == "J") {
      matrix = [
        [0, 5, 0],
        [0, 5, 0],
        [5, 5, 0],
      ];
    } else if (type == "S") {
      matrix = [
        [0, 4, 4],
        [4, 4, 0],
        [0, 0, 0],
      ];
    } else if (type == "Z") {
      matrix = [
        [3, 3, 0],
        [0, 3, 3],
        [0, 0, 0],
      ];
    } else if (type == "I") {
      matrix = [
        [0, 2, 0, 0],
        [0, 2, 0, 0],
        [0, 2, 0, 0],
        [0, 2, 0, 0],
      ];
    }
    return matrix;
  }
  function playerRotate(dir) {
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(stage, player)) {
      player.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
    }
  }
  function stageSweep() {
    for (let y = stage.length - 2; y > 0; y--) {
      if (
        stage[y].every((value) => {
          return value !== 0;
        })
      ) {
        let row = stage.splice(y, 1)[0].fill(0);
        stage.unshift(row);
        score += 100;
        document.querySelector(".score").innerHTML = score;
      }
    }
  }
  function init() {
    score = 0;
    document.querySelector(".screen .title").innerHTML = "Tetris Challenge";
    document.querySelector(".screen .title").classList.remove("red");
    isPlaying = true;
    d = new Date().getTime();
    playerReset();
    document.querySelector(".score").innerHTML = score;
  }
  document.querySelector(".start").addEventListener("click", init);
  step();
  playerReset();
  function playBtn(key) {
    if (key == "ArrowDown") {
      playerDrop();
    } else if (key == "ArrowRight") {
      playerMove(1);
    } else if (key == "ArrowLeft") {
      playerMove(-1);
    } else if (key == "q") {
      playerRotate(-1);
    } else if (key == "w") {
      playerRotate(1);
    }
  }
  window.addEventListener("keydown", function (e) {
    playBtn(e.key);
  });
  document.querySelectorAll(".btn-control").forEach(function (btn) {
    btn.addEventListener("click", function () {
      playBtn(btn.getAttribute("data-key"));
    });
  });
});
