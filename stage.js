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

	addPathNode(pt1, pt2) {
		this.graph.addEdge(pt1, pt2, true);
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
		this.nodes = [];
	}

	distance(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
	}

	addEdge(pt1, pt2, oneWay) {
		var path1 = new PathNode(pt1[0], pt1[1]);
		var path2 = new PathNode(pt2[0], pt2[1]);

		var src = this.findEdge(pt1);

		if (src == -1) {
			var relation = {};

			relation.source = path1;
			relation.adjacent = [path2];

			this.nodes.push(relation);
		} else {
			this.nodes[src].adjacent.push(path2);
		}

		if (!oneWay) {
			src = this.findEdge(pt2);

			if (src == -1) {
				var relation = {};

				relation.source = path2;
				relation.adjacent = [path1];

				this.nodes.push(relation);
			} else {
				this.nodes[src].adjacent.push(path1);
			}
		}
	}

	findEdge(pt1) {
		for (var i = 0; i < this.nodes.length; i++) {
			var node = this.nodes[i];

			if (node.source.getX() == pt[0] && node.source.getY() == pt[1]) {
				return i;
			}
		}

		return -1;
	}

	edgeExists(pt1) {
		return this.findEdge(pt1)  == -1 ? false : true;
	}

	removeEdge(pt1, pt2) {
		var src = this.findEdge(pt1);

		if (src > -1) {
			var adj = this.nodes[src].adjacent;

			for (var i = 0; i < adj.length; i++) {
				if (adj[i].getX() == pt2[0] && adj[i].getY() == pt2[1]) {
					adj.splice(i, 1);
				}
			}
		}

		src = this.findEdge(pt2);

		if (src > -1) {
			var adj = this.nodes[src].adjacent;

			for (var i = 0; i < adj.length; i++) {
				if (adj[i].getX() == pt1[0] && adj[i].getY() == pt1[1]) {
					adj.splice(i, 1);
				}
			}
		}
	}

	getAdjacentEdges(node) {
		var src = this.findEdge([node.getX(), node.getY()]);

		if (src == -1) {
			return null;
		} else {
			return this.nodes[src].adjacent;
		}
	}

	shortestPath(start, end) {
		var path1 = new PathNode(start[0], start[1]);
		var path2 = new PathNode(end[0], end[1]);

		var root = this.findClosestNode(start[0], start[1]);
		var dest = this.findClosestNode(end[0], end[1]);

		return this.breadthFirstSearch(root, dest);
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
		var keys = Object.keys(this.nodes);
		for (var i = 0; i < keys.length; i++) {
			distances[node] = 1 / 0;
		}

		var current = start;

		while (!visited.includes(end) && unvisited.length > 0) {
			var currentIndex = -1;

			// Find next traversable node
			for (var i = 0; i < unvisited.length; i++) {
				var node = unvisited[i];

				if (distances[node] < distances[current]) {
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
			for (var i = 0; i < adj.length; i++) {
				var node = adj[i];

				if (!visited.includes(node)) {
					unvisited.push(node);
					distances[node] = Math.min(distances[node], distances[current] + this.distance(current.getX(), current.getY(), node.getX(), node.getY()));
				}
			}

			// Add node to visited list
			visited.push(current);
		}

		return visited;
	}

	findClosestNode(pt) {
		var min = this.nodes[0].source;
		var minDist = this.distance(min.getX(), min.getY(), pt[0], pt[1]);

		for (var i = 1; i < this.nodes.length; i++) {
			var node = this.nodes[i].source;
			var dist = this.distance(node.getX(), node.getY(), pt[0], pt[1]);

			if (dist < minDist) {
				minDist = dist;
				min = node;
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
