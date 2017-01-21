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
		var shortestPath = this.getGraph().shortestPath([startX, startY], [endX, endY]);

		var particle = {
			spawn: {
				x: startX,
				y: startY
			},
			destination: {
				x: endX,
				y: endY
			},
			path: shortestPath
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
		var root = this.findClosestNode(start);
		var dest = this.findClosestNode(end);

		var res = this.breadthFirstSearch(root, dest)[1];

		var path = [];
		var target = dest;
		var ind = this.findEdge(res, target.getLocation());

		while (ind != -1) {
			path.unshift(target.getLocation());
			target = res[ind].previous.source;
			ind = this.findEdge(res, target.getLocation());
		}
		path.unshift(target.getLocation());

		if (!path[0].equals(new PathNode(start[0], start[1]))) {
			path.unshift(start);
		}

		if (!path[path.length - 1].equals(new PathNode(end[0], end[1]))) {
			path.push(end);
		}

		return path;
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
									  adj[i].getX(), adj[i].getY());

					var adjInd = this.findEdge(distances, adj[i].getLocation());

					if (alt < distances[adjInd].distance) {
						distances[adjInd].distance = alt;
						previous.push({source: adj[i], previous: u});
					}
				}
			}
		}

		return [distances, previous];
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

	equals(node) {
		return (node.getX() == this.x && node.getY() == this.y);
	}
}
