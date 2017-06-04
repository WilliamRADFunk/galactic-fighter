# Galactic Fighter
(In-Progress) A game built in HTML5/Canvas...just for fun
<br/>
## Instructions (for now):

### Left mouse button has player's ship chase mouse pointer.

### Space bar activates primary weapon. Note: _*Each shot costs points*_.

### Powerups alternate playership's weapon capabilities:

<ol>
	<li>Red:
		<ul>
			<li>Normal ship speed.</li>
			<li>Normal projectile speed.</li>
			<li>Normal projectile size.</li>
			<li>Normal projectile recharge.</li>
			<li>Half the scorepoint cost per shot.</li>
		</ul>
	</li>
	<li>Blue:
		<ul>
			<li>Fast ship speed.</li>
			<li>Slow projectile speed.</li>
			<li>Normal projectile size.</li>
			<li>Normal projectile recharge.</li>
			<li>Normal scorepoint cost per shot.</li>
		</ul>
	</li>
	<li>Yellow:
		<ul>
			<li>Normal ship speed.</li>
			<li>Normal projectile speed.</li>
			<li>Normal projectile size.</li>
			<li>Fast projectile recharge.</li>
			<li>Double scorepoint cost per shot.</li>
		</ul>
	</li>
	<li>Green:
		<ul>
			<li>Slow ship speed.</li>
			<li>Normal projectile speed.</li>
			<li>Double projectile size.</li>
			<li>Slow projectile recharge.</li>
			<li>Normal scorepoint cost per shot.</li>
		</ul>
	</li>
</ol>

### Ateroids:

<ul>
	<li>Each asteroid earns a hundred points when destroyed.</li>
	<li>Each asteroid that gets passed player costs a hundred points.</li>
	<li>Appearance of asteroids increases as player's score increases.</li>
</ul>

### Enemy Ships:

<ul>
	<li>Each enemy ship earns anywhere from 500 to 2000 points when destroyed, depending on difficulty.</li>
	<li>Unlike asteroids, enemy ships can and will fire back.</li>
	<li>Enemy ships have a variety of move patterns depending on type.</li>
	<li>Like the player's ship, enemy ships have a variety of ship and weapon configuration based on color.</li>
</ul>

### End Game: When player is defeated, they're name is taken and posted along with their score on the leaderboard. The aliens will not stop until Earth is destroyed. They have an endless supply of vessels and will never tire. However, with every wave destroyed you give humanity a little longer to prepare for the inevitable invasion. 

## Purpose:

A space platform shooter not unlike many of the old cabinet arcade games. End goal is to complete a self-contained browser game, then wrap it in a webview to make available through various storefronts (ie. Android playstore, iPhone, and maybe console stores...baby steps).
<br/>

## Tools:

### Front-End: HTML5 Canvas, CSS3, and Javascript.

### Back-End: PHP only for storing player scores in a MySQL database.

### Procedural generation of levels: Not sure yet.

### Version Control: Git, Git Flow, Github

### IDE: Sublime Text 3

### Artwork: Combination of freely available assets through <a href="https://openclipart.org" target="_blank">https://openclipart.org</a> and custom creations by <a href="http://www.n-somnium.com/home-sweet-home/" target="_blank">Andrea Acosta Duarte</a>.
