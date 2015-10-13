function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

var Point = function(x, y) {
	return {
		x: x, y: y,
		equals: function(p) {
			return this.x == p.x && this.y == p.y;
		}
	}
};

var Maze = function(canvas, left, top, sizeX, sizeY, cellSize)
{
	var self = this;
	this.canvas = canvas;
	this.ctx = canvas.getContext("2d");
	this.theMaze = [];

	this.left = left;
	this.top = top;
	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.cellSize = cellSize;

	var dx = [1, 0, -1, 0], dy = [0, 1, 0, -1];

	for (var x = 0; x < sizeX; x++) {
		this.theMaze[x] = [];
	}

	this.ctx.translate(left+.5, top+.5);

	function forEachNeighbor(cell, callback) {
		for (var i = 0; i < 4; i++) {
			var xn = cell.x + dx[i], yn = cell.y + dy[i];
			if (xn >= 0 && xn < sizeX && yn >= 0 && yn < sizeY) {
				if (callback(Point(xn, yn)) === false) break;
			}
		}
	}

	function findRandomCell(predicate) {
		var cells = [];
		for (var x = 0; x < sizeX; x++) {
			for (var y = 0; y < sizeY; y++) {
				if (predicate(x, y)) cells.push(Point(x, y));
			}
		}
		if (cells.length == 0) return null;
		return cells[random(0, cells.length-1)];
	}

	function canGo(c1, c2) {
		var c = null;
		if (c1.x == c2.x) {
			c = c1.y < c2.y ? c2 : c1;
			return !self.theMaze[c.x][c.y].up;
		}
		c = c1.x < c2.x ? c2 : c1;
		return !self.theMaze[c.x][c.y].left;
	}

	function destroyWall(c1, c2) {
		var c = null;
		if (c1.x == c2.x) {
			c = c1.y < c2.y ? c2 : c1;
			self.theMaze[c.x][c.y].up = false;
		}
		else {
			c = c1.x < c2.x ? c2 : c1;
			self.theMaze[c.x][c.y].left = false;
		}
	}

	this.dfs = (function() {
		var stack = [];
		var visited = [];
		var cur;

		function start() {
			stack = [];
			visited = [];
			for (var x = 0; x < sizeX; x++) {
				visited[x] = [];
				self.theMaze[x] = [];
				for (var y = 0; y < sizeY; y++) {
					var cell = { left: true, up: true };
					self.theMaze[x][y] = cell;
				}
			}

			cur = Point(random(0, self.sizeX - 1), random(0, self.sizeX - 1));
			stack.push(cur);
		}

		function step() {
			if (stack.length == 0) return false;
			visited[cur.x][cur.y] = true;

			var ns = [];
			forEachNeighbor(cur, function(cn) {
				if (!visited[cn.x][cn.y]) ns.push(cn);
			});
			if (ns.length == 0) {
				stack.pop();
				cur = stack[stack.length - 1];
				step();
			} else {
				var neighbor = ns[random(0, ns.length - 1)];
				stack.push(neighbor);
				destroyWall(cur, neighbor);
				cur = neighbor;
			}
			return true;
		}

		return {
			start: start,
			step: step,
			generate: function() {
				start();
				while (step());
			}
		}
	})();

	this.prim = (function() {
		var outside = 0;
		var inside = 1;
		var border = 2;

		var attrs = [];

		function findRandomNeighbor(cell, attr) {
			var cells = [];
			forEachNeighbor(cell, function(cn) {
				if (attrs[cn.x][cn.y] == attr) cells.push(cn);
			});
			if (cells.length == 0) return null;
			return cells[random(0, cells.length-1)];
		}

		function start() {
			for (var x = 0; x < sizeX; x++) {
				attrs[x] = [];
				self.theMaze[x] = [];
				for (var y = 0; y < sizeY; y++) {
					var cell = { left: true, up: true };
					attrs[x][y] = outside;
					self.theMaze[x][y] = cell;
				}
			}
				
			var c0 = Point(random(0, sizeX - 1), random(0, sizeY - 1));
			attrs[c0.x][c0.y] = inside;
			forEachNeighbor(c0, function(cn) {
				attrs[cn.x][cn.y] = border;
			});
		}

		function step() {
			var cell = findRandomCell(function(x, y) {
				return attrs[x][y] == border;
			});
			if (!cell) return false;

			attrs[cell.x][cell.y] = inside;
			forEachNeighbor(cell, function(cn) {
				if (attrs[cn.x][cn.y] == outside) attrs[cn.x][cn.y] = border;
			});

			var neighbor = findRandomNeighbor(cell, inside);
			if (neighbor) destroyWall(cell, neighbor);
			return true;
		}

		return {
			start: start,
			step: step,
			generate: function() {
				start();
				while (step());
			}
		};
	})();

	this.kruskal = (function() {
		var locations;
		var walls;

		function shuffle(arr, fCopy) {
			var a = [];
			for (var i = 0; i < arr.length; i++)
				a[i] = random(0, arr.length);

		    var qs = function(l, r) {
		        var i = l, j = r, x = a[random(l, r)];
		        while(i <= j) {
		            while(a[i] < x) i++;
		            while(a[j] > x) j--;
		            if(i <= j) {
		            	var t = a[i]; a[i] = a[j]; a[j] = t;
		            	var c = { };
		            	fCopy(c, arr[i]);
		            	fCopy(arr[i], arr[j]);
		            	fCopy(arr[j], c);
		            	i++; j--;
		            }
		        };
		        if(l < j) qs(l, j);
		        if(i < r) qs(i, r);
		    };
		    qs(0, a.length-1);
		}

		function init() {
			locations = sizeX*sizeY;
			walls = [];
			var numWalls = locations*2 - (sizeX + sizeY)
			for (var x = 0; x < sizeX; x++) {
				self.theMaze[x] = [];
				for (var y = 0; y < sizeY; y++) {
					var cell = { left: true, up: true };
					self.theMaze[x][y] = cell;
				}
			}
			for (var x = 1; x < sizeX; x++) {
				for (var y = 1; y < sizeY; y++) {
					walls.push({ c1: Point(x, y), c2: Point(x - 1, y) });
					walls.push({ c1: Point(x, y), c2: Point(x, y - 1) });
				}
			}
			for (var x = 0; x < sizeX - 1; x++) {
				walls.push({ c1: Point(x, 0), c2: Point(x + 1, 0) });
			}
			for (var y = 0; y < sizeY - 1; y++) {
				walls.push({ c1: Point(0, y), c2: Point(0, y + 1) });
			}
		}

		return {
			generate: function() {
				init();
				shuffle(walls, function(a, b) {
					a.c1 = Point(b.c1.x, b.c1.y);
					a.c2 = Point(b.c2.x, b.c2.y);
				});

				var i = 0;
				while (locations > 1) {
					var w = walls[i];
					self.recursive.solve(w.c1, w.c2);
					if (!self.recursive.isSolved()) {
						destroyWall(w.c1, w.c2);
						locations--;
					}
					i++;
				}
			}
		};
	})();

	this.recursive = (function() {
		var path = [];
		var visited = [];
		var finish;

		function init() {
			visited = [];
			for (var x = 0; x < sizeX; x++)
				visited[x] = [];
		}

		function start(a, b, c, d) {
			var start;
			if (arguments.length == 2) {
				start = a;
				finish = b;
			} else {
				start = Point(a, b);
				finish = Point(c, d);
			}

			path = [start];
			visited = [];
			for (var x = 0; x < sizeX; x++)
				visited[x] = [];
			visited[start.x][start.y] = true;
		}

		function step() {
			if (path.length == 0) return false;
			var last = path[path.length - 1];
			if (last.equals(finish)) return false;

			var cell = null;
			forEachNeighbor(last, function(cn) {
				if (!visited[cn.x][cn.y] && canGo(last, cn)) {
					cell = cn;
					return false;	
				}
			});

			if (cell) {
				visited[cell.x][cell.y] = true;
				path.push(cell);
			} else path.pop();
			return true;
		}

		function solve(c1, c2) {
			if (path.length == 0) return false;
			if (c1.equals(c2)) return true;

			var isSolved = false;
			forEachNeighbor(c1, function(cn) {
				if (!visited[cn.x][cn.y] && canGo(c1, cn)) {
					visited[cn.x][cn.y] = true;
					path.push(cn);
					isSolved = solve(cn, c2);
					if (isSolved) return false;
				}
			});
			if (!isSolved) path.pop();
			return isSolved;
		}

		return {
			start: start,
			step: step,
			getPath: function() {
				return path;
			},
			isSolved: function() {
				if (path.length == 0) return false;
				var last = path[path.length - 1];
				return last.equals(finish);
			},
			solve: function(a, b, c, d) {
				if (arguments.length == 2) {
					start(a, b);
					solve(a, b);
				} else {
					var c1 = Point(a, b);
					var c2 = Point(c, d);
					start(c1, c2);
					solve(c1, c2);
				}
				return path;
			}
		};
	})();

	this.lee = (function() {
		var attrs = [];
		var path = [];
		var start, finish;

		function init() {
			attrs = [];
			path = [];
			for (var x = 0; x < sizeX; x++) {
				attrs[x] = [];
				for (var y = 0; y < sizeY; y++)
					attrs[x][y] = 0;
			}
		}

		return {
			getPath: function() {
				return path;
			},
			isSolved: function() {
				if (path.length == 0) return false;
				var last = path[path.length - 1];
				return last.equals(finish);
			},
			solve: function(a, b, c, d) {
				if (arguments.length == 2) {
					start = a;
					finish = b;
				} else {
					start = Point(a, b);
					finish = Point(c, d);
				}

				init();
				attrs[start.x][start.y] = 1;

				var d = 1;
				var fContinue, fSolved;
				var numMarked = 1, numCells = sizeX*sizeY;
				do {
					fContinue = fSolved = false;
					loop:
					for (var x = 0; x < sizeX; x++) {
						for (var y = 0; y < sizeY; y++) {
							if (attrs[x][y] != d) continue;
							var c = Point(x, y);
							forEachNeighbor(c, function(cn) {
								if (attrs[cn.x][cn.y] == 0 && canGo(c, cn)) {
									attrs[cn.x][cn.y] = d + 1;
									fContinue = true;
									if (cn.equals(finish)) {
										fSolved = true;
										return false;
									}
								}
							});
							if (fSolved) break loop;
						}
					}
					d++;
				} while (fContinue && !fSolved);

				if (!fSolved) return [];

				var c = finish;
				path.push(Point(c.x, c.y));
				while (d > 1) {
					forEachNeighbor(c, function(cn) {
						if (attrs[cn.x][cn.y] == d - 1 && canGo(c, cn)) {
							c = cn;
							path.push(cn);
							return false;
						}
					});
					d--;
				}
				return path.reverse();
			}
		};
	})();

	this.draw = function() {
		this.ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.ctx.strokeRect(0, 0, sizeX*cellSize, sizeY*cellSize);
		this.ctx.beginPath();
		
		for (var x = 0; x < sizeX; x++) {
			for (var y = 0; y < sizeY; y++) {
				var cell = this.theMaze[x][y];
				var xc = x*cellSize, yc = y*cellSize;
				if (cell.left) {
					this.ctx.moveTo(xc, yc);
					this.ctx.lineTo(xc, yc+cellSize);
				}
				if (cell.up) {
					this.ctx.moveTo(xc, yc);
					this.ctx.lineTo(xc+cellSize, yc);
				}
			}
		}
		this.ctx.stroke();
	}
};