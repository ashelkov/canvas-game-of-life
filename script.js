(function() {
  window.onload = init;

  const ROWS = 80;
  const COLS = 120;
  const CELLSIZE = 6;
  const WIDTH = COLS * CELLSIZE + COLS - 1;
  const HEIGHT = ROWS * CELLSIZE + ROWS - 1;
  const DENSITY = 0.15;

  let gen = [];
  let generation;
  let pop1;
  let pop2;
  let tickDelay = 75;

  let canvas;
  let ctx;
  let intervalId;

  let allowDrawing = true;
  let isDrawing = false;
  let drawColor = 1;

  const ctrl = {};

  function init() {
    canvas = document.getElementById('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    ctx = canvas.getContext('2d');

    addEventListeners(canvas);

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

    ctrl.fasterBtn = document.getElementById('faster');
    ctrl.fasterBtn.addEventListener('click', () => {
      ctrl.fasterBtn.classList.toggle('active');
      tickDelay = tickDelay === 75 ? 40 : 75;
      if (intervalId) {
        pause();
        startOrPause();
      }
    });

    ctrl.genCounter = document.getElementById('gen_counter');
    ctrl.popCounter = document.getElementById('pop_counter');

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', () => (isDrawing = false));
    canvas.addEventListener('mousemove', handleDrawing);
    canvas.addEventListener('click', handleDrawing);
    canvas.addEventListener('contextmenu', function(e) {
      if (e.button == 2) {
        e.preventDefault();
      }
    });

    ctrl.progressBar = document.querySelector('.progress .bar');
    ctrl.pop1 = document.querySelector('.pop1');
    ctrl.pop2 = document.querySelector('.pop2');
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
    pop1 = 0;
    pop2 = 0;
    for (var i = 0; i < ROWS; i++) {
      for (var j = 0, row = []; j < COLS; j++) {
        const rnd = Math.random();
        row[j] = rnd < density ? (rnd < density / 2 ? 1 : 2) : 0;
        if (row[j] === 1) pop1++;
        if (row[j] === 2) pop2++;
      }
      gen.push(row);
    }
    updateCounters();
    canvas.classList.add('drawable');
    allowDrawing = true;
  }

  function drawField() {
    for (var i = 0; i < ROWS; i++) {
      for (var j = 0; j < COLS; j++) {
        ctx.fillStyle = ['black', 'limegreen', 'orange'][gen[i][j]];
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
      intervalId = setInterval(tick, tickDelay);
      ctrl.playBtn.innerText = 'pause';
      ctrl.tickBtn.disabled = true;
      ctrl.clearBtn.disabled = true;
      ctrl.genBtn.disabled = true;
      canvas.classList.remove('drawable');
      allowDrawing = false;
    }
  }

  function pause() {
    clearInterval(intervalId);
    intervalId = null;
    ctrl.playBtn.innerText = 'play';
    ctrl.tickBtn.disabled = false;
    ctrl.clearBtn.disabled = false;
    ctrl.genBtn.disabled = false;
    canvas.classList.add('drawable');
    allowDrawing = true;
  }

  function tick() {
    nextGeneration();
    drawField();
    updateCounters();
  }

  function nextGeneration() {
    const nextGen = [];
    pop1 = 0;
    pop2 = 0;
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
        const alive = around.filter((_) => !!_);
        if (alive.length === 2) row[j] = gen[i][j];
        if (alive.length === 3) row[j] = alive.filter((_) => _ === 1).length > 1 ? 1 : 2;
        if (alive.length < 2 || alive.length > 3) row[j] = 0;
        if (row[j] === 1) pop1++;
        if (row[j] === 2) pop2++;
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
    ctrl.popCounter.innerText = pop1 + pop2;
    updateProgress();
  }

  function handleMouseDown(e) {
    if (!allowDrawing) return;
    isDrawing = true;
    const i = (e.offsetY / (CELLSIZE + 1)) | 0;
    const j = (e.offsetX / (CELLSIZE + 1)) | 0;
    drawColor = gen[i][j] ? 0 : e.button ? 2 : 1;
  }

  function handleDrawing(e) {
    if (e.type === 'click' && !allowDrawing) return;
    if (e.type === 'mousemove' && !isDrawing) return;
    const i = (e.offsetY / (CELLSIZE + 1)) | 0;
    const j = (e.offsetX / (CELLSIZE + 1)) | 0;
    gen[i][j] = drawColor;
    const x1 = j * (CELLSIZE + 1);
    const y1 = i * (CELLSIZE + 1);
    ctx.fillStyle = ['black', 'limegreen', 'orange'][drawColor];
    ctx.fillRect(x1, y1, CELLSIZE, CELLSIZE);
  }

  function updateProgress() {
    ctrl.progressBar.style.width = `${Math.round((pop1 / (pop1 + pop2)) * 1000) / 10}%`;
    ctrl.pop1.innerText = pop1;
    ctrl.pop2.innerText = pop2;
  }
})();
