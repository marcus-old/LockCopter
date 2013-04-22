$(document).ready(function(){   // just one teeny weeny bit of jquery can't hurt
	StartCopter();
	iphone.init();
});

// Copter
var Copter;
function StartCopter(){
Copter = "";
//document.getElementById("Game").getContext("2d").clearRect(0,0,document.getElementById("Game").width,document.getElementById("Game").height);	// Clear canvas
// Get HiScore
if(!localStorage.getItem("copter-score")){ localStorage.setItem("copter-score",0); }
document.getElementById("tag-line").innerHTML = "High Score: "+localStorage.getItem("copter-score");

Copter = {
	Canvas		:	document.getElementById("game"),
	CopterImg	:	document.getElementById("copter-img"),
	GameStarted	:	false,
	Score		:	0,
	HighScore	:	localStorage.getItem("copter-score"),
	HighScoreAnnounced:	false,
	Difficulty	:	268-40,	// pixels
	dDifficulty	:	1,	// pixels/s
	Walls		:	20,
	Blocks		:	2,
	Interval	:	"",
	UpdateTime	:	new Date().getTime(),
	Heli		:	{
		w	:	40,
		h	:	40*547/939,
		rot	:	0,	// radians
		x	:	100,	// pixels
		y	:	268/2,	// pixels
		vy	:	0,	// pixels/s
		ayU	:	600,	// pixels/s^2
		ayD	:	300,	// pixels/s^2
		vyc	:	200	// const. (|vy| limit)
	},
	Start		:	function(){
		//if(this.GameStarted){ this.Resume(); return; }
		this.UpdateTime = new Date().getTime();
		var w = this.Canvas.width+32;
		var Walls = [], Blocks = [];
		for(var i = 0; i < this.Walls; i++){
			Walls.push(new this.Wall(this, w*(i/this.Walls) + 16));
		}
		for(var i = 0; i < this.Blocks; i++){
			Blocks[i] = new this.Block(this, w*(i/this.Blocks) + 16);
		}
		this.Walls = Walls; this.Blocks = Blocks;
		this.Update(this);
	},
	Resume		:	function(){
		this.UpdateTime = new Date().getTime();
		this.Interval = setInterval(this.Update,1,this);
	},
	Pause		:	function(){
		clearInterval(this.Interval);
		document.getElementById("tag-line").innerHTML = "PAUSED<br/><br/>Score: "+Math.floor(this.Score)+"<br/>High Score: "+this.HighScore;
		iphone.lock();
	},
	Announce	:	function(s){
		document.getElementById("announce").innerHTML = s;
		document.getElementById("announce").style["-webkit-animation"] = "Fade 1s ease-in-out";
		setTimeout(function(){
            document.getElementById("announce").style["-webkit-animation"] = "";
            document.getElementById("announce").innerHTML = "";
        },990);
	},
	Wall		:	function(c, x){
		this.x = x;
		this.Width = 20;
		this.Color = "rgb(0,255,0)";
		this.Speed = 60; // pixels/s
		this.GapWidth = c.Difficulty;
		this.Gap = Math.random()*(c.Canvas.height-10-this.GapWidth)+5;
		
		this.Draw = function(Canvas){
			var Context = Canvas.getContext("2d");
			Context.fillStyle = this.Color;
			Context.fillRect(this.x, 0, this.Width, this.Gap);
			Context.fillRect(this.x, this.Gap+this.GapWidth, this.Width, Canvas.height);
		}
	},
	Block		:	function(c, x){
		this.Width = 15;
		this.Height = 50;
		this.x = x;
		this.y = Math.random()*(c.Canvas.height-10-this.Height)+5;
		this.Color = "rgb(0,255,0)";
		this.Speed = 60; // pixels/s
		
		this.Draw = function(Canvas){
			var Context = Canvas.getContext("2d");
			Context.fillStyle = this.Color;
			Context.fillRect(this.x, this.y, this.Width, this.Height);
		}
	},
	Update		:	function(c){
		var Time = new Date().getTime();
		if(Time - c.UpdateTime > 100){ c.UpdateTime = Time-10; }
		var dt = (Time - c.UpdateTime)/1000;
		
		// Update heli velocity
		var vy = c.Heli.vy;
		if(document.getElementById("game")['data-down']){
			c.Heli.rot = -0.1;
			vy -= c.Heli.ayU*dt;
			c.Heli.vy = (vy < -c.Heli.vyc)?-c.Heli.vyc:vy;
		} else {
			c.Heli.rot = 0;
			if(vy != c.Heli.vyc){
				vy += c.Heli.ayD*dt;
				c.Heli.vy = (vy > c.Heli.vyc)?c.Heli.vyc:vy;
			}
		}
		
		// Update heli position
		c.Heli.y += c.Heli.vy*dt;	
		
		// Update walls
		for(var i = 0, l = c.Walls.length; i < l; i++){
			c.Walls[i].x -= c.Walls[i].Speed*dt;
			if(c.Walls[i].x <= -c.Walls[i].Width){
				c.Walls[i] = new c.Wall(c, c.Walls[(c.Walls.length + i - 1)%c.Walls.length].x + (c.Canvas.width+2*c.Walls[i].Width)/c.Walls.length)
			}
		}
		
		// Update blocks
		for(var i = 0, l = c.Blocks.length; i < l; i++){
			c.Blocks[i].x -= c.Blocks[i].Speed*dt;
			if(c.Blocks[i].x <= -c.Blocks[i].Width){
				c.Blocks[i] = new c.Block(c, c.Blocks[(c.Blocks.length + i - 1)%c.Blocks.length].x + (c.Canvas.width+2*c.Blocks[i].Width)/c.Blocks.length)
			}
		}
		
		// Update difficulty
		c.Difficulty -= c.dDifficulty*dt;
		
		// Draw walls + heli
		var Context = c.Canvas.getContext("2d");
		Context.clearRect(0, 0, c.Canvas.width, c.Canvas.height);
		for(var i = 0, l = c.Walls.length; i < l; i++){
			c.Walls[i].Draw(c.Canvas);
		}
		for(var i = 0, l = c.Blocks.length; i < l; i++){
			c.Blocks[i].Draw(c.Canvas);
		}
		Context.save();
		Context.translate( c.Heli.x, c.Heli.y );
		Context.rotate(c.Heli.rot);
		Context.translate( -c.Heli.w/2, -c.Heli.h/2 );
		Context.drawImage(c.CopterImg, 0, 0, c.Heli.w, c.Heli.h);
		Context.restore();
		
		// Update score
		c.Score += 10*dt;
		if(Math.floor(c.Score) > c.HighScore){
			c.HighScore = Math.floor(c.Score);
			if(!c.HighScoreAnnounced){
				c.Announce("HiScore!");
				c.HighScoreAnnounced = true;
			}
		}
		//document.getElementById("scoreboard").innerHTML = Math.round(100/dt)/100; //fps
		if(Math.floor(c.Score) != document.getElementById("scoreboard").innerHTML){ document.getElementById("scoreboard").innerHTML = Math.floor(c.Score); }
		
		// Check collisions
		var x0 = c.Heli.x, y0 = c.Heli.y;
		var rx = c.Heli.w/2;
		var ry = c.Heli.h/2;
		var WallHit = false, BlockHit = false;
		for(var i = 0, l = c.Walls.length; i < l; i++){
			var Wall = c.Walls[i];
			//Check if relevant wall
			if(x0 + rx > Wall.x && x0 - rx < Wall.x + Wall.Width){
				WallHit = !(y0 - ry > Wall.Gap && y0 + ry < Wall.Gap+Wall.GapWidth);
				if(WallHit){ break; }
			}
		}
		for(var i = 0, l = c.Blocks.length; i < l; i++){
			var Block = c.Blocks[i];
			//Check if relevant block
			if(x0 + rx > Block.x && x0 - rx < Block.x + Block.Width){
				BlockHit = (y0 + ry > Block.y && y0 - ry < Block.y + Block.Height);
				if(BlockHit){ break; }
			}
		}
		if(y0 + ry >= c.Canvas.height || y0 - ry <= 0 || WallHit || BlockHit){
			// Game Over
			Context.strokeStyle = "rgb(200,0,0)";
			Context.lineWidth = 2;
			Context.beginPath();
			Context.arc(c.Heli.x, c.Heli.y, c.Heli.w*0.6, 0, Math.PI*2, true); 
			Context.closePath();
			Context.stroke();
			clearInterval(c.Interval);	// Stop game
			document.getElementById("explosion-img").style.display = "";
			document.getElementById("explosion-img").style.top = (c.Heli.y-c.Heli.h/2-30)+"px";
			document.getElementById("explosion-img").style.left = (c.Heli.x-c.Heli.w/2-30)+"px";
			document.getElementById("explosion-img").src = "UIImages/Explosion.gif";
			setTimeout(c.GameOver, 1000, c);
			return;
		}
		c.UpdateTime = Time;
	},
	GameOver	:	function(c){
		StartCopter();	// Clear out game and restart in background
		document.getElementById("explosion-img").style.display = "none";
		document.getElementById("explosion-img").src = "";
		if(c.HighScore > localStorage.getItem("copter-score")){
			localStorage.setItem("copter-score", c.HighScore);
			document.getElementById("tag-line").innerHTML = "WELL DONE!<br/><br/>New High Score:<br/>"+c.HighScore;
		} else {
			document.getElementById("tag-line").innerHTML = "GAME OVER!<br/><br/>Score: "+Math.floor(c.Score)+"<br/>High Score: "+c.HighScore;
		}
		iphone.lock();	// Return to splash
	}
}
}