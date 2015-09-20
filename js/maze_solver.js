var maze = new Maze(document.getElementById("canva"), 20, 20, 20, 20, 20);
var start = Point(0, 0), finish = Point(0, maze.sizeY - 1);
var selected = null;
var fStart = false, fFinish = false;

document.getElementById("generate").onclick = function(e) {
	var id = ["dfs", "prim", "kruskal"];
	for (var i = 0; i < 3; i++) {
		if (document.getElementById(id[i]).checked) {
			maze[id[i]].generate();
			path = maze.lee.solve(start, finish);
			draw(maze, path);
			break;
		}
	}
}

maze.canvas.onmousedown = function(e) {
	if (e.which != 1) return;
	var x = e.offsetX - maze.left;
	var y = e.offsetY - maze.top;
	var cell = Point(Math.floor(x / maze.cellSize), Math.floor(y / maze.cellSize));
	if (cell.x < 0 || cell.x >= maze.sizeX ||
		cell.y < 0 || cell.y >= maze.sizeY) return;
	
	if (start.x == cell.x && start.y == cell.y) return;

	if (!fStart) {
		start = cell;
		fStart = true;
	} else {
		finish = cell;
		fFinish = true;
	}

	if (fStart && fFinish) {
		path = maze.lee.solve(start, finish);
		fStart = fFinish = false;
	}
	draw(maze, path);
}

maze.canvas.onmousemove = function(e) {
	var x = e.offsetX - maze.left;
	var y = e.offsetY - maze.top;
	var cell = Point(Math.floor(x / maze.cellSize), Math.floor(y / maze.cellSize));
	if (cell.x < 0 || cell.x >= maze.sizeX ||
		cell.y < 0 || cell.y >= maze.sizeY)
	{
		selected = null
		draw(maze, path);
		return;
	}

	if (!selected || cell.x != selected.x || cell.y != selected.y) {
		selected = cell;
		draw(maze, path);
	}
}

var drawCorner = (function(ctx) {
	return ctx.arcTo ?
	function(x1, y1, x2, y2, xc, yc, r) {
		ctx.moveTo(x1, y1);
		ctx.arcTo(xc, yc, x2, y2, r);
	} :
	function(x1, y1, x2, y2, xc, yc) {
		ctx.moveTo(x1, y1);
		ctx.lineTo(xc, yc);
		ctx.lineTo(x2, y2);
	}
})(maze.ctx);

function draw(maze, path) {
	maze.ctx.clearRect(0, 0, maze.canvas.width, maze.canvas.height);
	maze.draw();

	function fillCell(cell, color) {
		maze.ctx.fillStyle = color;
		maze.ctx.fillRect(cell.x*maze.cellSize, cell.y*maze.cellSize,
			maze.cellSize, maze.cellSize);
		maze.ctx.fillStyle = "#000";
	}

	if (selected) fillCell(selected, fStart ? "rgba(0, 0, 255, 0.3)" : "rgba(255, 0, 0, 0.3)");
	if (start) fillCell(start, "red");
	if (fStart) return;
	if (finish) fillCell(finish, "blue");

	maze.ctx.beginPath();
	maze.ctx.lineWidth = 3;

	var cs = maze.cellSize;
	var r = cs*0.5;
	for (var i = 0; i < path.length; i++) {
		var prev = path[i - 1], c = path[i], succ = path[i + 1];
		if (!prev) prev = path[0];
		if (!succ) succ = path[i];

		var x = c.x*cs, y = c.y*cs;
		var xc = (c.x+0.5)*cs;
		var yc = (c.y+0.5)*cs;

		if (prev.x == succ.x) {
			maze.ctx.moveTo(xc, y);
			maze.ctx.lineTo(xc, y + cs);
		}
		else if (prev.y == succ.y) {
			maze.ctx.moveTo(x, yc);
			maze.ctx.lineTo(x + cs, yc);
		}
		else {
			var dx = prev.x - succ.x;
			var dy = prev.y - succ.y;
			var d = [c.x - prev.x, c.y - prev.y].join("");
			if (dx*dy > 0) {
				if (d == "10" || d == "0-1")
					drawCorner(x, yc, xc, y + cs, xc, yc, r);
				else drawCorner(xc, y, x + cs, yc, xc, yc, r);
			}
			else {
				if (d == "01" || d == "10")
					drawCorner(xc, y, x, yc, xc, yc, r);
				else drawCorner(xc, y + cs, x + cs, yc, xc, yc, r);
			}
		}
	}
	maze.ctx.stroke();
	maze.ctx.lineWidth = 1;
}

maze.kruskal.generate();
var path = maze.lee.solve(start, finish);
draw(maze, path);