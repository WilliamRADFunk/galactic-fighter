/* 
Galactic Fighter Engine v1.0
Last Updated: 2017-May-20
Author: William R.A.D. Funk - http://WilliamRobertFunk.com 
*/

var FPS = 60;
var start = null;
var context;
var centerX;
var centerY;
var mouseX = centerX;
var mouseY = centerY;
var mouseState = 0;
var asteroidDensity = 10;
var asteroidSpeed = 2;
var scene;
var score;
var player;
var themeMusic;
var enemyProjectiles = [];
var engineParticles = [];
var explosions = [];
var playerProjectiles = [];
var spaceDebris = [];
var stars = [];

// Canvas setup and Engine instigation.
function init()
{	// Set up the Engine
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
	var themeMusic = new Audio('assets/theme-music.wav');
	themeMusic.addEventListener('ended', function() {
		this.currentTime = 0;
		this.play();
	}, false);
	themeMusic.volume = 0.6;
	themeMusic.play();
	
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
	document.addEventListener("keypress", fireWeapon, false);
	document.addEventListener("mousedown", mouseDown, false);
	document.addEventListener("mouseup", mouseUp, false);
	document.addEventListener("mousemove", mouseMove, false);

	// Instigate the rendering loop.
	window.requestAnimationFrame(Engine.update);
	//setInterval(Engine.run, (1000/FPS)); //Change FPS at top to alter speed. Lower is slower.
}
// Receive emote command and perform its effect.
function fireWeapon(e)
{
	if(e.keyCode === 32)
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
