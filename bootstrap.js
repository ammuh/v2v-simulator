var stage1 = new Stage();

var stageData = [
	[0, 0, 720, 0],
	[0, 0, 0, 720],
	[720, 0, 720, 720],
	[0, 720, 720, 720],
	[ 100, 0, 100, 620],
	[ 100, 620, 720, 620]
];

var graphEdges = [
	[[700, 670], [50, 670]],
	[[70], [50, 20]]
];

for (var arr in stageData) {
  stage1.addLine(arr[0], arr[1], arr[2], arr[3]);
}

for (var arr in graphEdges) {
  stage1.addPathNode(arr[0], arr[1], true);
}
