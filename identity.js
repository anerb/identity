
function opName(op) {
  var test_value = op(20, 2);
  switch(test_value) {
    case 400:
      return {name: '^', rev: false};
    case Math.pow(2, 20):
      return {name: '^', rev: true};
    case 22:
      return {name: '+', rev: false};
    case -18:
      return {name: '-', rev: true};
    case 18:
      return {name: '-', rev: false};
    case 40:
      return {name: '*', rev: false};
    case 0.1:
      return {name: '/', rev: true};
    case 10:
      return {name: '/', rev: false};
  }
  return {name: '???', rev: false};
}

function removeAt(arr, index) {
  return arr.slice(0, index).concat(arr.slice(index+1, arr.length));
} 

function add(a, b) {
  return a + b;
}
function subB(a, b) {
  return a - b;
}
function subA(a, b) {
  return b - a;
}
function mult(a, b) {
  return a * b;
}
function divA(a, b) {
  return b / a;
}
function divB(a, b) {
  return a / b;
}
function expA(a, b) {
  if (a != 0 && Math.pow(a, b) == 0) {
    return NaN;
  }
  if (Math.pow(a, b) > (2 << 50)) {
    return NaN;
  }
  return Math.pow(a, b);
}
function expB(a, b) {
  if (a != 0 && Math.pow(a, b) < 0.000000001) {
    return NaN;
  }
  if (Math.pow(a, b) > (2 << 50)) {
    return NaN;
  }
  return Math.pow(b, a);
}

function allOps() {
  return [expA, expB, add, subB, subA, mult, divA, divB];
}

function noop(a, b) {
  return undefined;
}

OpTree = function(left, op, right) {
  this.left = left;
  this.op = op;
  this.right = right;
};

OpTree.prototype.fill = function(arr) {
  if (this.right == null) {
    this.right = arr.pop();
  } else {
    this.right.fill(arr);
  }
  if (this.left == null) {
    this.left = arr.pop();
  } else {
    this.left.fill(arr);
  }
};

OpTree.prototype.toString = function(values) {
  var left = "";
  var right = "";
  if (typeof this.left == 'number') {
    left = "" + values[this.left];
  } else {
    left = this.left.toString(values);
  }
  if (typeof this.right == 'number') {
    right = "" + values[this.right];
  } else {
    right = this.right.toString(values);
  }
  var op_name = opName(this.op);
  var str = op_name.rev ? left + op_name.name + right :
              right + op_name.name + left;
  str = "(" + str + ")";
  return str;
};

function createOpTree2() {
  return new OpTree(null, null, null);
}

function createOpForest2() {
  var forest = [];
  var all_ops = allOps();
  for (var a = 0; a < all_ops.length; a++) {
    forest.push(new OpTree(null, all_ops[a], null));
  }
  return forest;
}

function createOpForest3() {
  var forest = [];
  var all_ops = allOps();
  for (var a = 0; a < all_ops.length; a++) {
    var forest2 = createOpForest2();
    for (var f = 0; f < forest2.length; f++) {
      forest.push(new OpTree(forest2[f], all_ops[a], null));
    }
  }
  return forest;
}

function createOpForest4() {
  var forest = [];
  var all_ops = allOps();
  for (var a = 0; a < all_ops.length; a++) {
    var forest3 = createOpForest3();
    for (var f = 0; f < forest3.length; f++) {
      forest.push(new OpTree(forest3[f], all_ops[a], null));
    }
  }
  for (var a = 0; a < all_ops.length; a++) {
    var forest2_left = createOpForest2();
    var forest2_right = createOpForest2();
    for (var fl = 0; fl < forest2_left.length; fl++) {
      for (var fr = 0; fr < forest2_right.length; fr++) {
        forest.push(new OpTree(forest2_left[fl], all_ops[a], forest2_right[fr]));
      }
    }
  }
  return forest;
}

function createOpForest5() {
  var forest = [];
  var all_ops = allOps();
  for (var a = 0; a < all_ops.length; a++) {
    var forest4 = createOpForest4();
    for (var f = 0; f < forest4.length; f++) {
      forest.push(new OpTree(forest4[f], all_ops[a], null));
    }
  }
  for (var a = 0; a < all_ops.length; a++) {
    var forest3 = createOpForest3();
    var forest2 = createOpForest2();
    for (var f3 = 0; f3 < forest3.length; f3++) {
      for (var f2 = 0; f2 < forest2.length; f2++) {
        forest.push(new OpTree(forest3[f3], all_ops[a], forest2[f2]));
      }
    }
  }
  return forest;
}

function swap(i, j, arr) {
  var temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
}

function generate(n, arr) {
  var permutations = [];
  var c = [];
  for (var i = 0; i < n; i++) {
    c.push(0);
  }
  permutations.push(arr.slice());
  var i = 0;
  while (i < n) {
    if (c[i] < i) {
      if (i % 2 == 0) {
        swap(0, i, arr);
      } else {
        swap(c[i], i, arr);
      }
      permutations.push(arr.slice());
      c[i] += 1;
      i = 0;
    } else {
      c[i] = 0;
      i += 1;
    }
  }
  return permutations;
}

function permute(arr) {
  return generate(arr.length, arr);
}

var expression_next = 0;

// values is strings
function expression(tree, values) {
  var left = "";
  var right = "";
  if (tree.left === null) {
    left = values[expression_next];
    expression_next++;
  } else {
    left = expression(tree.left, values);
  }
  if (tree.right === null) {
    right = values[expression_next];
    expression_next++;
  } else {
    right = expression(tree.right, values);
  }
  return express(tree.op, left, right);
}

function createOpsForest(leaves) {
  if (leaves == 2) {
    return createOpForest2();
  }
  if (leaves == 3) {
    return createOpForest3();
  }
  if (leaves == 4) {
    return createOpForest4();
  }
  if (leaves == 5) {
    return createOpForest5();
  }
}

function solutions(size) {
  var range = [];
  for (var r = 0; r < size; r++) {
    range.push[r];
  }
  var prob = ["3", "11", "41", "1361", "1841443"];
  var sols = {};
  var perms = permute(range);
  for (var p = 0 ; p < perms.length; p++) {
    var perm = perms[p];
    var trees = createOpsForest(perm.length);
    for (var t = 0; t < trees.length; t++) {
      var tree = trees[t];
      tree.fill(perm.slice());
      var str = tree.toString(prob);
      var raw = tree.toString(perm);
      sols[eval(str)] = [str, raw];
    }
  }
  return sols;
}

function test_solutions() {
  var sols = solutions(["3", "5", "17"]);
  for (var sol in sols) {
    Logger.log(sol + " = " + sols[sol]);
  }
}

function test_generate() {
  var arr = [0, 1, 2, 3];
  var all = generate(4, arr);
  var ii = 42;
}

// Create an empty OpTree with the proper number of leaves
function createOpTrees(leaves) {
  var forest = [];
  if (leaves == 2) {
    forest.push(createOpTree2());
    return forest;
  }
  if (leaves == 3) {
    forest.push(createOpTree3());
    return forest;
  }
  if (leaves == 4) {
    forest.push(new OpTree(createOpTree3(), null, null));
    forest.push(new OpTree(createOpTree2(), null, createOpTree2()));
    return forest;
  }
  if (leaves == 5) {
    var forest4 = createOpTrees(4);
    for (var t = 0; t < forest4.length; t++) {
      forest.push(new OpTree(forest4[t], null, null));
    }
    forest.push(new OpTree(createOpTree3(), null, createOpTree2()));
    return forest;
  }
  if (leaves == 6) {
    var forest5 = createOpTrees(5);
    for (var t = 0; t < forest5.length; t++) {
      forest.push(new OpTree(forest5[t], null, null));
    }
    var forest4 = createOpTrees(4);
    for (var t = 0; t < forest4.length; t++) {
      forest.push(new OpTree(forest4[t], null, createOpTree2()));
    }
    forest.push(new OpTree(createOpTree3(), null, createOpTree3()));
    return forest;
  }  
}
function buildTree(vals) {
  if (vals.length == 2) {
    return new OpTree(vals[0], noop, vals[1]);
  }
  var left = vals.pop();
  for (var skip = 0; skip < vals.length; skip++) {
    if (skip == 0) {
      return new OpTree(vals[0], noop, buildTree(removeAt(vals, 0), skip2));
    }
  } 
}

var forest = [];

var messages = [];

function onLoad() {
  console.log("loaded");
};

// ((20+37+58)/23)-4
function myFunction() {
 /* (_+_)
  (_-_)
  (_x_)
  (_)
  ----
  (_)
     
  2 3 7 8
  ((8-7)*(3-2))

  7 6 2 3 
  
  25 6 54 12 76
  
  (25 - ((76-54) + (12/6)))
  
  48 57 20 38 6 73
  
  (20 / (((73-(57+6))+(48-38)))
  
  20 37 4 58 23
  */
}

function testaccum() {
  var ii = compute([3, 4, add, 5, mult]);
  var jj = 42;
}






function testfindone() {
  //"(24^(33^(3-(15+(2^14)))))"
  find_one([14, 2, 15, 3, 33, 24]);
  //  find_one([20, 37, 4, 58, 23]);
  find_one([2, 3]);
  var ms = messages;
  var ii = 42;
}

function parseValues() {
  var values_str = $('#id_values').val();
  var delimiter = $('#id_delimiter').val();
  var values = values_str.split(delimiter);
  return values;
}

function isPrime(candidate) {
  let primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541];
  return primes.includes(candidate);
}

function isEasy(candidate) {
  let easy = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    2, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24,
    3, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36,
    4, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48,
    5, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60,
    6, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72,
    7, 7, 14, 21, 28, 35, 42, 49, 56, 63, 70, 77, 84,
    8, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96,
    9, 9, 18, 27, 36, 45, 54, 63, 72, 81, 90, 99, 108,
    10, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120,
    11, 11, 22, 33, 44, 55, 66, 77, 88, 99, 110, 121, 132,
    12, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 132, 144];
    return easy.includes(candidate);
}

function validCandidate(candidate) {
  let banned = [0, 1];
  if (banned.includes(candidate)) {
    return false;
  }

  var primes = $('#primes').val();
  if (isPrime(candidate) && !primes) {
    return false;
  }

  var easy = $('#easy').val();
  if (!isEasy(candidate) && easy) {
    return false;
  }


  return true;
}

function randomize() {
  for (let i = 0; i < 100; i++) {
    randomizeOnce();
    let solvable = check();
    if (solvable) {
      break;
    }
  }
}

function randomizeOnce() {
  var values_str = $('#id_values').val();
  var delimiter = $('#id_delimiter').val();
  var values = values_str.split(delimiter);

  var nums = [Math.floor(Math.random()*90) + 9,
          Math.floor(Math.random()*90) + 9,
          Math.floor(Math.random()*9) + 2,
          Math.floor(Math.random()*90) + 9,
          Math.floor(Math.random()*9) + 2];

  var numValues = parseValues().length;
  var keep = [];
  for (var i = 0; i < numValues; i++) {
    let candidate = 0;
    while (keep.includes(candidate) || !validCandidate(candidate)) {
      candidate =  Math.floor(Math.random()*98) + 2;
    }
    keep.push(candidate);
  }
  $('#id_values').val(keep.join(' '));
}

function check() {
  var checkEl = $('#check').get(0);
  solve();
  if (messages.length > 0) {
    checkEl.innerHTML = "Solution Exists";
    return true;
  } else {
    checkEl.innerHTML = "No Solution";
    return false;
  }
}

function solve_more() {
  var goal = $('#goal').val();
  goal = parseInt(goal);
  var values = parseValues();
  for (var v = 0; v < values.length; v++) {
    var value = values[v];
    value = parseInt(value);
    if (isNaN(value)) {
      console.log("Could not parse int: ", values[v]);
    }
    values[v] = value;
  }
  messages = [];
  var funcs = [];
  if ($('#exponent').is(':checked')) {
    funcs.push(expA);
    funcs.push(expB);
  }
  if ($('#add').is(':checked')) {
    funcs.push(add);
  }
  if ($('#subtract').is(':checked')) {
    funcs.push(subA);
    funcs.push(subB);
  }
  if ($('#multiply').is(':checked')) {
    funcs.push(mult);
  }
  if ($('#divide').is(':checked')) {
    funcs.push(divA);
    funcs.push(divB);
  }
  find_more(values, funcs, goal);
}


function solve() {
  var goal = $('#goal').val();
  goal = parseInt(goal);
  var values = parseValues();
  for (var v = 0; v < values.length; v++) {
    var value = values[v];
    value = parseInt(value);
    if (isNaN(value)) {
      console.log("Could not parse int: ", values[v]);
    }
    values[v] = value;
  }
  messages = [];
  var funcs = [];
  if ($('#exponent').is(':checked')) {
    funcs.push(expA);
    funcs.push(expB);
  }
  if ($('#add').is(':checked')) {
    funcs.push(add);
  }
  if ($('#subtract').is(':checked')) {
    funcs.push(subA);
    funcs.push(subB);
  }
  if ($('#multiply').is(':checked')) {
    funcs.push(mult);
  }
  if ($('#divide').is(':checked')) {
    funcs.push(divA);
    funcs.push(divB);
  }
  find_one(values, funcs, goal);
}

function showResults() {  
  $('#id-board').empty();
  $('#id-board').append("Done<br>");
  for (var m = 0; m < messages.length; m++) {
   var el = $('<div>' + JSON.stringify(messages[m]) + '</div>');
   $('#id-board').append(el); 
  }
}

function find_one(n, funcs, goal) {
  var steps = [];
  for (var i = 0; i < n.length; i++) {
    steps.push(n[i]);
    var others = n.slice(0, i).concat(n.slice(i+1, n.length));
    let one_max_solution = 1;
    identity(others, steps, funcs, goal, one_max_solution);
    steps.pop();
  } 
}

function find_more(n, funcs, goal) {
  var steps = [];
  for (var i = 0; i < n.length; i++) {
    steps.push(n[i]);
    var others = n.slice(0, i).concat(n.slice(i+1, n.length));
    let max_solutions = 4;
    identity(others, steps, funcs, goal, 12);
    steps.pop();
  } 
}


function computeVerbose(steps) {
  var op = steps[2];
  var op_name = opName(op);
  var str = op_name.rev ? steps[0] + op_name.name + steps[1] :
              steps[1] + op_name.name + steps[0];
  str = "(" + str + ")";
  var accum = op(steps[1],steps[0]);
  for (var s = 3; s < steps.length-1; s+=2) {
    op = steps[s+1];
    op_name = opName(op);
    str = op_name.rev ? str + op_name.name + steps[s] :
              steps[s] + op_name.name + str;
    str = "(" + str + ")";
    accum = op(steps[s], accum);
  }
  return {val: accum, str: str};
}


function compute(steps) {
  var op = steps[2];
  var accum = op(steps[1],steps[0]);
  for (var s = 3; s < steps.length-1; s+=2) {
    op = steps[s+1];
    accum = op(steps[s], accum);
  }
  return accum;
}

function testFindOne() {
 for (var r = 0; r < 1; r++) {      
  for (var n = 3; n < 5; n++) {
    var inputs = [];
    for (var i = 0; i < n; i++) {
      inputs.push(Math.ceil((Math.random()*100)));
    }
    find_one(inputs);
  }
 }
}

function identity(n, steps, funcs, goal, max_solutions) {
  if (n.length == 0) {
    var val = compute(steps);
    if (val == goal) {
      var verbose = computeVerbose(steps);
      messages.push(verbose.str);
    }
  }
  for (var i = 0; i < n.length && messages.length < max_solutions; i++) {
    steps.push(n[i]);
    for (var f = 0; f < funcs.length && messages.length < max_solutions; f++) {
      steps.push(funcs[f]);
      var intermediate_val = compute(steps);
      // eliminate NaN intermediate values
      if (isNaN(intermediate_val)) {
        steps.pop();
        continue;
      }
      // eliminate non-integer intermediate values
      if (Math.floor(intermediate_val) != intermediate_val) {
        steps.pop();
        continue;
      }
      var others = n.slice(0, i).concat(n.slice(i+1, n.length));
      identity(others, steps, funcs, goal, max_solutions);
      steps.pop();
    }
    steps.pop();
  }
}

