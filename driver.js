var slines;
onmessage = function(e) {
	if(e.data.header == "stage"){
		slines = e.data.stage;
		console.log(slines);
	}else{
		var controllerMatrix = {
			accel: 1,
			steer: 1
		};
		postMessage(controllerMatrix);
	}
}