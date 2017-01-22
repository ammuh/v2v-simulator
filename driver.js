var slines;
/*
	e.data = {
		fibers:[
			{
				clear: 1,0
				distance: 
				rad:
				speed:
			}
		],
		partFiber:
		speed:
		distToNode:
		nodeFiber:
		rewards:{
			dist:
			collision:
		}
	}
*/
onmessage = function(e) {
	if(e.data.header == "stage"){
		slines = e.data.stage;
		console.log(slines);
	}else{
		var s;
		var a;
		var b = 0;
		if(e.data.gps == null){
			a = 0;
			s = 0;
			b = 1;
		}else{
			if(e.data.gps.dist > 30){
				if(e.data.speed >= 4){
					a = 0;
				}else{
					a = .4;
				}
			}else{
				b =1;
				a = 0;
				s = 0;
			}
			if(e.data.gps.rot > .3){
				s = .1;
				b = 1;
			}else if(e.data.gps.rot > 0){
				s = .1;
			}else if(e.data.gps.rot < -.3){
				s = -.1;
				b = 1;
			}else if(e.data.gps.rot < 0){
				s = -.1;
			}else{
				s = 0;
			}
		}
		var controllerMatrix = {
			accel: a,
			steer: s,
			brake: b
		};
		postMessage(controllerMatrix);
	}
}