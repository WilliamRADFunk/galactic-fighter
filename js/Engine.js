/* 
Galactic Fighter Engine v1.0
Last Updated: 2017-May-20
Author: William R.A.D. Funk - http://WilliamRobertFunk.com 
*/

// Engine object
var Engine = { };
// Engine's Asteroid object.
Engine.Asteroid = function(x, y, config)
{
	var configurations = [
		{
			getAsteroid: function()
			{
				return document.getElementById('asteroid');
			},
			getPoints: function()
			{
				return 100;
			},
			getSize: function()
			{
				return 30;
			},
			getSpeed: function()
			{
				return -2;
			},
		},
	];
	return {
		points: configurations[config].getPoints(),
		position: {
			x: x,
			y: y
		},
		size: configurations[config].getSize(),
		speed: configurations[config].getSpeed(),
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
			var asteroidImg = configurations[config].getAsteroid();
			context.drawImage(
				asteroidImg,
				this.position.x,
				this.position.y,
				configurations[config].getSize(),
				configurations[config].getSize()
			);	
		}
	};
};
// Engine's Score object.
Engine.Score = function(x, y)
{
	var points = 0;
	return {
		position:
		{
			x: x,
			y: y
		},
		addPoints: function(plus)
		{
			points += plus;
			if(points < 0)
			{
				points = 0;
			}
		},
		fade: function(rate)
		{
			this.colorA = (this.colorA - rate < 0) ? 0 : this.colorA - rate;
			this.strokeColorA = (this.strokeColorA - rate < 0) ? 0 : this.strokeColorA - rate;
		},
		getPoints: function()
		{
			return points;
		},
		move: function(currX, currY)
		{
			this.position.x = currX;
			this.position.y = currY;
		},
		render: function()
		{
			context.fillStyle = '#FFFFFF';
			context.font = '48px serif';
			context.textAlign = 'center';
			context.fillText('Score: ' + points, this.position.x, this.position.y);
		}
	};
};
// Engine's Spaceship object.
Engine.Spaceship = function(x, y, config)
{
	var configurations = [
		{
			getShip: function()
			{
				return document.getElementById('player-ship');
			},
			getSpeed: function()
			{
				return 4;
			},
		},
	];
	return {
		position: {
			x: x,
			y: y
		},
		destroy: function()
		{
			this.isDestroyed = true;
		},
		fade: function(rate)
		{
			this.colorA = (this.colorA - rate < 0) ? 0 : this.colorA - rate;
			this.strokeColorA = (this.strokeColorA - rate < 0) ? 0 : this.strokeColorA - rate;
		},
		getCurrentWeapon: function()
		{
			return {
				color: [255,0,255,0.8],
				points: 1,
				size: 2,
				speed: 5,
				strokeColor: [255,0,255,0.8],
			};
		},
		isDestroyed: false,
		move: function(currX, currY)
		{
			if(!this.isDestroyed)
			{
				this.position.x = currX;
				this.position.y = currY;
			}
		},
		render: function()
		{
			if(!this.isDestroyed)
			{
				var shipImg = configurations[config].getShip();
				context.drawImage(shipImg, this.position.x, this.position.y, playerSize, playerSize);
			}	
		},
		speed: configurations[config].getSpeed()
	};
};
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
		getObjectCount: function()
		{
			return objects.length;
		},
		remove: function(obj)
		{
			var index = objects.indexOf(obj);
			if(index > -1) objects.splice(index, 1);
		},
		render: function()
		{
			for(var i = 0; i < objects.length; i++)
			{
				objects[i].render();
			}
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
		if(mouseState === 1 && !player.isDestroyed)
		{
			movePlayer();
		}
		// Move the stars a their speeds.
		for(var i = 0; i < stars.length; i++)
		{
			moveProjectiles(stars[i]);
			if(stars[i].position.x <= -5)
			{
				stars[i].move(
					Engine.canvas.width + 50, 
					Math.floor(Math.random() * Engine.canvas.height)
				);
			}
		}
		// Move, and remove player projectiles as they leave the screen.
		for(var i = 0, j = 0; i < playerProjectiles.length - j; i++)
		{
			moveProjectiles(playerProjectiles[i]);
			if(playerProjectiles[i].position.x >= Engine.canvas.width + 5)
			{
				scene.remove(playerProjectiles[i]);
				playerProjectiles.splice(i, 1);
				j++;
			}
		}
		// Move, remove, and create player engine exhaust particles.
		for(var i = 0; i < engineParticles.length; i++)
		{
			moveProjectiles(engineParticles[i]);
			if(engineParticles[i].colorA > 0)
			{
				engineParticles[i].fade(Math.random() * (0.08 - 0.01) + 0.01);
			}
			
			if(engineParticles[i].colorA <= 0 && !player.isDestroyed)
			{
				engineParticles[i].move(
					player.position.x,
					player.position.y + (playerSize / 2) - (7 * Math.random())
				);
				engineParticles[i].fade(-1);
			}
		}
		// Move, remove, and create (at random) asteroids as they leave the screen.
		for(var i = 0, j = 0; i < spaceDebris.length - j; i++)
		{
			moveProjectiles(spaceDebris[i]);
			if(spaceDebris[i].position.x < -50)
			{
				// Player loses points for missing asteroid
				score.addPoints(-spaceDebris[i].points);
				// Remove asteroid as it leaves screen
				scene.remove(spaceDebris[i]);
				spaceDebris.splice(i, 1);
				j++;
			}
		}
		if(spaceDebris.length < asteroidDensity && Math.random() > 0.98)
		{
			var asteroid = new Engine.Asteroid(
				Engine.canvas.width + 50,
				Math.floor(Math.random() * (Engine.canvas.height - 30)),
				0
			);
			spaceDebris.push(asteroid);
			scene.add(asteroid);
		}
		// Checks to see if ship was struck by an asteroid
		if(!player.isDestroyed)
		{
			for(var i = 0, j = 0; i < spaceDebris.length - j; i++)
			{
				var ship = {x: player.position.x, y: player.position.y, width: playerSize, height: playerSize};
				var asteroid = {x: spaceDebris[i].position.x, y: spaceDebris[i].position.y, width: spaceDebris[i].size, height: spaceDebris[i].size}

				if ((ship.x + (ship.width * 0.1)) < (asteroid.x + asteroid.width)
					&& (ship.x + ship.width - (ship.width * 0.1)) > asteroid.x
					&& (ship.y + (ship.height * 0.1)) < (asteroid.y + asteroid.height)
					&& (ship.height + ship.y - (ship.height * 0.1)) > asteroid.y
				) {
					console.log("BOOM");
					player.destroy();
				}
			}
		}
		// Checks to see if asteroid was struck by a projectile
		if(!player.isDestroyed)
		{
			for(var i = 0, j = 0; i < spaceDebris.length - j; i++)
			{
				for(var k = 0, l = 0; k < playerProjectiles.length - l; k++)
				{
					var projectile = {x: playerProjectiles[k].position.x, y: playerProjectiles[k].position.y, width: playerProjectiles[k].radius, height: playerProjectiles[k].radius};
					var asteroid = {x: spaceDebris[i].position.x, y: spaceDebris[i].position.y, width: spaceDebris[i].size, height: spaceDebris[i].size}

					if (projectile.x < (asteroid.x + asteroid.width)
						&& (projectile.x + projectile.width) > asteroid.x
						&& projectile.y < (asteroid.y + asteroid.height)
						&& (projectile.height + projectile.y) > asteroid.y
					) {
						console.log("POW!");
						// Remove projectile
						scene.remove(playerProjectiles[k]);
						playerProjectiles.splice(k, 1);
						l++;
						// Increase player's points
						score.addPoints(spaceDebris[i].points);
						// Remove asteroid
						scene.remove(spaceDebris[i]);
						spaceDebris.splice(i, 1);
						j++;
						break;
					}
				}
			}
		}
		
		scene.render();
		start = null;
		// console.log('Number of scene objects: ', scene.getObjectCount());
	}
	window.requestAnimationFrame(Engine.update);
};
// Engine's initiating function.
Engine.run = function()
{
	Engine.update();
};