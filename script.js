(function() {
  window.onload = init;

  const ROWS = 80;
  const COLS = 120;
  const CELLSIZE = 6;
  const WIDTH = COLS * CELLSIZE + COLS - 1;
  const HEIGHT = ROWS * CELLSIZE + ROWS - 1;
  const TICK = 75;
  const DENSITY = 0.15;

  let gen = [];
  let generation;
  let population;

  let ctx;
  let intervalId;

  const ctrl = {};

  function init() {
    const canvas = document.getElementById('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    ctx = canvas.getContext('2d');

    addEventListeners();

    drawGrid();
    clearField();
  }

  function addEventListeners() {
    ctrl.playBtn = document.getElementById('play');
    ctrl.playBtn.addEventListener('click', startOrPause);

    ctrl.tickBtn = document.getElementById('tick');
    ctrl.tickBtn.addEventListener('click', tick);

    ctrl.genBtn = document.getElementById('generate');
    ctrl.genBtn.addEventListener('click', function() {
      generateField({ density: DENSITY });
      drawField();
    });

    ctrl.clearBtn = document.getElementById('clear');
    ctrl.clearBtn.addEventListener('click', function() {
      generateField({ density: 0 });
      drawField();
    });

    ctrl.genCounter = document.getElementById('gen_counter');
    ctrl.popCounter = document.getElementById('pop_counter');
  }

  function drawGrid() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 0.4;

    for (var i = 1; i <= COLS; i++) {
      const shift = i * CELLSIZE + i;
      ctx.beginPath();
      ctx.moveTo(shift, 0);
      ctx.lineTo(shift, HEIGHT);
      ctx.stroke();
    }
    for (var i = 1; i <= ROWS; i++) {
      const shift = i * CELLSIZE + i;
      ctx.beginPath();
      ctx.moveTo(0, shift);
      ctx.lineTo(WIDTH, shift);
      ctx.stroke();
    }
  }

  function generateField({ density = DENSITY }) {
    gen = [];
    generation = 0;
    population = 0;
    for (var i = 0; i < ROWS; i++) {
      for (var j = 0, row = []; j < COLS; j++) {
        row[j] = Math.random() < density ? (population++, 1) : 0;
        population += row[j];
      }
      gen.push(row);
    }
    updateCounters();
  }

  function drawField() {
    for (var i = 0; i < ROWS; i++) {
      for (var j = 0; j < COLS; j++) {
        ctx.fillStyle = gen[i][j] ? 'limegreen' : 'black';
        const x1 = j * (CELLSIZE + 1);
        const y1 = i * (CELLSIZE + 1);
        ctx.fillRect(x1, y1, CELLSIZE, CELLSIZE);
      }
    }
  }

  function startOrPause() {
    if (intervalId) {
      pause();
    } else {
      intervalId = setInterval(tick, TICK);
      ctrl.playBtn.innerText = 'pause';
      ctrl.tickBtn.disabled = true;
      ctrl.clearBtn.disabled = true;
      ctrl.genBtn.disabled = true;
    }
  }

  function pause() {
    clearInterval(intervalId);
    intervalId = null;
    ctrl.playBtn.innerText = 'play';
    ctrl.tickBtn.disabled = false;
    ctrl.clearBtn.disabled = false;
    ctrl.genBtn.disabled = false;
  }

  function tick() {
    nextGeneration();
    drawField();
    updateCounters();
  }

  function nextGeneration() {
    const nextGen = [];
    population = 0;
    for (var i = 0; i < ROWS; i++) {
      for (var j = 0, row = []; j < COLS; j++) {
        const iprev = i === 0 ? ROWS - 1 : i - 1;
        const inext = i === ROWS - 1 ? 0 : i + 1;
        const jprev = j === 0 ? COLS - 1 : j - 1;
        const jnext = j === COLS - 1 ? 0 : j + 1;
        const around = [
          gen[iprev][jprev],
          gen[iprev][j],
          gen[iprev][jnext],
          gen[i][jprev],
          gen[i][jnext],
          gen[inext][jprev],
          gen[inext][j],
          gen[inext][jnext],
        ];
        const value = around.filter((_) => !!_).length;
        if (value === 2) row[j] = gen[i][j];
        if (value === 3) row[j] = 1;
        if (value < 2 || value > 3) row[j] = 0;
        population += row[j];
      }
      nextGen.push(row);
    }
    gen = nextGen;
    generation++;
  }

  function clearField() {
    generateField({ density: DENSITY });
    drawField();
  }

  function updateCounters() {
    ctrl.genCounter.innerText = generation;
    ctrl.popCounter.innerText = population;
  }
})();
