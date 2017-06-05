/* 
Galactic Fighter Engine v0.1.1
Last Updated: 2017-June-04
Author: William R.A.D. Funk - http://WilliamRobertFunk.com 
*/
var Game = {};

// Canvas setup and Engine instigation.
function init()
{	// Set up the Engine
	Game = new GameWrapper();
	Game.init();
}
