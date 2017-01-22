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
	var s= 0;
	if(e.data.partFiber == 0){
		for(var i = 0; i < e.data.fibers.length; i++){
			if(e.data.fibers[i].clear == true){
				fib = i;
				s = 2;
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

