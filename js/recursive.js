var maze = new Maze(document.getElementById("canva"), 20, 20, 20, 20, 20);
var start = Point(0, 0);
var finish = Point(0, maze.sizeY - 1);

function draw(curX, curY) {
	maze.ctx.clearRect(0, 0, maze.canvas.width, maze.canvas.height);
	maze.draw();

	maze.ctx.fillStyle = "red";
	maze.ctx.fillRect(finish.x*maze.cellSize, finish.y*maze.cellSize, maze.cellSize, maze.cellSize);
	maze.ctx.fillStyle = "#000";

	maze.ctx.beginPath();
	maze.ctx.arc(curX, curY, maze.cellSize*0.3, 0, Math.PI*2);
	maze.ctx.fill();
}

var walk = (function() {
	var f = false;
	var prev = start;
	return function() {
		var path = maze.recursive.getPath();
		if (maze.recursive.isSolved()) {
			if (f) return;
			f = true;
		}

		var pos = path[path.length - 1];
		var prop = pos.x == prev.x ? "y" : "x";
		var from = Point((prev.x+0.5)*maze.cellSize, (prev.y+0.5)*maze.cellSize);
		var to = Point((pos.x+0.5)*maze.cellSize, (pos.y+0.5)*maze.cellSize);
		var t = setInterval(function() {
			var d = to[prop] - from[prop] > 0 ? 1 : -1;
			from[prop] += d * maze.cellSize * 0.45;
			if (d * (from[prop] - to[prop]) >= 0) {
				from[prop] = to[prop];
				prev = Point(pos.x, pos.y);
				clearInterval(t);
				setTimeout(walk, 0);

			}
			draw(from.x, from.y);
		}, 30);
		
		maze.recursive.step();
	}
})(start);

maze.kruskal.generate();
maze.recursive.start(start, finish);
walk();	