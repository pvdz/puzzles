const DEFAULT_PUZZLES = [
  {
    name: '4x5',
    w: 4,
    h: 5,
    groups: [
      0, 0, 0, 1,
      0, 0, 2, 2,
      3, 3, 2, 2,
      3, 3, 4, 4,
      3, 4, 4, 4,
    ],
    prefills: [
      0, 5, 0, 0,
      0, 3, 0, 0,
      0, 0, 0, 4,
      1, 0, 0, 0,
      4, 0, 0, 1,
    ],
  },
  {
    name: '9x5',
    w: 9,
    h: 5,
    groups: [
      0, 0, 0, 1, 1, 1, 2, 2, 3,
      0, 0, 4, 4, 1, 1, 5, 5, 3,
      6, 6, 6, 4, 4, 5, 5, 3, 3,
      6, 6, 7, 7, 4, 5, 8, 9, 3,
      7, 7, 7, 8, 8, 8, 8, 9, 9,
    ],
    prefills: [
      2, 0, 3, 0, 0, 0, 0, 0, 0,
      0, 0, 4, 0, 5, 0, 4, 0, 3,
      0, 3, 5, 0, 0, 0, 0, 0, 2,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 2, 0, 0, 4, 1, 0, 0, 0,
    ],
  },
  {
    name: '9x11',
    w: 9,
    h: 11,
    groups: [
       1, 1, 2, 2, 2, 2, 3, 3, 4,
       1, 1, 5, 6, 2, 7, 3, 3, 4,
       1, 5, 5, 6, 7, 7, 8, 3, 4,
       5, 5, 6, 6, 7, 7,12, 4, 4,
       9, 9, 6,10,10,12,12,13,13,
       9, 9,11,10,10,12,12,13,13,
       9,11,11,11,10,16,16,17,13,
      18,11,20,20,16,16,17,17,17,
      18,20,20,20,16,21,22,23,17,
      19,19,24,24,24,21,21,23,23,
      19,19,19,24,24,21,21,23,23,
    ],
    prefills: [
      0, 4, 0, 0, 0, 0, 0, 3, 0,
      0, 0, 0, 3, 5, 0, 5, 0, 0,
      1, 0, 0, 0, 0, 0, 0, 0, 1,
      0, 4, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 4, 0, 1, 0, 0, 2, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      2, 0, 0, 4, 0, 3, 0, 0, 4,
      0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 5, 0, 0, 0, 0, 5, 0, 0,
    ],
  }
];
let PUZZLES = JSON.parse(localStorage.getItem('puzzles-tectonic')||null) || JSON.parse(JSON.stringify(DEFAULT_PUZZLES)); // lazy clone

function work(puzzle, keepInputs, forced) {
  loadPuzzle(puzzle, keepInputs);

  B.innerHTML = '(press solve)';
  if (AS.checked || forced) solve(puzzle);
}

function loadPuzzle(puzzle, keepInputs) {
  let width = puzzle.w;
  let height = puzzle.h;

  let groups = puzzle.groups;
  let prefills = puzzle.prefills;

  A.innerHTML = '';
  B.innerHTML = '';

  if (!keepInputs) {
    W.value = width;
    H.value = height;

    // we need this otherwise inputs may not exist in the loops below
    // it will add/shrink them up to the width/height that we set above
    createInputs();

    // fill the inputs
    let n = 0;
    let inputsG = IG.querySelectorAll('input');
    let inputsV = IV.querySelectorAll('input');
    for (let j = 0; j < height; ++j) {
      for (let i = 0; i < width; ++i) {
        inputsG[n].value = groups[n];
        inputsV[n].value = prefills[n] || '';
        ++n;
      }
    }

    // this makes the group bordering set up in VI which we'd otherwise miss when loading a new puzzle
    createInputs();
  }

  drawPuzzle(A, width, height, groups, groups, true);
  drawPuzzle(A, width, height, groups, prefills);
}
function solve(puzzle) {
  B.innerHTML = 'Preparing to solve...';

  let width = puzzle.w;
  let height = puzzle.h;

  let groups = puzzle.groups;
  let prefills = puzzle.prefills;

  let vars = []; // solver var refs
  let groupIds = [];
  let varsPerGroup = [];

  let S = new Solver;

  let n = 0;
  for (let j = 0; j < height; ++j) {
    for (let i = 0; i < width; ++i) {
      let v = S.addVar('c' + i + 'x' + j, prefills[n] ? [prefills[n], prefills[n]] : [1, 100]);
      vars.push(v);

      let groupId = groups[n];
      let groupIndex = groupIds.indexOf(groupId);
      if (groupIndex < 0) {
        groupIndex = groupIds.length;
        groupIds.push(groupId);
      }

      // collect vars per group so we can distinct them
      if (!varsPerGroup[groupIndex]) varsPerGroup[groupIndex] = [];
      varsPerGroup[groupIndex].push(v);

      // constrain each cell such that it has no neighbor with same value
      // we check [nw n ne e] so if xy are non-zero, the cells will exist
      // and if we only compare to cells already visited, their vars will exist
      if (i || j) {
        if (i) {
          S.neq(v, vars[n - 1]); // w
          if (j) {
            S.neq(v, vars[n - 1 - width]); // nw
          }
        }
        if (j) {
          S.neq(v, vars[n - width]); // n
          if (i < width - 1) {
            S.neq(v, vars[n + 1 - width]); // ne
          }
        }
      }

      ++n;
    }
  }

  for (let groupIndex = 0; groupIndex < varsPerGroup.length; ++groupIndex) {
    // each cell in a group should be unique
    S.distinct(varsPerGroup[groupIndex]);
    // make sure the sum of cells is equal to the sum of 0..n (with n being the number of cells in the group)
    // this is a little backwards but we did not know the size of a group when defining the vars. their domains should've been [0,n]
    let t = 0;
    for (let a = 0; a < varsPerGroup[groupIndex].length; ++a) t += a + 1;
    S.eq(S.sum(varsPerGroup[groupIndex]), t);
  }

  SPIN.style.display = 'inline';
  B.innerHTML = 'Solving...';
  setTimeout(_ => {
    S.solve({max: Math.max(2, parseInt(T.value, 10)), log: 1});
    SPIN.style.display = 'none';
    B.innerHTML = S.solutions.length ? '' : '(no solutions found)';

    let solutions = S.solutions;
    for (var s = 0; s < solutions.length; ++s) {
      let solution = solutions[s];

      let values = [];
      let n = 0;
      for (let j = 0; j < height; ++j) {
        for (let i = 0; i < width; ++i) {
          values[n++] = solution['c' + i + 'x' + j];
        }
      }

      drawPuzzle(B, width, height, groups, values);
    }
  }, 10);
}

function drawPuzzle(parent, width, height, groups, values, drawZeroes) {
  let container = document.createElement('div');

  let n = 0;
  for (let j = 0; j < height; ++j) {
    for (let i = 0; i < width; ++i) {
      let e = document.createElement('span');
      e.innerHTML = values[n] || (drawZeroes? '0' : '&nbsp;'); // somehow an empty cell really screws up positioning...
      setBorder(e, width, height, i, j, groups);
      container.appendChild(e);
      ++n;
    }
    container.appendChild(document.createElement('br'));
  }
  container.style.cssFloat = 'left';
  container.style.border = '1px solid lightblue';
  container.style.margin = '5px';
  parent.appendChild(container);
}

function setBorder(e, w, h, x, y, groups) {
  let n = x + y * w;
  // add borders around groups
  e.style.borderLeft = (!x || groups[n] !== groups[n - 1]) ? '1px solid black' : '';
  e.style.borderRight = (x === w - 1) ? '1px solid black' : '';
  e.style.borderTop = (!y || (groups[n] !== groups[n - w])) ? '1px solid black' : '';
  e.style.borderBottom = (y === h - 1) ? '1px solid black' : '';
}

function createInputMatrix(container, title, def, groups) {
  let w = W.value;
  let h = H.value;

  let prev = {};
  let x = 0;
  let y = 0;
  for (let i = 0; i < container.children.length; ++i) {
    let child = container.children[i];
    if (child.nodeName === 'INPUT') {
      prev[x+'x'+y] = child.value;
      ++x;
    } else if (child.nodeName === 'BR') {
      ++y;
      x = 0;
    }
  }

  container.innerHTML = '';
  container.appendChild(document.createElement('div')).innerHTML = title;

  for (let j = 0; j<h; ++j) {
    for (let i = 0; i<w; ++i) {
      let e = document.createElement('input');
      e.value = prev[i+'x'+j]||def;

      if (groups) {
        setBorder(e, w, h, i, j, groups);
      }

      container.appendChild(e);
    }
    container.appendChild(document.createElement('br'));
  }
}
function createInputs() {
  createInputMatrix(IG, 'Grouping:', 0);
  let groups = getPuzzle(true).groups; // get current grouping so we can paint it in IV
  createInputMatrix(IV, 'Required values:', '', groups);
}

function getPuzzle(skipIV) {
  let w = W.value;
  let h = H.value;

  let gnames = [];
  let puzzle = {
    w: w,
    h: h,
    groups: [],
    prefills: [],
  };

  let inputsG = IG.querySelectorAll('input');
  let inputsV = IV.querySelectorAll('input');
  let n = 0;
  for (let j = 0; j < h; ++j) {
    for (let i = 0; i < w; ++i) {
      let gid = +inputsG[n].value;
      let index = gnames.indexOf(gid);
      if (index < 0) {
        index = gnames.length;
        gnames.push(gid);
      }
      puzzle.groups[n] = index;
      if (!skipIV && +inputsV[n].value) puzzle.prefills[n] = +inputsV[n].value;
      n++;
    }
  }

  return puzzle;
}

IG.onclick = function(e) {
  let target = e.target;
  if (target.nodeName !== 'INPUT') return; // because case sensitive bla
  target.select(0, 100); // entire
}

let lastPuzzleCache = '';
let cacheV = '';
IG.onkeyup = function(e) {
  let target = e.target;
  if (target.nodeName !== 'INPUT') return; // because case sensitive bla

  if (e.keyCode === 38) target.value = (target.value | 0) + 1;
  if (e.keyCode === 40) target.value = Math.max(0, (target.value | 0) - 1);

  let puzzle = getPuzzle();
  createInputMatrix(IV, 'Required values:', '', puzzle.groups);

  // prevent solving if the puzzle is identical to before
  let foo = puzzle.w + puzzle.h + puzzle.groups + puzzle.prefills;
  if (foo === lastPuzzleCache) return;
  lastPuzzleCache = foo;

  work(puzzle, true);
};

IV.onkeyup = function(e) {
  let target = e.target;
  if (target.nodeName !== 'INPUT') return; // because case sensitive bla

  if (e.keyCode === 38) target.value = (target.value | 0) + 1;
  if (e.keyCode === 40) target.value = Math.max(0, (target.value | 0) - 1);

  let puzzle = getPuzzle();

  // prevent solving if the puzzle is identical to before
  let foo = puzzle.w + puzzle.h + puzzle.groups + puzzle.prefills;
  if (foo === lastPuzzleCache) return;
  lastPuzzleCache = foo;

  work(puzzle, true);
};

CG.onclick = function(){
  let w = W.value;
  let h = H.value;

  let inputsG = IG.querySelectorAll('input');
  let n = 0;
  for (let j = 0; j < h; ++j) {
    for (let i = 0; i < w; ++i) {
      inputsG[n].value = 0;
      n++;
    }
  }
};
CV.onclick = function(){
  let w = W.value;
  let h = H.value;

  let inputsV = IV.querySelectorAll('input');
  let n = 0;
  for (let j = 0; j < h; ++j) {
    for (let i = 0; i < w; ++i) {
      inputsV[n].value = '';
      n++;
    }
  }
};
SOLVE.onclick = function(){
  work(getPuzzle(), false, true);
};
EXP.onclick = function(){
  console.log(JSON.stringify(getPuzzle()));
};

W.onclick = H.onclick = W.onkeyup = H.onkeyup = createInputs;

function refreshDropdown(index) {
  while (P.children.length) P.removeChild(P.children[0]);
  for (let i = 0; i < PUZZLES.length; ++i) {
    let option = document.createElement('option');
    option.value = i;
    if (i === index) option.selected = true;
    option.innerHTML = PUZZLES[i].name;
    P.appendChild(option);
  }
}

L.onclick = function(){
  let v = P.children[P.selectedIndex].value;
  let puzzle = PUZZLES[v];
  work(puzzle);
};
S.onclick = function(){
  let puzzle = getPuzzle();
  puzzle.name = prompt('Puzzle name?');
  PUZZLES.push(puzzle);
  refreshDropdown(PUZZLES.length - 1);
  localStorage.setItem('puzzles-tectonic', JSON.stringify(PUZZLES));
};
D.onclick = function(){
  if (confirm('Are you sure?')) {
    let option = P.children[P.selectedIndex];
    let index = option.value;
    P.removeChild(option);
    PUZZLES.splice(index, 1);
    localStorage.setItem('puzzles-tectonic', JSON.stringify(PUZZLES));
  }
};
C.onclick = function(){
  localStorage.removeItem('puzzles-tectonic');
  PUZZLES = JSON.parse(JSON.stringify(DEFAULT_PUZZLES)); // lazy clone
  refreshDropdown();
};
DUMP.onclick = function(){
  console.log(JSON.stringify(PUZZLES));
  console.log(PUZZLES);
};

refreshDropdown();
work(PUZZLES[0], false, true);
