/* 
Galactic Fighter Engine v0.2.2
Last Updated: 2017-August-13
Author: William R.A.D. Funk - http://WilliamRobertFunk.com 
*/
var Game = {};

// Canvas setup and Engine instigation.
function init()
{	// Set up the Engine
	Game = new GameWrapper();
	Game.init();
}
