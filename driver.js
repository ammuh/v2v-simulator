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
	var fib = e.data.partFiber;
	var s = e.data.speed;
	if(s == 0){
		console.log(e.data);
		for(var i = 0; i < e.data.fibers.length; i++){
			if(e.data.fibers[i].clear == true){
				fib = i;
				s = 2;
				console.log("Found path: " + i);
				break;
			}
		}
	}
	var controllerMatrix = {
		speed: s,
		fiber: fib
	};
	postMessage(controllerMatrix);
}