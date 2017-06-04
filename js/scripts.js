/* 
Galactic Fighter Engine v1.0
Last Updated: 2017-May-20
Author: William R.A.D. Funk - http://WilliamRobertFunk.com 
*/
var Game = {};

// Canvas setup and Engine instigation.
function init()
{	// Set up the Engine
	Game = new GameWrapper();
	Game.init();
}
