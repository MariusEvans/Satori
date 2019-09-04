var canvas = document.getElementById("aCanvas");
var context = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var Satori = new Satori();

//---------- CONSTANTS
//DEBUGGING
const FPS = 60;
const BLINK_TIME = 3; //blink every x seconds
const BACKGROUND_SPEED = 3; //speed of background in pixels per second
const DEBUG_MODE = true; //when debug mode enabled - now you can press / to turn debug mode on or off
const INVINCIBLE = false; //loses no lives on ship collisions if true

//SHIP
const MAX_LIVES = 3;
const SHIP_SPEED = 7; //ship speed in pixels per second
const INVINCIBLE_TIME = 4; //time invincible for when respawning

//SHOTS
const SHOT_SPEED = 30; //shot speed in pixels per second
const MAX_SHOTS = 10;

//ENEMIES
MAX_ENEMIES = 5; //max starting enemies
ENEMY_SPEED = 8; //enemy speed in pixels per second

//TEXT

//---------- GAME VARS
var pause, time, livesP1, livesP2, scoreP1, scoreP2, twoPlayer;
var leftKeyP1, rightKeyP1, upKeyP1, downKeyP1, shootKeyP1;
var leftKeyP2, rightKeyP2, upKeyP2, downKeyP2, shootKeyP2;

var showWorkings = -1; // just for testing, pressing forward slash during game shows various background data

//sound effects

//music

//---------- ASSETS
//backgrounds
var starfield = newBackground('../assets/backgrounds/space.jpg');
//ships
const TOTAL_SHIPS = 2; //total number of ship assets
var supernova = newShip('../assets/spaceships/supernova/supernova.png',128,128);
var phoenix = newShip('../assets/spaceships/phoenix/phoenix.png',128,128);
phoenix.y=canvas.width/4; //change y of player 2 so not overlapping with player 1
var total = ["supernova","phoenix"];
//lasers
var singleP1 = newLaser('../assets/lasers/single.png',5,5);
var singleP2 = newLaser('../assets/lasers/single.png',5,5);
//exhausts
var supernova_exhaust = newExhaust("../assets/spaceships/supernova/Exhaust/Normal_flight/Exhaust1/exhaust4.png");
var phoneix_exhaust = newExhaust("../assets/spaceships/phoenix/Exhaust/Normal_flight/Exhaust1/exhaust4.png")
//enemies
var enemy_1 = newEnemy("../assets/enemies/enemy-1.png",300,300);
//sounds
var fxShot = new Sound("../assets/sounds/laser.m4a",5,1);
var fxExplode = new Sound("../assets/sounds/explode.m4a");
var fxHit = new Sound("../assets/sounds/hit.m4a",5);
var fxThrust = new Sound("../assets/sounds/thrust.m4a",1,0.5);
var fxThrustP2 = new Sound("../assets/sounds/thrust.m4a",1,0.5);

//count time to clear level + blinking for PRESS ENTER
window.setInterval(function()
{
    time++;
}, 1000);

window.onload = function() 
{
    newGame();
    setInterval(animate,1000/FPS); //create game loop
};
function newGame()
{
    time = 0;
    pause = false;
    twoPlayer = false;
    livesP1 = MAX_LIVES, livesP2 = 0; //make livesP2 = 0 until two player mode activated
    leftKeyP1 = false, rightKeyP1 = false, upKeyP1 = false, downKeyP1 = false, shootKeyP1 = false;
    leftKeyP2 = false, rightKeyP2 = false, upKeyP2 = false, downKeyP2 = false, shootKeyP2 = false;
    scoreP1 = 0, scoreP2 = 0;

    //make all new enemies
    for (var i = 0; i < MAX_ENEMIES; i++) 
    {
        enemy_1.x = canvas.width+Math.floor(Math.random()*40);
        enemy_1.enemies.push([enemy_1.x + (i * 150), Math.floor(Math.random()*(canvas.height-30)), enemy_1.width, enemy_1.height, ENEMY_SPEED]);
    }
}
function newLevel()
{
    //if level 1
    //if level 2
    //if level 3
}

function Sound(src, maxStreams = 1, vol = 1.0)
{
    this.streamNo = 0;
    this.streams = [];
    for(var i = 0; i<maxStreams; i++)
    {
        this.streams.push(new Audio(src));
        this.streams[i].volume = vol;
    }
    this.play = function()
    {
        this.streamNo = (this.streamNo+1) % maxStreams;
        this.streams[this.streamNo].play();
    }
    this.stop = function()
    {
        this.streams[this.streamNo].pause();
        this.streams[this.streamNo].currentTime = 0;
    }
}

function newShip(url1, width1, height1)
{
    return{
        //width+height in pxls?
        url: url1,
        width: width1,
        height: height1,
        x: canvas.width/8,
        y: canvas.height/4,
        thrust:
        {
            x:0,
            y:0
        }
    }
}
function newBackground(url1)
{
    return{
        url: url1,
        x: 0,
        y: 0,
        x2: canvas.width,
    }
}
function newLaser(url1,width1,height1)
{
    return{
        url: url1,
        x: 0,
        y: 0,
        width: width1,
        height: height1,
        lasers: []
    }
}
function newExhaust(url1)
{
    return{
        url: url1,
        x: 0,
        y: 0,
    }
}
function newEnemy(url1,width1,height1)
{
    return{
        url: url1,
        x: 0,
        y: 0,
        width: width1,
        height: height1,
        enemies: []
    }
}

function Satori()
{
    this.draw = function() //DRAW AND MOVE
    {
        canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);

        drawBackground(); //draw background - regardless of if lost game or not
        var gameOver = checkGameOver();
        
        if(!gameOver)
        {
            hitTestPlayer1(); //hit test with enemies for P1
            hitTestPlayer2(); //hit test with enemies for P2
            shipCollisionPlayer1(); //ship collision for P1
            shipCollisionPlayer2(); //ship collision for P2
            drawLaserPlayer1(); //draw and move laser for P1
            drawLaserPlayer2(); //draw and move laser for P2
            drawEnemies(); //draw and move enemies
            drawPlayer1(); //draw and move ship for P1
            drawPlayer2(); //draw and move ship for P2
            drawLives(); //draw lives, 1UP, Score, PRESS ENTER
        }
        else
        {
            //drawGameOver(); //draw the game over screen
        }
    }
    this.update = function() //EVENT LISTENERS
    {
        document.onkeydown = function(event) 
        {
            event = event || window.event;
            if(event.keyCode) 
            {
                //----------- PLAYER 1
                if(event.keyCode==38) //up
                {
                    console.log("Move up P1");
                    upKeyP1 = true;
                }
                else if(event.keyCode==40) //down
                {
                    console.log("Move down P1");
                    downKeyP1 = true;
                }
                else if (event.keyCode == '37') //left
                {
                    console.log("Move left P1");
                    leftKeyP1 = true;
                }
                else if (event.keyCode == '39') //right
                {
                    console.log("Move right P1");
                    rightKeyP1 = true;
                }
                else if(event.keyCode == '32' && singleP1.lasers.length<=MAX_SHOTS) //shoot
                {
                    console.log("Shoot P1");
                    fxShot.play();
                    singleP1.lasers.push([supernova.x + supernova.width - 45, supernova.y + (supernova.height/2)-2, singleP1.width, singleP1.height]);
                    shootKeyP1 = true;
                }
                //----------- PLAYER 2
                if(event.keyCode==87) //up
                {
                    console.log("Move up P2");
                    upKeyP2 = true;
                }
                else if(event.keyCode==83) //down 
                {
                    console.log("Move down P2");
                    downKeyP2 = true;
                }
                else if (event.keyCode==65) //left
                {
                    console.log("Move left P2");
                    leftKeyP2 = true;
                }
                else if (event.keyCode==68) //right
                {
                    console.log("Move right P2");
                    rightKeyP2 = true;
                }
                else if(event.keyCode == '16' && singleP2.lasers.length<=MAX_SHOTS) //shoot
                {
                    console.log("Shoot P2");
                    fxShot.play();
                    singleP2.lasers.push([phoenix.x + phoenix.width - 35, phoenix.y + (phoenix.height/2)+1, singleP2.width, singleP2.height]);
                    shootKeyP2 = true;
                }

                //OVERALL CONTROLS
                else if(event.keyCode == 80) //pause game
                {
                    if(pause==false)
                    {
                        pause=true;
                        //pauseText(0); //show text that game is paused
                    } else{
                        pause=false;
                    }
                }
                else if(event.keyCode == 13) //ENTER - new player
                {
                    if(twoPlayer==false)
                    {
                        console.log("New player.");
                        twoPlayer=true;
                        livesP2 = MAX_LIVES;
                    }
                }
                if(event.keyCode == 191) // FORWARD SLASH to show debug data
                {
                    if(DEBUG_MODE)
                    {
                        showWorkings *= -1;
                    }
                }
            }
        };
        document.onkeyup = function(event)
        {
            //----------- PLAYER 1
            if(event.keyCode==38 || event.keyCode==87) //up
            {
                console.log("Stop up");
                upKeyP1 = false;
            }
            else if(event.keyCode==40 || event.keyCode==83) //down
            {
                console.log("Stop down");
                downKeyP1 = false;
            }
            else if (event.keyCode == '37' || event.keyCode==65) //left
            {
                console.log("Stop left");
                leftKeyP1 = false;
            }
            else if (event.keyCode == '39' || event.keyCode==68) //right
            {
                console.log("Stop right");
                rightKeyP1 = false;
            }
            else if (event.keyCode == '32') //shooting
            {
                console.log("Stop shooting");
            }
            //----------- PLAYER 2
            if(event.keyCode==87) //up
            {
                console.log("Stop up P2");
                upKeyP2 = false;
            }
            else if(event.keyCode==83) //down
            {
                console.log("Stop down P2");
                downKeyP2 = false;
            }
            else if (event.keyCode==65) //left
            {
                console.log("Stop left P2");
                leftKeyP2 = false;
            }
            else if (event.keyCode==68) //right
            {
                console.log("Stop right P2");
                rightKeyP2 = false;
            }
            else if (event.keyCode == '16') //shooting
            {
                console.log("Stop shooting P2");
            }
        }
        this.draw();
    }
}
function drawBackground() {
    var starfieldImg = new Image();
    starfieldImg.src = starfield.url;

    context.drawImage(starfieldImg,starfield.x,starfield.y,canvas.width,canvas.height);
    context.drawImage(starfieldImg,starfield.x + canvas.width,starfield.y,canvas.width,canvas.height);
    
    if (showWorkings == 1) {
        context.fillStyle = "lightgreen";
        context.fillRect(starfield.x + canvas.width, 0, 2, 704);
    }

    if(starfield.x <= (canvas.width * -1)) {
        starfield.x += canvas.width;
        //console.log("reset x");
    }

    starfield.x -= BACKGROUND_SPEED;
}

function drawPlayer1(){
    var supernovaImg = new Image();
    supernovaImg.src = supernova.url;

    var phoenixImg = new Image();
    phoenix.src = phoenix.url;

    //move ship
    if (rightKeyP1){ //draw exhaust when moving forward
        fxThrust.play();
        var supernovaExhaustImg = new Image();
        supernovaExhaustImg.src = supernova_exhaust.url;
        context.drawImage(supernovaExhaustImg,supernova.x+supernova.width/2 -55,supernova.y+supernova.height/2 -15);
        supernova.x += SHIP_SPEED;
    }
    else if (leftKeyP1){supernova.x -= SHIP_SPEED;}
    if (upKeyP1){supernova.y -= SHIP_SPEED;}
    else if (downKeyP1){supernova.y += SHIP_SPEED;}
    
    if (rightKeyP1==false){fxThrust.stop();}
    //handle edge of screen
    if (supernova.x <= 0){supernova.x = 0;}
    if ((supernova.x + supernova.width) >= canvas.width){supernova.x = canvas.width - supernova.width;}
    if (supernova.y <= 0){supernova.y = 0;}
    if ((supernova.y + supernova.height) >= canvas.height){supernova.y = canvas.height - supernova.height;}
    
    context.drawImage(supernovaImg,supernova.x,supernova.y);
}
function drawPlayer2(){
    if(twoPlayer)
    {
        var phoenixImg = new Image();
        phoenixImg.src = phoenix.url;

        //move ship
        if (rightKeyP2){ //draw exhaust when moving forward
            fxThrustP2.play();
            var phoenixExhaustImg = new Image();
            phoenixExhaustImg.src = phoneix_exhaust.url;
            context.drawImage(phoenixExhaustImg,phoenix.x+phoenix.width/2 -65,phoenix.y+phoenix.height/2 -15);
            phoenix.x += SHIP_SPEED;
        }
        else if (leftKeyP2){phoenix.x -= SHIP_SPEED;}
        if (upKeyP2){phoenix.y -= SHIP_SPEED;}
        else if (downKeyP2){phoenix.y += SHIP_SPEED;}
        
        if (rightKeyP2==false){fxThrustP2.stop();}
        //handle edge of screen
        if (phoenix.x <= 0){phoenix.x = 0;}
        if ((phoenix.x + phoenix.width) >= canvas.width){phoenix.x = canvas.width - phoenix.width;}
        if (phoenix.y <= 0){phoenix.y = 0;}
        if ((phoenix.y + phoenix.height) >= canvas.height){phoenix.y = canvas.height - phoenix.height;}
        
        context.drawImage(phoenixImg,phoenix.x,phoenix.y);
    }
}
function drawLaserPlayer1(){
    // var singleP1Img = new Image();
    // singleP1Img.src = singleP1.url;
    //context.drawImage(singleP1Img,singleP1.x,singleP1.y);

    //move laser
    if(singleP1.lasers.length>0)
    {
        for (var i = 0; i < singleP1.lasers.length; i++) 
        {
            if(singleP1.lasers[i][0] > 0) {
                singleP1.lasers[i][0] += SHOT_SPEED;
            } 
            if(singleP1.lasers[i][0] > canvas.width) { //remove laser when hits edge of screen
                singleP1.lasers.splice(i,1);
                i--;
            }
        }

    }

    //draw laser
    if(singleP1.lasers.length>0)
    {
        for (var i = 0; i < singleP1.lasers.length; i++) {
            context.fillStyle = 'red';
            context.fillRect(singleP1.lasers[i][0],singleP1.lasers[i][1],singleP1.lasers[i][2],singleP1.lasers[i][3]);
        }
    } 
}
function drawLaserPlayer2(){
    if(twoPlayer)
    {
        // var singleP1Img = new Image();
        // singleP1Img.src = singleP1.url;
        //context.drawImage(singleP1Img,singleP1.x,singleP1.y);

        //move laser
        if(singleP2.lasers.length>0)
        {
            for (var i = 0; i < singleP2.lasers.length; i++) 
            {
                if(singleP2.lasers[i][0] > 0) {
                    singleP2.lasers[i][0] += SHOT_SPEED;
                } 
                if(singleP2.lasers[i][0] > canvas.width) { //remove laser when hits edge of screen
                    singleP2.lasers.splice(i,1);
                    i--;
                }
            }
        }

        //draw laser
        if(singleP2.lasers.length>0)
        {
            for (var i = 0; i < singleP2.lasers.length; i++) {
                context.fillStyle = 'red';
                context.fillRect(singleP2.lasers[i][0],singleP2.lasers[i][1],singleP2.lasers[i][2],singleP2.lasers[i][3]);
            }
        } 
    }
}
function drawLives()
{
    var shipImg = new Image();
    
    //1UP
    context.font = "25px Courier New";
    context.fillStyle = "white";
    context.fillText("1UP",16,25);
    //SCORE
    context.font = "25px Courier New";
    context.fillStyle = "white";
    context.fillText(scoreP1,100,25);
    //PRESS ENTER
    if(time%BLINK_TIME==0 && !twoPlayer) //BLINKING
    {
        context.font = "25px Courier New";
        context.fillStyle = "white";
        context.fillText("PRESS ENTER",canvas.width-190,25);
    }
    //LIVES
    shipImg.src = supernova.url;
    for(var i = 0; i<livesP1; i++)
    {
        context.drawImage(shipImg,20*(i*2),10,supernova.width/2,supernova.height/2);
    }

    //PLAYER 2
    if(twoPlayer)
    {
        shipImg.src = phoenix.url;
        //2UP
        context.font = "25px Courier New";
        context.fillStyle = "white";
        context.fillText("2UP",canvas.width-65,25);
        //SCORE
        context.font = "25px Courier New";
        context.fillStyle = "white";
        context.fillText(scoreP2,canvas.width-125,25);
        
        //LIVES
        for(var i = 0; i<livesP2; i++)
        {
            context.drawImage(shipImg,20*(i*2.5) + (canvas.width-180),10,phoenix.width/2,phoenix.height/2);
        }
    }
}
function drawEnemies()
{
    var enemy_1Img = new Image();
    enemy_1Img.src = enemy_1.url;

    //move enemy
    if(enemy_1.enemies.length>0)
    {
        for (var i = 0; i < enemy_1.enemies.length; i++) 
        {
            if(enemy_1.enemies[i][0] > (enemy_1.enemies[i][2]/5) * -1) {
                enemy_1.enemies[i][0] -= ENEMY_SPEED;
            } else { //remove enemy when hits edge of screen
                enemy_1.enemies[i][0] = canvas.width+Math.floor(Math.random()*40);
                enemy_1.enemies[i][1] = Math.floor(Math.random()*(canvas.height-30));
                //enemy_1.enemies.splice(i,1);
            }
        }
    }

    //draw enemy
    if(enemy_1.enemies.length>0)
    {
        for (var i = 0; i < enemy_1.enemies.length; i++) {
            context.drawImage(enemy_1Img,enemy_1.enemies[i][0],enemy_1.enemies[i][1],enemy_1.enemies[i][2]/5,enemy_1.enemies[i][3]/5);
            
            if (showWorkings == 1) {
                context.fillStyle = "lightgreen";
                
                context.beginPath();
                context.arc(enemy_1.enemies[i][0] + enemy_1.enemies[i][2]/10,
                            enemy_1.enemies[i][1] + enemy_1.enemies[i][3]/10,
                            enemy_1.enemies[i][2]/10, 0, 2*Math.PI);
                context.fill();
            }
            
        }
    } 
}
function hitTestPlayer1()
{
    for (var i = 0; i < singleP1.lasers.length; i++) 
    {
        for (var j = 0; j < enemy_1.enemies.length; j++) 
        {                
            if (circlesCollide(singleP1.lasers[i][0] + 2.5, singleP1.lasers[i][1] + 2.5, 5,
                enemy_1.enemies[j][0] + ((enemy_1.enemies[j][2] / 5) / 2),
                enemy_1.enemies[j][1] + ((enemy_1.enemies[j][3] / 5) / 2),
                (enemy_1.enemies[j][2] / 5) / 2) == true) {
                
                scoreP1 += 70;
                fxHit.play();
                enemy_1.enemies.splice(j, 1);
                singleP1.lasers.splice(i, 1);
                i--;
            }
        }

    }
}
function hitTestPlayer2()
{
    if(twoPlayer)
    {
        for (var i = 0; i < singleP2.lasers.length; i++) 
        {
            for (var j = 0; j < enemy_1.enemies.length; j++) 
            {
                if (circlesCollide(singleP2.lasers[i][0] + 2.5, singleP2.lasers[i][1] + 2.5, 5,
                    enemy_1.enemies[j][0] + ((enemy_1.enemies[j][2] / 5) / 2),
                    enemy_1.enemies[j][1] + ((enemy_1.enemies[j][3] / 5) / 2),
                    (enemy_1.enemies[j][2] / 5) / 2) == true) {
                    
                    scoreP2 += 70;
                    fxHit.play();
                    enemy_1.enemies.splice(j, 1);
                    singleP2.lasers.splice(i, 1);
                    i--;
                }
            }
    
        }
    }
}
function shipCollisionPlayer1()
{
    if(!INVINCIBLE)
    {
        for (var j = 0; j < enemy_1.enemies.length; j++) 
        {
            if (showWorkings == 1) {
                context.fillStyle = "lightgreen";
                context.beginPath();
                context.arc(supernova.x + (supernova.width / 2),
                supernova.y + (supernova.height / 2), supernova.width / 4, 0, 2*Math.PI);
                context.fill();
            }
            
            if (circlesCollide(supernova.x + (supernova.width / 2),
                supernova.y + (supernova.height / 2), supernova.width / 4,
                enemy_1.enemies[j][0] + ((enemy_1.enemies[j][2] / 5) / 2),
                enemy_1.enemies[j][1] + ((enemy_1.enemies[j][3] / 5) / 2),
                (enemy_1.enemies[j][2] / 5) / 2) == true) {
                
                livesP1--;
                supernova = newShip('../assets/spaceships/supernova/supernova.png',128,128);
                fxExplode.play();
                enemy_1.enemies.splice(j, 1);
                j--;
            }
        }
    }    
}
function shipCollisionPlayer2()
{
    if(twoPlayer && !INVINCIBLE)
    {
        for (var j = 0; j < enemy_1.enemies.length; j++) 
        {
            if (showWorkings == 1) {
                context.fillStyle = "lightgreen";
                context.beginPath();
                context.arc(phoenix.x + (phoenix.width / 2),
                phoenix.y + (phoenix.height / 2), phoenix.width / 4, 0, 2*Math.PI);
                context.fill();
            }
                
            if (circlesCollide(phoenix.x + (phoenix.width / 2),
                phoenix.y + (phoenix.height / 2), phoenix.width / 4,
                enemy_1.enemies[j][0] + ((enemy_1.enemies[j][2] / 5) / 2),
                enemy_1.enemies[j][1] + ((enemy_1.enemies[j][3] / 5) / 2),
                (enemy_1.enemies[j][2] / 5) / 2) == true) {
                
                livesP2--;
                phoenix = newShip('../assets/spaceships/phoenix/phoenix.png',128,128);
                phoenix.y=canvas.width/4; //change y of player 2 so not overlapping with player 1
                fxExplode.play();
                enemy_1.enemies.splice(j, 1);
                j--;
            }
        }
    }
}
function checkGameOver()
{
    var gameOver;
    if(twoPlayer)
    {
        if(livesP1>0 && livesP2>0)
        {
            gameOver = false;
        }
        else{
            gameOver = true;
        }
    } else{
        if(livesP1>0)
        {
            gameOver = false;
        }
        else{
            gameOver = true;
        }
    }
    return gameOver;
}

function circlesCollide(firstX, firstY, firstR, secondX, secondY, secondR) {
    if (Math.sqrt(Math.pow(firstX - secondX, 2) + Math.pow(firstY - secondY, 2)) < firstR + secondR) return true;
    return false;
}

function animate() 
{
    if(!pause)
    {
        Satori.update();
    }
    else
    {
        //PAUSED TEXT
        context.font = "50px Courier New";
        context.fillStyle = "white";
        context.fillText("PAUSED",canvas.width/2.25,canvas.height/2);

        context.font = "30px Courier New";
        context.fillText("PRESS P TO UNPAUSE",canvas.width/2.5 -5,canvas.height/2 + 40);
    }
}