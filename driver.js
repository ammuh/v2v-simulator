onmessage = function(e) {
	var controllerMatrix = {
		accel: 1,
		steer: 1
	};
  postMessage(controllerMatrix);
}