var slines;
onmessage = function(e) {
	if(e.data.header == "stage"){
		slines = e.data.stage;
		console.log(slines);
	}else{
		var s;
		var a;

		

		if(e.data.gps.dist > 20){
			a = 1;
		}else{
			a = -1;
		}

		if(e.data.gps.rot > .15){
			s = 1;
			a = -1;
		}else if(e.data.gps.rot < -.15){
			s = -1;
			a = -1;
		}else{
			s = 0;
		}
		var controllerMatrix = {
			accel: a,
			steer: s
		};
		postMessage(controllerMatrix);
	}
}