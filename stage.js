var stages = [];

class Stage {
	constructor() {
		this.boundaries = [];
		this.particles = [];
		this.graph = new PathGraph();
	}

	addLine(x1, y1, x2, y2) {
		var line = [x1, y1, x2, y2];
		this.boundaries.push(line);
	}

	getLines() {
		return this.boundaries;
	}

	addPathNode(x1, y1, x2, y2) {
		this.graph.addEdge([x1, y1], [x2, y2], true);
	}

	getGraph() {
		return this.graph;
	}

	addParticle(startX, startY, endX, endY) {
		var particle = {
			spawn: {
				x: startX,
				y: startY
			},
			destination: {
				x: endX,
				y: endY
			}
		};

		this.particles.push(particle);
	}

	getParticles() {
		return this.particles;
	}
}

class PathGraph {
	constructor() {
		this.nodes = {}
	}

	addEdge(pt1, pt2, oneWay) {
		var path1 = new PathNode(pt1[0], pt1[1]);
		var path2 = new PathNode(pt2[0], pt2[1]);

		if (!this.nodes.hasOwnProperty(path1)) {
			this.nodes[path1] = [];
			this.nodes[path1].push(path2);
		} else {
			this.nodes[path1].push(path2);
		}

		if (!oneWay) {
			if (!this.nodes.hasOwnProperty(path1)) {
				this.nodes[path2] = [];
				this.nodes[path2].push(path1);
			} else {
				this.nodes[path2].push(path1);
			}
		}
	}

	removeEdge(pt1, pt2) {
		var path1 = new PathNode(pt1[0], pt1[1]);
		var path2 = new PathNode(pt2[0], pt2[1]);

		if (this.nodes.hasOwnProperty(path1)) {
			var index = this.nodes[path1].indexOf(path2);

			if (index > -1) {
				this.nodes[path1].splice(index, 1);
			}
		}

		if (this.nodes.hasOwnProperty(path2)) {
			var index = this.nodes[path2].indexOf(path1);

			if (index > -1) {
				this.nodes[path2].splice(index, 1);
			}
		}
	}

	shortestPath(start, end) {
		var path1 = new PathNode(start[0], start[1]);
		var path2 = new PathNode(end[0], end[1]);

		return [];
	}

	findClosestNode(pt) {
		var min = new PathNode(0, 0);
		var minDist = Math.sqrt(Math.pow(pt[0], 2) + Math.pow(pt[1], 2));

		for (var key in Object.keys(this.nodes)) {
			var x1 = key.getX();
			var y1 = key.getY();

			var x2 = pt[0];
			var y2 = pt[1];

			var dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));

			if (dist < minDist) {
				minDist = dist;
				min = key;
			}
		}

		return min;
	}
}

class PathNode {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	getX() {
		return this.x;
	}

	getY() {
		return this.y;
	}
}
