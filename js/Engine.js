/* 
Galactic Fighter Engine v0.2.2
Last Updated: 2017-August-13
Author: William R.A.D. Funk - http://WilliamRobertFunk.com 
*/

// Wrapped game object
var GameWrapper = function() {
	// Internally global game variables.
	var Engine = {};
	var FPS = 60;
	var start = null;
	var acceptableEarthImpacts = 10;
	var asteroidDensity = 5;
	var asteroidLevel = 0;
	var asteroidSpeed = 2;
	var bannerText = null;
	var barrier = null;
	var centerX;
	var centerY;
	var context;
	var currentEarthImpacts = 0;
	var earthImpacts = [];
	var enemyLevel = 0;
	var enemyProjectiles = [];
	var enemyShips = [];
	var engineParticles = [];
	var explosions = [];
	var isOffline = false;
	var levelConfig = [
		[], // Level 0
		[100, 0, 0, 0],
		[90, 10, 0, 0],
		[80, 10, 10, 0],
		[80, 0, 10, 10],
		[70, 20, 10, 0],
		[70, 10, 10, 10],
		[70, 0, 0, 30],
		[70, 0, 20, 10],
		[60, 40, 0, 0],
		[60, 30, 10, 0],
		[60, 20, 10, 10],
		[60, 0, 40, 0],
		[60, 10, 20, 10],
		[60, 10, 10, 20],
		[50, 50, 0, 0],
		[50, 40, 0, 10],
		[50, 20, 20, 10],
		[50, 10, 20, 20],
		[50, 0, 50, 0],
		[50, 0, 0, 50],
		[50, 20, 10, 20],
		[40, 60, 0, 0],
		[40, 20, 20, 20],
		[40, 30, 20, 10],
		[40, 20, 30, 10],
		[40, 20, 10, 30],
		[40, 0, 30, 30],
		[40, 0, 20, 40],
		[40, 10, 30, 20],
		[40, 20, 0, 40],
		[40, 30, 0, 30],
		[30, 30, 10, 30],
		[30, 70, 0, 0],
		[30, 0, 70, 0],
		[30, 0, 0, 70],
		[30, 20, 30, 20],
		[30, 10, 30, 30],
		[30, 30, 30, 10],
		[30, 40, 20, 10],
		[30, 40, 10, 20],
		[30, 20, 40, 10],
		[30, 10, 40, 20],
		[30, 20, 10, 40],
		[30, 10, 20, 40],
		[0, 100, 0, 0],
		[0, 0, 100, 0],
		[0, 0, 0, 100],
		[20, 20, 20, 40],
		[20, 20, 40, 20],
		[20, 40, 20, 20]
	];
	var mouseX = centerX;
	var mouseY = centerY;
	var offlineText = null;
	var player;
	var playerLives = [];
	var playerRemainingLives = 3;
	var playerProjectiles = [];
	var powerUp = null;
	var recharge = 0;
	var scene;
	var score;
	var enterScoreText = null;
	var enterScoreInitials = {
		first: null,
		second: null,
		third: null
	};
	var showingScores = true;
	var spaceDebris = [];
	var stars = [];
	var gameOver;
	var themeMusic;
	var totalRows = 0;
	var waitUntilRevive = 0;

	// Receive fire command and perform its effect.
	function handleKeys(e)
	{
		// Captures spacebar for Chrome and Firefox, respectively.
		if(!player.isDestroyed && (e.keyCode === 32 || e.which === 32))
		{
			if(recharge <= 0 && bannerText === null)
			{
				/*
				* Audio Clip By Wyatt Walker
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
		} else if(player.isDestroyed
			&& enterScoreText !== null
			&& ((e.keyCode >= 65 && e.keyCode <= 122) || (e.which >= 65 && e.which <= 122)))
		{
			if(isOffline)
			{
				scene.remove(enterScoreText);
				enterScoreText = null;
				Engine.sendScore(null);
			}
			else if(enterScoreInitials.first === null)
			{
				enterScoreInitials.first = e.keyCode ? String.fromCharCode(e.keyCode).toUpperCase() : String.fromCharCode(e.which).toUpperCase();
				scene.remove(enterScoreText);
				enterScoreText = null;
				enterScoreText = new Engine.DisplayText(
					Engine.canvas.width / 2,
					Engine.canvas.height / 2 + 150,
					'Enter Initials: ' + enterScoreInitials.first + ' _ _'
				);
				scene.add(enterScoreText);
			}
			else if(enterScoreInitials.second === null)
			{
				enterScoreInitials.second = e.keyCode ? String.fromCharCode(e.keyCode).toUpperCase() : String.fromCharCode(e.which).toUpperCase();
				scene.remove(enterScoreText);
				enterScoreText = null;
				enterScoreText = new Engine.DisplayText(
					Engine.canvas.width / 2,
					Engine.canvas.height / 2 + 150,
					'Enter Initials: ' + enterScoreInitials.first + ' ' + enterScoreInitials.second + ' _'
				);
				scene.add(enterScoreText);
			}
			else if(enterScoreInitials.third === null)
			{
				enterScoreInitials.third = e.keyCode ? String.fromCharCode(e.keyCode).toUpperCase() : String.fromCharCode(e.which).toUpperCase();
				scene.remove(enterScoreText);
				enterScoreText = null;
				enterScoreText = new Engine.DisplayText(
					Engine.canvas.width / 2,
					Engine.canvas.height / 2 + 150,
					'Enter Initials: ' + enterScoreInitials.first + ' ' + enterScoreInitials.second + ' ' + enterScoreInitials.third
				);
				scene.add(enterScoreText);
				Engine.sendScore(enterScoreInitials.first + enterScoreInitials.second + enterScoreInitials.third);
			}
		}
	}
	// Mouse clicked
	function mouseDown(e)
	{
		if(showingScores && bannerText)
		{
			showingScores = false;
			scene.remove(bannerText);
			bannerText = null;
		}
	}
	// Mouse has moved, change the new pointer location.
	function mouseMove(e)
	{
		getMouseCoordinates(e);
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
		if(mouseX > Engine.canvas.width - 175)
		{
			mouseX = Engine.canvas.width - 175;
		} 
		else if(mouseX < 0)
		{
			mouseX = 0;
		}
		if(mouseY > Engine.canvas.height - 50)
		{
			mouseY = Engine.canvas.height - 50;
		} 
		else if(mouseY < 10)
		{
			mouseY = 10;
		}
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
			// The display asteroid to show remaining earth impacts
			{
				getAsteroid: function()
				{
					return document.getElementById('asteroid');
				},
				getPoints: function()
				{
					return 0;
				},
				getSize: function()
				{
					return 10;
				},
				getSpeed: function()
				{
					return 0;
				},
			},
			// Actual asteroids
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
	// Engine's Line object.
	Engine.Line = function(x1, y1, x2, y2, c, strokeC)
	{
		return {
			colorR: c[0],
			colorG: c[1],
			colorB: c[2],
			colorA: c[3],
			strokeColorR: strokeC[0],
			strokeColorG: strokeC[1],
			strokeColorB: strokeC[2],
			strokeColorA: strokeC[3],
			render: function()
			{
				var col = "rgba(" + this.colorR + "," + this.colorG + "," + this.colorB + "," + this.colorA + ")";
				var strCol = "rgba(" + this.strokeColorR + "," + this.strokeColorG + "," + this.strokeColorB + "," + this.strokeColorA + ")";
				context.beginPath();
				context.moveTo(x1, y1);
				context.fillStyle = col;
				context.fill();
				context.lineWidth = 4;
				context.lineTo(x2, y2);
				context.strokeStyle = strCol;
				context.stroke();
			}
		};
	};
	// Engine's Enemy Spaceship object.
	Engine.EnemySpaceship = function(x, y, config)
	{
		var level = config;
		var moveSpan = 321;
		var startingRow = (x - Engine.canvas.width) / 60;
		var startPos =
		{
			x: x,
			y: y
		};
		var configurations = [
			{
				getPoints: function()
				{
					return 500;
				},
				getShip: function(isEngineOn)
				{
					var idName = 'enemy-ship-1';
					idName += isEngineOn ? 'b' : 'a';
					return document.getElementById(idName);
				},
				getSpeed: function()
				{
					return 4;
				},
				getWeapon: function()
				{
					return {
						color: [255, 20, 147, 0.8],
						points: 0.5,
						recharge: 10,
						size: 2,
						speed: -3,
						strokeColor: [255, 20, 147, 0.8],
					};
				},
			},
			{
				getPoints: function()
				{
					return 500;
				},
				getShip: function(isEngineOn, level)
				{
					var idName = 'enemy-ship-2';
					idName += level ? level : '';
					idName += isEngineOn ? 'b' : 'a';
					return document.getElementById(idName);
				},
				getSpeed: function()
				{
					return 4;
				},
				getWeapon: function()
				{
					return {
						color: [0, 255, 255, 0.8],
						points: 0.5,
						recharge: 10,
						size: 2,
						speed: -3,
						strokeColor: [0, 255, 255, 0.8],
					};
				},
			},
			{
				getPoints: function()
				{
					return 500;
				},
				getShip: function(isEngineOn, level)
				{
					var idName = 'enemy-ship-3';
					idName += level ? level : '';
					idName += isEngineOn ? 'b' : 'a';
					return document.getElementById(idName);
				},
				getSpeed: function()
				{
					return 4;
				},
				getWeapon: function()
				{
					return {
						color: [138, 43, 226, 0.8],
						points: 0.5,
						recharge: 10,
						size: 2,
						speed: -3,
						strokeColor: [138, 43, 226, 0.8],
					};
				},
			},
			{
				getPoints: function()
				{
					return 500;
				},
				getShip: function(isEngineOn, level)
				{
					var idName = 'enemy-ship-4';
					idName += level ? level : '';
					idName += isEngineOn ? 'b' : 'a';
					return document.getElementById(idName);
				},
				getSpeed: function()
				{
					return 4;
				},
				getWeapon: function()
				{
					return {
						color: [210, 105, 30, 0.8],
						points: 0.5,
						recharge: 10,
						size: 2,
						speed: -3,
						strokeColor: [210, 105, 30, 0.8],
					};
				},
			},
		];
		return {
			applyMovementConfig: function(mConfig)
			{
				this.movementConfig = mConfig;
			},
			checkRestart: function()
			{
				if(this.currentMovement >= moveSpan)
				{
					this.restartCurrentMovement();
				}
				// If ship went off screen, this determines if the timing
				// is right to restart it at far right in original position.
				if(this.currentMovement === moveSpan - (80 + (40 * totalRows)))
				{
					return true;
				}
				return false;
			},
			currentMovement: undefined,
			decreaseLevel: function()
			{
				level--;
			},
			getConfig: function()
			{
				return config;
			},
			getCurrentMovement: function()
			{
				return this.currentMovement;
			},
			getCurrentWeapon: function()
			{
				return configurations[config].getWeapon();
			},
			getLevel: function()
			{
				return level;
			},
			increaseCurrentMovement: function()
			{
				this.currentMovement += 1;
			},
			move: function()
			{
				if(!isNaN(this.position.x) && !isNaN(this.position.y))
				{
					if(this.movementConfig === 0)
					{
						if(this.currentMovement < (81 + (40 * totalRows)))
						{
							this.position.x--;
							return true;
						}
					}
					else if(this.movementConfig === 1)
					{
						if(this.currentMovement < moveSpan)
						{
							if(undefined === this.flip || false === this.flip)
							{
								this.flip = false;
								this.position.y++;
								if((this.currentMovement % ((moveSpan - 1) / 8)) === 0) this.flip = true;
							}
							else
							{
								this.position.y--;
								if((this.currentMovement % ((moveSpan - 1) / 8)) === 0) this.flip = false;
							}
							return true;
						}
					}
					else if(this.movementConfig === 2)
					{
						if(undefined === this.angle) this.angle = 0.0;
						if(this.position.x + this.size > 0)
						{
							this.position.x -= Math.abs(Math.cos(this.angle) * 8);
							this.position.y += Math.sin(this.angle) * 2;
							this.angle += 0.05;
							return true;
						}
					}
					else if(this.movementConfig === 3)
					{
						if(undefined === this.angle) this.angle = 0.0;
						if(this.position.x + this.size > 0)
						{
							this.position.x -= Math.abs(Math.cos(this.angle) * 4);
							this.position.y += Math.sin(this.angle) * 4;
							this.angle += 0.005;
							return true;
						}
					}
					else if(this.movementConfig === 4)
					{
						if(undefined === this.angle) this.angle = 0.0;
						if(this.position.x + this.size > 0)
						{
							this.position.x -= Math.abs(Math.cos(this.angle) * 4);
							this.position.y -= Math.sin(this.angle) * 4;
							this.angle += 0.005;
							return true;
						}
					}
					else if(this.movementConfig === 5)
					{
						if(undefined === this.angle) this.angle = 0.0;
						if(this.position.x + this.size > 0)
						{
							this.position.x -= Math.abs(Math.cos(this.angle) * 4);
							this.position.y += Math.sin(this.angle) * 6;
							this.angle += 0.005;
							return true;
						}
					}
					else if(this.movementConfig === 6)
					{
						if(undefined === this.angle) this.angle = 0.0;
						if(this.position.x + this.size > 0)
						{
							this.position.x -= Math.abs(Math.cos(this.angle) * 4);
							this.position.y -= Math.sin(this.angle) * 6;
							this.angle += 0.5;
							return true;
						}
					}
				}
			},
			movementConfig: 0,
			points: configurations[config].getPoints(),
			position: {
				x: x,
				y: y
			},
			render: function()
			{
				if(!this.isDestroyed && undefined !== this.currentMovement)
				{
					var shipImg = configurations[config].getShip(this.currentMovement % 6 === 0, level);
					context.drawImage(shipImg, this.position.x, this.position.y, this.size, this.size);
				}	
			},
			restartCurrentMovement: function()
			{
				this.currentMovement = 1;
			},
			restartPos: function()
			{
				this.position.x = startPos.x;
				this.position.y = startPos.y;
				this.flip = false;
			},
			size: 50,
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
	// Engine's Powerup object.
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
				return config + 1;
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
				context.font = '48px courier';
				context.textAlign = 'center';
				context.fillText('Score: ' + points, this.position.x, this.position.y);
			}
		};
	};
	// Engine's Spaceship object.
	Engine.Spaceship = function(x, y, config)
	{
		var configurations = [
			// For display purposes only
			{
				getShip: function()
				{
					return document.getElementById('player-ship-display');
				},
				getSize: function()
				{
					return 20;
				},
				getSpeed: function()
				{
					return 0;
				},
				getWeapon: function()
				{
					return {
						color: [220, 20, 60, 0.8],
						points: 0.5,
						recharge: 10,
						size: 0,
						speed: 5,
						strokeColor: [220, 20, 60, 0.8],
					};
				},
			},
			// Actual player ship configs.
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
			destroy: function(isFromCollision)
			{
				this.isDestroyed = true;
				// Only adjust player HUD lives if from actual player death (ie. not max asteroids missed)
				if(isFromCollision)
				{
					playerRemainingLives--;
					scene.remove(playerLives[playerLives.length - 1]);
					playerLives[playerLives.length - 1] = null;
					playerLives.length = playerLives.length - 1;
				}
				if(currentEarthImpacts >= acceptableEarthImpacts)
				{
					bannerText = new Engine.TriggerText(Engine.canvas.width / 2, Engine.canvas.height / 2, 'Game Over', 'Earth is dead!');
					scene.add(bannerText);
					themeMusic.pause();
					
					gameOver.volume = 0.5;
					gameOver.play();
					if(isOffline)
					{
						enterScoreText = new Engine.DisplayText(Engine.canvas.width / 2, Engine.canvas.height / 2 + 150, 'Type any letter to play again');
						scene.add(enterScoreText);
					}
					else
					{
						enterScoreText = new Engine.DisplayText(Engine.canvas.width / 2, Engine.canvas.height / 2 + 150, 'Enter Initials: _ _ _');
						scene.add(enterScoreText);
					}
				}
				else if(playerRemainingLives > 0)
				{
					waitUntilRevive = 360;
					bannerText = new Engine.TriggerText(Engine.canvas.width / 2, Engine.canvas.height / 2, 'You Died!', 'You have ' + playerRemainingLives + ' lives left');
					scene.add(bannerText);
				}
				else
				{
					bannerText = new Engine.TriggerText(Engine.canvas.width / 2, Engine.canvas.height / 2, 'Game Over', 'You Died!');
					scene.add(bannerText);
					themeMusic.pause();

					gameOver.volume = 0.5;
					gameOver.play();
					if(isOffline)
					{
						enterScoreText = new Engine.DisplayText(Engine.canvas.width / 2, Engine.canvas.height / 2 + 150, 'Type any letter to play again');
						scene.add(enterScoreText);
					}
					else
					{
						enterScoreText = new Engine.DisplayText(Engine.canvas.width / 2, Engine.canvas.height / 2 + 150, 'Enter Initials: _ _ _');
						scene.add(enterScoreText);
					}
				}
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
			regenerate: function()
			{
				this.isDestroyed = false;
				this.move(centerX - 150, centerY);
				config = 1;
			},
			render: function()
			{
				if(!this.isDestroyed)
				{
					var shipImg = configurations[config].getShip();
					context.drawImage(shipImg, this.position.x, this.position.y, this.size, this.size);
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

	// Functions
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
					currentEarthImpacts++;
					scene.remove(earthImpacts[earthImpacts.length - 1]);
					earthImpacts[earthImpacts.length - 1] = null;
					earthImpacts.length = earthImpacts.length - 1;
					/*
					* Audio Clip By Wyatt Walker
					*/
					var missedAsteroid = new Audio('assets/missed-asteroid.wav');
					missedAsteroid.volume = 0.4;
					missedAsteroid.play();
				}
				// Remove asteroid as it leaves screen
				scene.remove(spaceDebris[i]);
				spaceDebris.splice(i, 1);
				j++;
			}
		}
		if(!player.isDestroyed && spaceDebris.length < asteroidDensity && Math.random() > 0.98)
		{
			var asteroid = new Engine.Asteroid(
				Engine.canvas.width + 50,
				Math.floor(Math.random() * (Engine.canvas.height - 60) + 30),
				1
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

				player.destroy(true);

				Engine.makeExplosion(spaceDebris[i]);

				scene.remove(spaceDebris[i]);
				spaceDebris.splice(i, 1);
				j++;
				break;
			}
		}
	}
	Engine.bannerTextFadeHandler = function()
	{
		if(bannerText.colorA > 0 && bannerText.colorA <= 0.7 && bannerText.isBlooming !== false)
		{
			bannerText.fade(-0.02);
			bannerText.isBlooming = true;
		}
		else if(bannerText.colorA > 0 || bannerText.colorA > 0.7)
		{
			bannerText.isBlooming = false;
			bannerText.fade(0.01);
		}
		// Game Over scenario
		else if(player.isDestroyed || showingScores)
		{
			bannerText.fade(-0.02);
			bannerText.isBlooming = true;
		}
		else
		{
			// Remove level text as it fades away
			scene.remove(bannerText);
			bannerText = null;
		}
	}
	Engine.DisplayText = function(x, y, txt)
	{
		return {
			colorR: 230,
			colorG: 190,
			colorB: 138,
			colorA: 1,
			position:
			{
				x: x,
				y: y
			},
			render: function()
			{
				context.fillStyle = 'rgba(' + this.colorR + ', ' + this.colorG + ', ' + this.colorB + ', ' + this.colorA + ')';
				context.font = '12px courier';
				context.textAlign = 'center';
				context.fillText(txt, this.position.x, this.position.y);
			}
		};
	}
	Engine.createEnemies = function(num)
	{
		totalRows = Math.floor(num / 7) + 1;
		var startingY = Engine.canvas.height / 2;
		var configCap = [
			Math.ceil(levelConfig[enemyLevel][0] * 0.01 * num),
			Math.ceil(levelConfig[enemyLevel][1] * 0.01 * num),
			Math.ceil(levelConfig[enemyLevel][2] * 0.01 * num),
			Math.ceil(levelConfig[enemyLevel][3] * 0.01 * num)
		];
		var configCount = [0,0,0,0];
		for(var i = 0; i < Math.floor(num / 7) + 1; i++)
		{
			if(i > 3) break; // Limit enemy on-screen count to 32
			var mod = 1;
			for(var j = 0; j < 8 && (i * 8 + j) < num; j++)
			{
				if(enemyLevel < levelConfig.length)
				{
					var backupCounter = 0;
					do
					{
						backupCounter++;
						var randomConfig = Math.floor(Math.random() * 4);
						if(configCount[randomConfig] < configCap[randomConfig] || backupCounter > 10)
						{
							var enemyShip = new Engine.EnemySpaceship(Engine.canvas.width + ((i * 50) + (i * 10)), startingY + mod, randomConfig);
							enemyShips.push(enemyShip);
							scene.add(enemyShip);
							configCount[randomConfig]++;
							// Starts aliens out in the center and populates outward from there.
							if(mod >= 0)
							{
								mod = (mod + 60) * -1;
							}
							else
							{
								mod *= -1;
							}
							break;
						}
					} while(true);
				}
			}
		}
		/*
		* Audio Clip By KevanGC
		* http://soundbible.com/1753-Alien-Siren.html
		*/
		var aliensArrive = new Audio('assets/aliens-arrive.wav');
		aliensArrive.currentTime = 4;
		aliensArrive.volume = 0.1;
		aliensArrive.currentTime = 4;
		aliensArrive.play();
	}
	Engine.enemyMovementHandler = function()
	{
		for(var i = 0; i < enemyShips.length; i++)
		{
			if(enemyShips[i].getCurrentMovement() === undefined)
			{
				enemyShips[i].restartCurrentMovement();
			}
			if(enemyShips[i].move(enemyShips[i].getCurrentMovement()))
			{
				enemyShips[i].increaseCurrentMovement();
			}
			else if(enemyShips[i].position.x + enemyShips[i].size <= 0)
			{
				// Ships is out of bounds. Now check if the timing is right
				// to restart its position
				if(enemyShips[i].checkRestart())
				{
					enemyShips[i].restartCurrentMovement();
					enemyShips[i].angle = 0.0;
					enemyShips[i].restartPos();
					enemyShips[i].applyMovementConfig(0);
				}
				else
				{
					enemyShips[i].increaseCurrentMovement();
				}
			}
			else
			{
				var moveChoice = Math.floor(Math.random() * 6) + 1;
				if(Math.random() > 0.90 && !player.isDestroyed) enemyShips[i].applyMovementConfig(moveChoice);
				else enemyShips[i].applyMovementConfig(1);
				enemyShips[i].restartCurrentMovement();
			}
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

				if(projectile.x > Engine.canvas.width - 10)
				{
					// Remove projectile
					scene.remove(playerProjectiles[k]);
					playerProjectiles.splice(k, 1);
					k--;
					continue;
				}

				if(projectile.x < (enemy.x + enemy.width)
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

					enemyShips[i].decreaseLevel();
					var newLevel = enemyShips[i].getLevel();
					if(newLevel < 0)
					{
						// Remove enemy ship
						scene.remove(enemyShips[i]);
						enemyShips.splice(i, 1);
						j++;
					}
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
				player.destroy(true);
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
	/* Gets top-five scores (arcade-style) */
	Engine.getScores = function()
	{
		var scores = [];
		$.ajax({
			type:'GET',
			url:'https://tenaciousteal.com/games/galactic-fighter/actions/getScores.php',
			dataType:'json',
			crossDomain: true,
			async: true,
			success:function(responseData)
			{
				isOffline = false;
				if(offlineText !== null)
				{
					scene.remove(offlineText);
					offlineText = null;
				}
				Engine.populateTopFive(responseData);
			},
			error:function(error)
			{
				console.log('Failed to get scores', error);
				isOffline = true;
				offlineText = new Engine.DisplayText(
					Engine.canvas.width - 60,
					Engine.canvas.height - 10,
					'Offline Mode'
				);
				scene.add(offlineText);
				showingScores = false;
			}
		});
	}
	Engine.makeExplosion = function(destroyedEntity)
	{
		/*
		* Audio Clip By Wyatt Walker
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
	Engine.playerCollisionEnemyProjectileHandler = function()
	{
		for(var i = 0, j = 0; i < enemyProjectiles.length - j; i++)
		{
			var projectile = {x: enemyProjectiles[i].position.x, y: enemyProjectiles[i].position.y, width: enemyProjectiles[i].radius, height: enemyProjectiles[i].radius};
			var ship = {x: player.position.x, y: player.position.y, width: player.size, height: player.size};

			if (projectile.x < (ship.x + ship.width)
				&& (projectile.x + projectile.width) > ship.x
				&& projectile.y < (ship.y + ship.height)
				&& (projectile.height + projectile.y) > ship.y
			) {
				Engine.makeExplosion(player);
				// Remove projectile
				scene.remove(enemyProjectiles[i]);
				enemyProjectiles.splice(i, 1);
				j++;
				// Remove player
				player.destroy(true);
				break;
			}
		}
	}
	Engine.populateTopFive = function(res) {
		showingScores = true;
		var score1 = (res.scores[0]) ? res.scores[0].initials.toUpperCase().split('').join(' ') + ': ' + res.scores[0].score : '_ _ _: ' + '0';
		var score2 = (res.scores[1]) ? res.scores[1].initials.toUpperCase().split('').join(' ') + ': ' + res.scores[1].score : '_ _ _: ' + '0';
		var score3 = (res.scores[2]) ? res.scores[2].initials.toUpperCase().split('').join(' ') + ': ' + res.scores[2].score : '_ _ _: ' + '0';
		var score4 = (res.scores[3]) ? res.scores[3].initials.toUpperCase().split('').join(' ') + ': ' + res.scores[3].score : '_ _ _: ' + '0';
		var score5 = (res.scores[4]) ? res.scores[4].initials.toUpperCase().split('').join(' ') + ': ' + res.scores[4].score : '_ _ _: ' + '0';
		bannerText = Engine.TriggerScoreText(
			Engine.canvas.width / 2,
			Engine.canvas.height / 2,
			'Click/Tap to Start',
			'Top Scores:',
			score1,
			score2,
			score3,
			score4,
			score5 
		);
		scene.add(bannerText);
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
				/*
				* Audio Clip By Wyatt Walker
				*/
				var powerupSound = new Audio('assets/power-up.wav');
				powerupSound.volume = 0.7;
				powerupSound.play();
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
		for(var i = 0, j = 0; i < enemyProjectiles.length - j; i++)
		{
			moveProjectiles(enemyProjectiles[i]);
			if(enemyProjectiles[i].position.x <= - 5)
			{
				scene.remove(enemyProjectiles[i]);
				enemyProjectiles.splice(i, 1);
				j++;
			}
		}
	}
	Engine.restartGame = function()
	{
		start = null;
		asteroidDensity = 5;
		asteroidLevel = 0;
		bannerText = null;
		barrier = null;
		currentEarthImpacts = 0;
		earthImpacts = [];
		enemyLevel = 0;
		enemyProjectiles = [];
		enemyShips = [];
		engineParticles = [];
		explosions = [];
		player = null;
		playerLives = [];
		playerRemainingLives = 3;
		playerProjectiles = [];
		powerUp = null;
		recharge = 0;
		scene = null;
		score = 0;
		enterScoreText = null;
		enterScoreInitials = {
			first: null,
			second: null,
			third: null
		};
		showingScores = true;
		spaceDebris = [];
		stars = [];
		totalRows = 0;
		waitUntilRevive = 0;

		// Create the player
		player = new Engine.Spaceship(centerX - 250, centerY, 1);
		scene = new Engine.Scene();
		scene.add(player);

		// Create Display
		for(var i = 0, j = 0; i < acceptableEarthImpacts; i++, j++)
		{
			if(j === 5) j = 0;
			var asteroidDisplayElem = new Engine.Asteroid((j * 20) + 20, (Math.floor(i / 5) + 1) * 25, 0);
			earthImpacts.push(asteroidDisplayElem);
			scene.add(asteroidDisplayElem);
		}

		for(var i = 0; i < playerRemainingLives; i++)
		{
			var playerDisplayElem = new Engine.Spaceship(Engine.canvas.width - 40 - (i * 25), (Math.floor(i / 5) + 1) * 30, 0);
			playerLives.push(playerDisplayElem);
			scene.add(playerDisplayElem);
		}

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
		// Create the energy barrier
		barrier = new Engine.Line(Engine.canvas.width - 124, 0, Engine.canvas.width - 124, Engine.canvas.height, [125, 249, 255, 0.4], [125, 249, 255, 0.4]);
		scene.add(barrier);
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

		bannerText = new Engine.TriggerText(Engine.canvas.width / 2, Engine.canvas.height / 2, '', '');

		// Gets and displays top five scores.
		Engine.getScores();
		gameOver.pause();
		themeMusic.play();
	}
	/* Inserts the new score, identified by the user's initials (arcade-style) */
	Engine.sendScore = function(initials)
	{
		if(isOffline)
		{
			Engine.restartGame();
			return;
		}
		else if(initials === "") initials = "___";
		else if(initials.length < 2) initials += "__";
		else if(initials.length < 2) initials += "_";
		var scorePackage =
		{
			initials: initials,
			score: score.getPoints()
		};

		$.ajax({
			type:'POST',
			url:'https://tenaciousteal.com/games/galactic-fighter/actions/insert.php',
			data: JSON.stringify(scorePackage),
			contentType:'application/x-www-form-urlencoded; charset=utf-8',
			dataType:'text',
			crossDomain: true,
			async: true,
			success:function()
			{
				Engine.restartGame();
			},
			error:function(error)
			{
				console.log(error);
				enterScoreInitials.first = null;
				enterScoreInitials.second = null;
				enterScoreInitials.third = null;
				scene.remove(bannerText);
				bannerText = null;
				isOffline = true;
				offlineText = new Engine.DisplayText(
					Engine.canvas.width - 60,
					Engine.canvas.height - 10,
					'Offline Mode'
				);
				scene.add(offlineText);
			}
		});
	}
	Engine.shouldEnemyFire = function()
	{
		for(var i = 0; i < enemyShips.length; i++)
		{
			if(Math.random() >= 0.998)
			{
				/*
				* Audio Clip By Wyatt Walker
				*/
				var pew = new Audio('assets/pew.wav');
				pew.volume = 0.4;
				pew.play();
				var currentWeapon = enemyShips[i].getCurrentWeapon();
				var bullet = new Engine.Orb(
					enemyShips[i].position.x + 51,
					enemyShips[i].position.y + 25,
					currentWeapon.speed,
					currentWeapon.size,
					currentWeapon.color,
					currentWeapon.strokeColor
				);
				// Add projectile to the scene.
				enemyProjectiles.push(bullet);
				scene.add(bullet);
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
	Engine.TriggerScoreText = function(x, y, txtInstruct, txtLabel, score2, score3, score4, score5, score6)
	{
		return {
			colorR: 211,
			colorG: 211,
			colorB: 211,
			colorA: 0.01,
			fade: function(rate)
			{
				this.colorA = (this.colorA - rate < 0) ? 0 : this.colorA - rate;
				this.strokeColorA = (this.strokeColorA - rate < 0) ? 0 : this.strokeColorA - rate;
			},
			position:
			{
				x: x,
				y: y
			},
			render: function()
			{
				context.fillStyle = 'rgba(' + this.colorR + ', ' + this.colorG + ', ' + this.colorB + ', ' + this.colorA + ')';
				context.font = '32px courier';
				context.textAlign = 'center';
				context.fillText(txtLabel, this.position.x, this.position.y - 150);
				context.fillText(score2, this.position.x, this.position.y - 80);
				context.fillText(score3, this.position.x, this.position.y - 40);
				context.fillText(score4, this.position.x, this.position.y);
				context.fillText(score5, this.position.x, this.position.y + 40);
				context.fillText(score6, this.position.x, this.position.y + 80);
				context.fillText(txtInstruct, this.position.x, this.position.y + 150);
			}
		};
	}
	Engine.TriggerText = function(x, y, txt1, txt2=null)
	{
		return {
			colorR: 211,
			colorG: 211,
			colorB: 211,
			colorA: 0.01,
			fade: function(rate)
			{
				this.colorA = (this.colorA - rate < 0) ? 0 : this.colorA - rate;
				this.strokeColorA = (this.strokeColorA - rate < 0) ? 0 : this.strokeColorA - rate;
			},
			position:
			{
				x: x,
				y: y
			},
			render: function()
			{
				context.fillStyle = 'rgba(' + this.colorR + ', ' + this.colorG + ', ' + this.colorB + ', ' + this.colorA + ')';
				context.font = '48px courier';
				context.textAlign = 'center';
				context.fillText(txt1, this.position.x, this.position.y);
				if(null !== txt2)
				{
					context.fillText(txt2, this.position.x, this.position.y + 70);
				}
			}
		};
	}
	// Engine's update cycle
	Engine.update = function(timestamp)
	{
		if(!start) start = timestamp;
		var progress = timestamp - start;
		
		if(progress >= (1000/FPS))
		{
			if(waitUntilRevive > 0)
			{
				waitUntilRevive--;
			}
			else if(player.isDestroyed && playerRemainingLives > 0 && waitUntilRevive <= 0 && currentEarthImpacts < acceptableEarthImpacts)
			{
				player.regenerate();
			}
			if(score.getPoints() >= asteroidLevel * 5000)
			{
				asteroidLevel++;
				asteroidDensity = asteroidLevel * 5;
			}
			if(!player.isDestroyed && enemyShips.length <= 0 && !showingScores)
			{
				enemyLevel++;
				if(bannerText !== null)
				{
					scene.remove(bannerText);
					bannerText = null;
				}
				bannerText = Engine.TriggerText(Engine.canvas.width / 2, Engine.canvas.height / 2, 'Level: ' + enemyLevel);
				scene.add(bannerText);
				Engine.createEnemies(enemyLevel + 1);
			}
			context.clearRect(0, 0, Engine.canvas.width, Engine.canvas.height);
			if(!player.isDestroyed && bannerText === null)
			{
				movePlayer();
			}
			// Move the stars a their speeds.
			Engine.starMovementHandler();
			
			if(!player.isDestroyed && bannerText === null)
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
				// Decides when an enemy ship will fire its weapons
				Engine.shouldEnemyFire();
				// Handles collision between player and enemy projectiles
				Engine.playerCollisionEnemyProjectileHandler();
			}
			else if(powerUp !== null)
			{
				scene.remove(powerUp);
				powerUp = null;
			}

			if(bannerText === null || player.isDestroyed)
			{
				// Move, and remove player projectiles as they leave the screen.
				Engine.projectileMovementHandler();
				// Moves enemies according to their individual configurations
				Engine.enemyMovementHandler();
				// Move, remove, and create (at random) asteroids as they leave the screen.
				Engine.asteroidMovementHandler();
			}
			
			if(bannerText !== null)
			{
				Engine.bannerTextFadeHandler();
			}
			// Handles movement and fading of explosions
			Engine.explosionHandler();
			// Move, remove, and create player engine exhaust particles.
			Engine.exhaustParticleHandler();
			// Makes sure player doesn't let more than acceptable number of asteroids passed.
			if(!player.isDestroyed && currentEarthImpacts >= acceptableEarthImpacts)
			{
				player.destroy(false);
			}
			
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
			* Audio Clip By Wyatt Walker
			*/
			themeMusic = new Audio('assets/theme-music.wav');
			themeMusic.addEventListener('ended', function() {
				this.currentTime = 0;
				this.play();
			}, false);
			themeMusic.volume = 0.6;
			themeMusic.play();
			
			// Create the player
			player = new Engine.Spaceship(centerX - 250, centerY, 1);
			scene = new Engine.Scene();
			scene.add(player);

			// Create Display
			for(var i = 0, j = 0; i < acceptableEarthImpacts; i++, j++)
			{
				if(j === 5) j = 0;
				var asteroidDisplayElem = new Engine.Asteroid((j * 20) + 20, (Math.floor(i / 5) + 1) * 25, 0);
				earthImpacts.push(asteroidDisplayElem);
				scene.add(asteroidDisplayElem);
			}

			for(var i = 0; i < playerRemainingLives; i++)
			{
				var playerDisplayElem = new Engine.Spaceship(Engine.canvas.width - 40 - (i * 25), (Math.floor(i / 5) + 1) * 30, 0);
				playerLives.push(playerDisplayElem);
				scene.add(playerDisplayElem);
			}

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
			// Create the energy barrier
			barrier = new Engine.Line(Engine.canvas.width - 124, 0, Engine.canvas.width - 124, Engine.canvas.height, [125, 249, 255, 0.4], [125, 249, 255, 0.4]);
			scene.add(barrier);
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
			document.addEventListener("mousemove", mouseMove, false);

			bannerText = new Engine.TriggerText(Engine.canvas.width / 2, Engine.canvas.height / 2, '', '');

			// Gets and displays top five scores.
			Engine.getScores();

			// Load sound effect for later use.
			/*
			* Audio Clip By Wyatt Walker
			*/
			gameOver = new Audio('assets/game-over.wav');

			// Instigate the rendering loop.
			window.requestAnimationFrame(Engine.update);
		}
	};
}