/* 
Galactic Fighter Engine v1.0
Last Updated: 2017-May-20
Author: William R.A.D. Funk - http://WilliamRobertFunk.com 
*/

// Wrapped game object
var GameWrapper = function() {
	// Internally global game variables.
	var FPS = 60;
	var start = null;
	var context;
	var centerX;
	var centerY;
	var Engine = {};
	var mouseX = centerX;
	var mouseY = centerY;
	var mouseState = 0;
	var asteroidDensity = 10;
	var asteroidSpeed = 2;
	var powerUp = null;
	var asteroidLevel = 0;
	var enemyLevel = 0;
	var recharge = 0;
	var scene;
	var score;
	var player;
	var themeMusic;
	var enemyProjectiles = [];
	var enemyShips = [];
	var engineParticles = [];
	var explosions = [];
	var playerProjectiles = [];
	var spaceDebris = [];
	var stars = [];

	// Receive emote command and perform its effect.
	function handleKeys(e)
	{
		// Captures spacebar for Chrome and Firefox, respectively.
		if(!player.isDestroyed && (e.keyCode === 32 || e.which === 32))
		{
			if(recharge <= 0)
			{
				/*
				* Audio Clip By DKnight556
				* http://soundbible.com/1949-Pew-Pew.html
				*/
				var pew = new Audio('assets/pew.wav');
				pew.volume = 0.4;
				pew.play();
				var currentWeapon = player.getCurrentWeapon();
				var bullet = new Engine.Orb(
					player.position.x + 51,
					player.position.y + 25,
					currentWeapon.speed,
					currentWeapon.size,
					currentWeapon.color,
					currentWeapon.strokeColor
				);
				// Player spends points per shot of weapon.
				score.addPoints(-currentWeapon.points * 10);
				// Add projectile to the scene.
				playerProjectiles.push(bullet);
				scene.add(bullet);

				recharge = currentWeapon.recharge;
			}
		}
	}
	// Mouse state is active (mov player)
	function mouseDown(e)
	{
		mouseState = 1;
		getMouseCoordinates(e);
	}
	// Mouse state is inactive (stop moving player)
	function mouseUp(e)
	{
		mouseState = 0;
	}
	// Mouse has moved, change the new pointer location.
	function mouseMove(e)
	{
		if(mouseState === 1) getMouseCoordinates(e);
	}
	// Calculate mouse position relative to canvas
	function getMouseCoordinates(e)
	{
		var wrapperElement = document.getElementById("engine-wrapper");
		var rect = wrapperElement.getBoundingClientRect();
		var width = wrapperElement.offsetWidth;
		var height = wrapperElement.offsetHeight;
		// Get the X coordinate for mouse
		if(e.clientX <= rect.left) mouseX = 0 + player.size;
		else if(e.clientX >= (rect.left + width)) mouseX = width - player.size;
		else mouseX = e.clientX - rect.left;
		// Get the Y coordinate for mouse
		if(e.clientY >= (rect.top + height)) mouseY = height - player.size;
		else if(e.clientY <= rect.top) mouseY = 0 + player.size;
		else mouseY = e.clientY - rect.top;
	}
	// Does some smoothing math to transition player toward mouse pointer.
	function movePlayer()
	{
		var oldPlayerX = player.position.x;
		var oldPlayerY = player.position.y;
		var xDiff = mouseX - oldPlayerX;
		var yDiff = mouseY - oldPlayerY;

		if(Math.abs(xDiff) <= 2 && Math.abs(yDiff) <= 2) return;

		var distance = Math.sqrt(Math.pow(mouseX-oldPlayerX,2) + Math.pow(mouseY-oldPlayerY,2));
		var directionX = ((xDiff != 0) ? (xDiff / distance) : 0);
		var directionY = ((yDiff != 0) ? (yDiff / distance) : 0);

		var modifierX = (directionX < 0) ? Math.floor(directionX * player.speed) : Math.ceil(directionX * player.speed);
		var modifierY = (directionY < 0) ? Math.floor(directionY * player.speed) : Math.ceil(directionY * player.speed);

		var newPlayerX = oldPlayerX + modifierX;
		var newPlayerY = oldPlayerY + modifierY;

		player.move(newPlayerX, newPlayerY);
	}
	// Moves debris and projectiles along their linear paths.
	function moveProjectiles(obj)
	{
		var newObjX = obj.position.x + obj.speed;
		var newObjY = obj.position.y;

		obj.move(newObjX, newObjY);
	}
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
	// Engine's Asteroid object.
	Engine.PowerUp = function(x, y, config)
	{
		var configurations = [
			{
				getPowerUp: function()
				{
					return document.getElementById('power-up-null');
				},
				getSize: function()
				{
					return 30;
				},
				getSpeed: function()
				{
					return -4;
				},
			},
			{
				getPowerUp: function()
				{
					return document.getElementById('power-up-speed');
				},
				getSize: function()
				{
					return 30;
				},
				getSpeed: function()
				{
					return -4;
				},
			},
			{
				getPowerUp: function()
				{
					return document.getElementById('power-up-shield');
				},
				getSize: function()
				{
					return 30;
				},
				getSpeed: function()
				{
					return -4;
				},
			},
			{
				getPowerUp: function()
				{
					return document.getElementById('power-up-rechargeless');
				},
				getSize: function()
				{
					return 30;
				},
				getSpeed: function()
				{
					return -4;
				},
			},
		];
		return {
			position: {
				x: x,
				y: y
			},
			size: configurations[config].getSize(),
			speed: configurations[config].getSpeed(),
			getEffect: function()
			{
				return config;
			},
			move: function(currX, currY)
			{
				this.position.x = currX;
				this.position.y = currY;
			},
			render: function()
			{
				var powerUpImg = configurations[config].getPowerUp();
				context.drawImage(
					powerUpImg,
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
				getSize: function()
				{
					return 50;
				},
				getSpeed: function()
				{
					return 4;
				},
				getWeapon: function()
				{
					return {
						color: [220, 20, 60, 0.8],
						points: 0.5,
						recharge: 10,
						size: 2,
						speed: 5,
						strokeColor: [220, 20, 60, 0.8],
					};
				},
			},
			{
				getShip: function()
				{
					return document.getElementById('player-ship-blue');
				},
				getSize: function()
				{
					return 50;
				},
				getSpeed: function()
				{
					return 6;
				},
				getWeapon: function()
				{
					return {
						color: [0, 0, 255, 0.8],
						points: 1,
						recharge: 10,
						size: 2,
						speed: 1,
						strokeColor: [0, 0, 255, 0.8],
					};
				},
			},
			{
				getShip: function()
				{
					return document.getElementById('player-ship-green');
				},
				getSize: function()
				{
					return 50;
				},
				getSpeed: function()
				{
					return 2;
				},
				getWeapon: function()
				{
					return {
						color: [0, 100, 0, 0.8],
						points: 1,
						recharge: 20,
						size: 8,
						speed: 5,
						strokeColor: [0, 100, 0, 0.8],
					};
				},
			},
			{
				getShip: function()
				{
					return document.getElementById('player-ship-yellow');
				},
				getSize: function()
				{
					return 50;
				},
				getSpeed: function()
				{
					return 4;
				},
				getWeapon: function()
				{
					return {
						color: [234, 228, 85, 0.8],
						points: 2,
						recharge: 4,
						size: 2,
						speed: 5,
						strokeColor: [234, 228, 85, 0.8],
					};
				},
			},
		];
		return {
			position: {
				x: x,
				y: y
			},
			size: configurations[config].getSize(),
			destroy: function()
			{
				this.isDestroyed = true;
			},
			getCurrentWeapon: function()
			{
				return configurations[config].getWeapon();
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
					context.drawImage(shipImg, this.position.x, this.position.y, player.size, player.size);
				}	
			},
			speed: configurations[config].getSpeed()
		};
	};
	// Engine's Enemy Spaceship object.
	Engine.EnemySpaceship = function(x, y, config)
	{
		var configurations = [
			{
				getMovement: function()
				{
					return [
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U'

					];
				},
				getPoints: function()
				{
					return 500;
				},
				getShip: function()
				{
					return document.getElementById('enemy-ship-blue');
				},
				getSize: function()
				{
					return 50;
				},
				getSpeed: function()
				{
					return 4;
				},
				getWeapon: function()
				{
					return {
						color: [220, 20, 60, 0.8],
						points: 0.5,
						recharge: 10,
						size: -2,
						speed: 5,
						strokeColor: [220, 20, 60, 0.8],
					};
				},
			},
			{
				getMovement: function()
				{
					return [
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U'

					];
				},
				getPoints: function()
				{
					return 500;
				},
				getShip: function()
				{
					return document.getElementById('enemy-ship-purple');
				},
				getSize: function()
				{
					return 50;
				},
				getSpeed: function()
				{
					return 4;
				},
				getWeapon: function()
				{
					return {
						color: [220, 20, 60, 0.8],
						points: 0.5,
						recharge: 10,
						size: -2,
						speed: 5,
						strokeColor: [220, 20, 60, 0.8],
					};
				},
			},
			{
				getMovement: function()
				{
					return [
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U'

					];
				},
				getPoints: function()
				{
					return 500;
				},
				getShip: function()
				{
					return document.getElementById('enemy-ship-orange');
				},
				getSize: function()
				{
					return 50;
				},
				getSpeed: function()
				{
					return 4;
				},
				getWeapon: function()
				{
					return {
						color: [220, 20, 60, 0.8],
						points: 0.5,
						recharge: 10,
						size: -2,
						speed: 5,
						strokeColor: [220, 20, 60, 0.8],
					};
				},
			},
			{
				getMovement: function()
				{
					return [
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L','L',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R','R',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U',
						'U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U','U'

					];
				},
				getPoints: function()
				{
					return 500;
				},
				getShip: function()
				{
					return document.getElementById('enemy-ship');
				},
				getSize: function()
				{
					return 50;
				},
				getSpeed: function()
				{
					return 4;
				},
				getWeapon: function()
				{
					return {
						color: [220, 20, 60, 0.8],
						points: 0.5,
						recharge: 10,
						size: -2,
						speed: 5,
						strokeColor: [220, 20, 60, 0.8],
					};
				},
			},
		];
		return {
			position: {
				x: x,
				y: y
			},
			size: configurations[config].getSize(),
			getCurrentWeapon: function()
			{
				return configurations[config].getWeapon();
			},
			getMovement: configurations[config].getMovement(),
			points: configurations[config].getPoints(),
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
					context.drawImage(shipImg, this.position.x, this.position.y, player.size, player.size);
				}	
			},
			speed: configurations[config].getSpeed()
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
	Engine.asteroidMovementHandler = function()
	{
		for(var i = 0, j = 0; i < spaceDebris.length - j; i++)
		{
			moveProjectiles(spaceDebris[i]);
			if(spaceDebris[i].position.x < -50)
			{
				if(!player.isDestroyed)
				{
					// Player loses points for missing asteroid
					score.addPoints(-spaceDebris[i].points);
				}
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
				Math.floor(Math.random() * (Engine.canvas.height - 60) + 30),
				0
			);
			spaceDebris.push(asteroid);
			scene.add(asteroid);
		}
	}
	Engine.asteroidProjectileCollisionHandler = function()
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
					Engine.makeExplosion(spaceDebris[i]);
					// Remove projectile
					scene.remove(playerProjectiles[k]);
					playerProjectiles.splice(k, 1);
					l++;
					if(!player.isDestroyed)
					{
						// Increase player's points
						score.addPoints(spaceDebris[i].points);
					}
					// Remove asteroid
					scene.remove(spaceDebris[i]);
					spaceDebris.splice(i, 1);
					j++;
					break;
				}
			}
		}
	}
	Engine.asteroidShipCollisionHandler = function()
	{
		for(var i = 0, j = 0; i < spaceDebris.length - j; i++)
		{
			var ship = {x: player.position.x, y: player.position.y, width: player.size, height: player.size};
			var asteroid = {x: spaceDebris[i].position.x, y: spaceDebris[i].position.y, width: spaceDebris[i].size, height: spaceDebris[i].size}

			if ((ship.x + (ship.width * 0.1)) < (asteroid.x + asteroid.width)
				&& (ship.x + ship.width - (ship.width * 0.1)) > asteroid.x
				&& (ship.y + (ship.height * 0.1)) < (asteroid.y + asteroid.height)
				&& (ship.height + ship.y - (ship.height * 0.1)) > asteroid.y
			) {
				Engine.makeExplosion(player);

				player.destroy();

				Engine.makeExplosion(spaceDebris[i]);

				scene.remove(spaceDebris[i]);
				spaceDebris.splice(i, 1);
				j++;
				break;
			}
		}
	}
	Engine.createEnemies = function(num)
	{
		var startingY = 50;
		var randomConfig = Math.floor(Math.random() * 4);
		for(var i = 0; i < num; i++)
		{
			var enemyShip = new Engine.EnemySpaceship(Engine.canvas.width, startingY + (i * 75), randomConfig);
			enemyShips.push(enemyShip);
			scene.add(enemyShip);
		}
	}
	Engine.enemyMovementHandler = function()
	{
		for(var i = 0; i < enemyShips.length; i++)
		{
			var x = 0;
			var y = 0;
			if(enemyShips[i].currentMovement === undefined)
			{
				enemyShips[i].currentMovement = 0;
			}
			else if(enemyShips[i].currentMovement >= enemyShips[i].getMovement.length)
			{
				enemyShips[i].currentMovement = 60;
			}
			switch(enemyShips[i].getMovement[enemyShips[i].currentMovement])
			{
				case 'L':
				{
					x--;
					break;
				}
				case 'U':
				{
					y--;
					break;
				}
				case 'R':
				{
					x++;
					break;
				}
				case 'D':
				{
					y++;
					break;
				}
				default:
				{
					break;
				}
			}
			enemyShips[i].move(enemyShips[i].position.x + x, enemyShips[i].position.y + y);
			enemyShips[i].currentMovement++;
		}
	}
	Engine.enemyProjectileCollisionHandler = function()
	{
		for(var i = 0, j = 0; i < enemyShips.length - j; i++)
		{
			for(var k = 0, l = 0; k < playerProjectiles.length - l; k++)
			{
				var projectile = {x: playerProjectiles[k].position.x, y: playerProjectiles[k].position.y, width: playerProjectiles[k].radius, height: playerProjectiles[k].radius};
				var enemy = {x: enemyShips[i].position.x, y: enemyShips[i].position.y, width: enemyShips[i].size, height: enemyShips[i].size}

				if (projectile.x < (enemy.x + enemy.width)
					&& (projectile.x + projectile.width) > enemy.x
					&& projectile.y < (enemy.y + enemy.height)
					&& (projectile.height + projectile.y) > enemy.y
				) {
					Engine.makeExplosion(enemyShips[i]);
					// Remove projectile
					scene.remove(playerProjectiles[k]);
					playerProjectiles.splice(k, 1);
					l++;
					if(!player.isDestroyed)
					{
						// Increase player's points
						score.addPoints(enemyShips[i].points);
					}
					// Remove enemy ship
					scene.remove(enemyShips[i]);
					enemyShips.splice(i, 1);
					j++;
					break;
				}
			}
		}
	}
	Engine.enemySpaceshipCollisionHandler = function()
	{
		for(var i = 0, j = 0; i < enemyShips.length - j; i++)
		{
			var ship = {x: player.position.x, y: player.position.y, width: player.size, height: player.size};
			var enemy = {x: enemyShips[i].position.x, y: enemyShips[i].position.y, width: enemyShips[i].size, height: enemyShips[i].size}

			console.log(ship.x, enemy.x, ship.y, enemy.y);
			if ((ship.x + (ship.width * 0.1)) < (enemy.x + enemy.width)
				&& (ship.x + ship.width - (ship.width * 0.1)) > enemy.x
				&& (ship.y + (ship.height * 0.1)) < (enemy.y + enemy.height)
				&& (ship.height + ship.y - (ship.height * 0.1)) > enemy.y
			) {
				Engine.makeExplosion(enemyShips[i]);
				Engine.makeExplosion(player);
				// Increase player's points
				score.addPoints(enemyShips[i].points);
				// Remove enemy ship
				scene.remove(enemyShips[i]);
				enemyShips.splice(i, 1);
				j++;
				// Remove the player
				player.destroy();
				break;
			}
		}
	}
	Engine.exhaustParticleHandler = function()
	{
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
					player.position.y + (player.size / 2) - (7 * Math.random())
				);
				engineParticles[i].fade(-1);
			}
		}
	}
	Engine.explosionHandler = function()
	{
		for(var i = 0, j = 0; i < explosions.length - j; i++)
		{
			explosions[i].move(explosions[i].position.x + explosions[i].speed, explosions[i].position.y);
			if(explosions[i].colorA > 0 && explosions[i].colorA <= 0.7 && explosions[i].isBlooming !== false)
			{
				explosions[i].fade(-0.02);
				explosions[i].isBlooming = true;
			}
			else if(explosions[i].colorA > 0 || explosions[i].colorA > 0.7)
			{
				explosions[i].isBlooming = false;
				explosions[i].fade(0.01);
			}
			else
			{
				// Remove explosion as it fades away
				scene.remove(explosions[i]);
				explosions.splice(i, 1);
				j++;
			}
		}
	}
	Engine.makeExplosion = function(destroyedEntity)
	{
		/*
		* Audio Clip By Mike Koenig
		* http://soundbible.com/1234-Bomb.html
		*/
		var boom = new Audio('assets/explosion.wav');
		boom.volume = 0.4;
		boom.play();

		explosionOuter = new Engine.Orb(
			destroyedEntity.position.x,
			destroyedEntity.position.y,
			-1,
			(destroyedEntity.size),
			[239, 74, 37, 0.01],
			[239, 74, 37, 0.01]
		);
		explosions.push(explosionOuter);
		scene.add(explosionOuter);

		explosionInner = new Engine.Orb(
			destroyedEntity.position.x,
			destroyedEntity.position.y,
			-1,
			(destroyedEntity.size / 2),
			[170, 13, 3, 0.01],
			[170, 13, 3, 0.01]
		);
		explosions.push(explosionInner);
		scene.add(explosionInner);
	}
	Engine.powerUpHandler = function()
	{
		if(powerUp === null && Math.random() > 0.995)
		{
			powerUp = new Engine.PowerUp(
				Engine.canvas.width + 50,
				Math.floor(Math.random() * (Engine.canvas.height - 60) + 30),
				Math.floor(Math.random() * 3.99),
			);
			scene.add(powerUp);
		}
		else if(powerUp !== null)
		{
			var powerup = {x: powerUp.position.x, y: powerUp.position.y, width: powerUp.size, height: powerUp.size};
			var ship = {x: player.position.x, y: player.position.y, width: player.size, height: player.size}
			if(powerUp.position.x < 0)
			{
				scene.remove(powerUp);
				powerUp = null;
			}
			else if(powerup.x < (ship.x + ship.width)
				&& (powerup.x + powerup.width) > ship.x
				&& powerup.y < (ship.y + ship.height)
				&& (powerup.height + powerup.y) > ship.y)
			{
				scene.remove(powerUp);
				scene.remove(player);
				player = new Engine.Spaceship(player.position.x, player.position.y, powerUp.getEffect());
				scene.add(player);
				powerUp = null;
			}
			else
			{
				powerUp.move(powerUp.position.x + powerUp.speed, powerUp.position.y);
			}
		}
	}
	Engine.projectileMovementHandler = function()
	{
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
	}
	Engine.starMovementHandler = function()
	{
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
	}
	// Engine's update cycle
	Engine.update = function(timestamp)
	{
		if(!start) start = timestamp;
		var progress = timestamp - start;
		
		if(progress >= (1000/FPS))
		{
			if(score.getPoints() >= asteroidLevel * 5000)
			{
				asteroidLevel++;
				asteroidDensity = asteroidLevel * 10;
			}
			if(enemyShips.length <= 0 && score.getPoints() >= enemyLevel * (enemyLevel * 2000))
			{
				enemyLevel++;
				Engine.createEnemies(enemyLevel * 2);
			}
			context.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);
			if(mouseState === 1 && !player.isDestroyed)
			{
				movePlayer();
			}
			// Move the stars a their speeds.
			Engine.starMovementHandler();
			// Move, and remove player projectiles as they leave the screen.
			Engine.projectileMovementHandler();
			
			if(!player.isDestroyed)
			{
				// Checks to see if ship was struck by an asteroid
				Engine.asteroidShipCollisionHandler();
				// Checks to see if asteroid was struck by a projectile
				Engine.asteroidProjectileCollisionHandler();
				// Small chance that a powerup happens
				Engine.powerUpHandler();
				// Handles collisions between enemy ships and player projectiles
				Engine.enemyProjectileCollisionHandler();
				// Handles collisions between player's ship and enemy ships
				Engine.enemySpaceshipCollisionHandler();
			}
			else if(powerUp !== null)
			{
				scene.remove(powerUp);
				powerUp = null;
			}
			// Moves enemies according to their individual configurations
			Engine.enemyMovementHandler();
			// Handles movement and fading of explosions
			Engine.explosionHandler();
			// Move, remove, and create (at random) asteroids as they leave the screen.
			Engine.asteroidMovementHandler();
			// Move, remove, and create player engine exhaust particles.
			Engine.exhaustParticleHandler();
			
			scene.render();
			start = null;
			// console.log('Number of scene objects: ', scene.getObjectCount());

			recharge--;
		}
		window.requestAnimationFrame(Engine.update);
	};
	// Engine's initiating function.
	Engine.run = function()
	{
		Engine.update();
	};

	return {
		init: function() {
			Engine.canvas = document.getElementById('engine-wrapper');
			Engine.canvas.width = Engine.canvas.clientWidth;
			Engine.canvas.height = Engine.canvas.clientHeight;
			centerX = Engine.canvas.width/2;
			centerY = Engine.canvas.height/2;
			context = Engine.canvas.getContext('2d');
			/*
			* Audio Clip By Kritex
			* https://www.looperman.com/loops/detail/70534/adventure-club-drop-loop-by-kritex-free-140bpm-dubstep-wobble-bass-loop
			*/
			// var themeMusic = new Audio('assets/theme-music.wav');
			// themeMusic.addEventListener('ended', function() {
			// 	this.currentTime = 0;
			// 	this.play();
			// }, false);
			// themeMusic.volume = 0.6;
			// themeMusic.play();
			
			// Create the player
			player = new Engine.Spaceship(centerX - 150, centerY, 0);
			scene = new Engine.Scene();
			scene.add(player);

			// Create the stars that will give the illusion of movement.
			for(var i = 0; i < 20; i++)
			{
				var star = new Engine.Orb(
					Math.floor(Math.random() * Engine.canvas.height) + 50,
					Math.floor(Math.random() * Engine.canvas.height),
					-(Math.floor(Math.random() * 5) + 2),
					1,
					[255,255,255,0.3],
					[255,255,255,0.3]
				);
				stars.push(star);
				scene.add(star);
			}
			// Create engine particles
			for(var i = 0; i < 50; i++)
			{
				var engParticle = new Engine.Orb(
						player.position.x - (i * 5),
						player.position.y + (player.size / 2) - (8 * Math.random()),
						-3,
						1,
						[232,185,18,Math.random()],
						[232,185,18,Math.random()]
					);

				engineParticles.push(engParticle);
				scene.add(engParticle);
			}
			// Create scoreboard
			score = new Engine.Score(centerX, 50);
			scene.add(score);
			// Create the keyboard event listener
			document.addEventListener("keypress", handleKeys, false);
			document.addEventListener("mousedown", mouseDown, false);
			document.addEventListener("mouseup", mouseUp, false);
			document.addEventListener("mousemove", mouseMove, false);

			// Instigate the rendering loop.
			window.requestAnimationFrame(Engine.update);
		}
	};
}