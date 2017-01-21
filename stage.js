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

	distance(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
	}

	addEdge(pt1, pt2, oneWay) {
		var path1 = new PathNode(pt1[0], pt1[1]);
		var path2 = new PathNode(pt2[0], pt2[1]);

		var dist = this.distance(path1.getX(), path1.getY(), path2.getX(), path2.getY());

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

	getAdjacentEdges(node) {
		if (this.nodes.hasOwnProperty(node)) {
			return this.nodes[node];
		}

		return null;
	}

	shortestPath(start, end) {
		var path1 = new PathNode(start[0], start[1]);
		var path2 = new PathNode(end[0], end[1]);

		var root = this.findClosestNode(start[0], start[1]);
		var dest = this.findClosestNode(end[0], end[1]);

		var queue = [];

		// breadFirstSearch

		return [];
	}

	breadthFirstSearch(start, end) {
		// var queue = [start];
		//
		// while (queue.length > 0) {
		// 	var node = queue.pop();
		// 	var adj = this.getAdjacentEdges(node);
		//
		// 	for (var n in adj) {
		// 		queue.push(n);
		// 	}
		// }

		var distances = {};
		var unvisited = [start];
		var visited = [];

		distances[start] = 0;
		for (var node in Object.keys(this.node)) {
			distances[node] = 1 / 0;
		}

		var current = start;

		while (!visited.includes(end) && unvisited.length > 0) {
			var currentIndex = -1;

			// Find next traversable node
			for (var i = 0; i < unvisited.length; i++) {
				var node = unvisited[i];

				if (distance[node] < distances[current]) {
					current = node;
					currentIndex = i;
				}
			}

			// Remove from unvisited list
			if (currentIndex >= 0 && currentIndex < unvisited.length) {
				unvisited.splice(currentIndex, 1);
			}

			// Calculate incremental distances for adjacent nodes
			var adj = this.getAdjacentEdges(current);
			for (var node in adj) {
				if (!visited.includes(node)) {
					unvisited.push(node);
					distances[node] = Math.min(distances[node], distance[current] + this.distance(current.getX(), current.getY(), node.getX(), node.getY()));
				}
			}

			// Add node to visited list
			visited.push(current);
		}

		return visited;
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

function PriorityQueue () {
  this._nodes = [];

  this.enqueue = function (priority, key) {
    this._nodes.push({key: key, priority: priority });
    this.sort();
  };

  this.dequeue = function () {
    return this._nodes.shift().key;
  };

  this.sort = function () {
    this._nodes.sort(function (a, b) {
      return a.priority - b.priority;
    });
  };

  this.isEmpty = function () {
    return !this._nodes.length;
  };
}
