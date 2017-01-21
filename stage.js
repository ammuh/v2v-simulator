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

	addPathNode(pt1, pt2, oneWay) {
		this.graph.addEdge(pt1, pt2, oneWay);
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

		var src = this.findEdge(this.nodes, pt1);

		if (src == -1) {
			var relation = {};

			relation.source = path1;
			relation.adjacent = [path2];

			this.nodes.push(relation);
		} else {
			this.nodes[src].adjacent.push(path2);
		}

		if (!oneWay) {
			src = this.findEdge(this.nodes, pt2);

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

	findEdge(list, pt1) {
		for (var i = 0; i < list.length; i++) {
			var node = list[i];

			if (node.source.getX() == pt1[0] && node.source.getY() == pt1[1]) {
				return i;
			}
		}

		return -1;
	}

	edgeExists(list, pt1) {
		return this.findEdge(list, pt1)  == -1 ? false : true;
	}

	removeEdge(pt1, pt2) {
		var src = this.findEdge(this.nodes, pt1);

		if (src > -1) {
			var adj = this.nodes[src].adjacent;

			for (var i = 0; i < adj.length; i++) {
				if (adj[i].getX() == pt2[0] && adj[i].getY() == pt2[1]) {
					adj.splice(i, 1);
				}
			}
		}

		src = this.findEdge(this.nodes, pt2);

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
		var src = this.findEdge(this.nodes, node.getLocation());

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

		var res = this.breadthFirstSearch(root, dest);
		var prev1
	}

	breadthFirstSearch(start, end) {
		var unvisited = [];
		var distances = [];
		var previous = [];

		for (var i = 0; i < this.nodes.length; i++) {
			unvisited.push(this.nodes[i]);
			distances.push({
				source: this.nodes[i].source,
				distance: 1 / 0
			});
		}

		var srcInd = this.findEdge(distances, start.getLocation());
		distances[srcInd].distance = 0;

		while (unvisited.length > 0) {
			var minInd = 0;
			for (var i = 1; i < distances.length; i++) {
				if (distances[minInd].distance > distances[i].distance) {
					minInd = i;
				}
			}

			var u = unvisited[0];
			var uInd = 0;
			var minDist = distances[this.findEdge(distances, u.source.getLocation())].distance;
			for (var i = 1; i < unvisited.length; i++) {
				var d = distances[this.findEdge(distances, unvisited[i].source.getLocation())].distance;
				if (d < minDist) {
					minDist = d;
					u = unvisited[i];
					uInd = i;
				}
			}

			var adj = u.adjacent;
			unvisited.splice(uInd, 1);

			for (var i = 0; i < adj.length; i++) {
				if (this.edgeExists(unvisited, adj[i].getLocation())) {
					var alt = minDist +
						this.distance(u.source.getX(), u.source.getY(),
									  adj[i].source.getX(), adj[i].source.getY());

					var adjInd = this.findEdge(distances, adj[i]);

					if (alt < distances[adjInd].distance) {
						distances[adjInd] = alt;
						previous.push(u);
					}
				}
			}
		}

		return [distances, previous];
		// var unvisited = [start];
		// var visited = [];
		//
		// var distances = [{
		// 	source: start,
		// 	distance: 0
		// }];
		//
		// for (var i = 0; i < this.nodes.length; i++) {
		// 	if (!this.edgeExists(distances, this.nodes[i].source.getLocation())) {
		// 		distances.push({
		// 			source: this.nodes[i].source,
		// 			distance: 1 / 0
		// 		});
		//
		// 		unvisited.push()
		// 	}
		// }
		//
		// var current = start;
		// var currentDistInd = 0;
		//
		// var visitedEnd = false;
		//
		// while (!visitedEnd && unvisited.length > 0) {
		// 	console.log("loop");
		// 	var currentIndex = -1;
		//
		// 	// Find next traversable node
		// 	for (var i = 0; i < unvisited.length; i++) {
		// 		var index = this.findEdge(distances, unvisited[i].getLocation());
		//
		// 		if (distances[index].distance < distances[currentDistInd].distance) {
		// 			current = unvisited[i];
		// 			currentDistInd = this.findEdge(distances, current);
		// 			currentIndex = i;
		// 		}
		// 	}
		//
		// 	// Remove from unvisited list
		// 	if (currentIndex >= 0 && currentIndex < unvisited.length) {
		// 		unvisited.splice(currentIndex, 1);
		// 	}
		//
		// 	// Calculate incremental distances for adjacent nodes
		// 	var adj = this.getAdjacentEdges(current);
		// 	for (var i = 0; i < adj.length; i++) {
		// 		var node = adj[i];
		//
		// 		var visitedNode = false;
		// 		for (var k = 0; k < visited.length; k++) {
		// 			if (visited[k].getX() == node.getX() && visited[k].getY() == node.getY()) {
		// 				visitedNode = true;
		// 				break;
		// 			}
		// 		}
		//
		// 		if (!visitedNode) {
		// 			var distInd = this.findEdge(distances, [node.getX(), node.getY()]);
		// 			distances[distInd].distance = Math.min(distances[distInd].distance,
		// 				distances[currentDistInd].distance + this.distance(current.getX(), current.getY(), node.getX(), node.getY()));
		// 		}
		// 	}
		//
		// 	// Add node to visited list
		// 	if (current.getX() == end.getX() && current.getY() == end.getY()) {
		// 		visitedEnd = true;
		// 	}
		// 	visited.push(current);
		// }

		// return visited;
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

	getLocation() {
		return [this.x, this.y];
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
