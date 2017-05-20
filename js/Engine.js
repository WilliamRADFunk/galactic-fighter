/* 
Galactic Fighter Engine v1.0
Last Updated: 2017-May-20
Author: William R.A.D. Funk - http://WilliamRobertFunk.com 
*/

// Engine object
var Engine = { };
// Engine's Node object.
Engine.Orb = function(x, y, rate, rad, c, strokeC)
{
	return {
		position: {
			x: x,
			y: y
		},
		speed: rate,
		colorR: c[0],
		colorG: c[1],
		colorB: c[2],
		colorA: c[3],
		strokeColorR: strokeC[0],
		strokeColorG: strokeC[1],
		strokeColorB: strokeC[2],
		strokeColorA: strokeC[3],
		radius: rad,
		fade: function(rate)
		{
			this.colorA = (this.colorA - rate < 0) ? 0 : this.colorA - rate;
			this.strokeColorA = (this.strokeColorA - rate < 0) ? 0 : this.strokeColorA - rate;
		},
		move: function(currX, currY)
		{
			this.position.x = currX;
			this.position.y = currY;
		},
		render: function()
		{
			var col = "rgba(" + this.colorR + "," + this.colorG + "," + this.colorB + "," + this.colorA + ")";
			var strCol = "rgba(" + this.strokeColorR + "," + this.strokeColorG + "," + this.strokeColorB + "," + this.strokeColorA + ")";
			context.beginPath();
			context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false);
			context.fillStyle = col;
			context.fill();
			context.lineWidth = 1;
			context.strokeStyle = strCol
			context.stroke();	
		}
	};
};

Engine.Scene = function()
{
	var objects = [];
	return {
		add: function(obj)
		{
			objects.push(obj);
		},
		remove: function(obj)
		{
			var index = objects.indexOf(obj);
			if(index > -1) objects.splice(index, 1);
		},
		render: function()
		{
			for(var i = 0; i < objects.length; i++) { objects[i].render(); }
		}
	};
};
// Engine's update cycle
Engine.update = function(timestamp)
{
	if(!start) start = timestamp;
	var progress = timestamp - start;
	
	if(progress >= (1000/FPS))
	{
		context.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);
		if(mouseState === 1)
		{
			movePlayer();
		}
		for(var i = 0, j = 0; i < playerProjectiles.length - j; i++)
		{
			moveProjectiles(playerProjectiles[i]);
			if(playerProjectiles[i].position.x >= Engine.canvas.width + 5) {
				playerProjectiles.splice(i, 1);
				j++;
			}
		}
		scene.render();
		start = null;
		// console.log('Number of projectiles: ', playerProjectiles.length);
	}
	window.requestAnimationFrame(Engine.update);
};
// Engine's initiating function.
Engine.run = function()
{
	Engine.update();
};