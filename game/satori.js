var canvas = document.getElementById("aCanvas");
var context = canvas.getContext("2d");
//canvas.width = window.innerWidth;
//canvas.height = window.innerHeight;
canvas.width = 1280;
canvas.height = 720;

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
const SHIP_INVINCIBILITY_DUR = 2; //dur of ship invincibility when respawning
const SHIP_BLINK_DUR = 0.1; //dur of ship blinking during invincibility
const SHIP_EXPLODE_DUR = 0.8; //time it takes for ship to explode

//SHOTS
const SHOT_SPEED = 30; //shot speed in pixels per second
const MAX_SHOTS = 10;
const SHOT_REPEAT_SPEED = 20;

//ENEMIES
const MAX_ENEMIES = 6; //max starting enemies
const ENEMY_SPEED = 8; //enemy speed in pixels per second

//TEXT

//---------- GAME VARS
var pause, time, livesP1, livesP2, scoreP1, scoreP2, explodingP1, explodingP2, twoPlayer;
var leftKeyP1, rightKeyP1, upKeyP1, downKeyP1, shootingP1;
var leftKeyP2, rightKeyP2, upKeyP2, downKeyP2, shootingP2;

var showWorkings = -1; // just for testing, pressing forward slash during game shows various background data

var enemyExplosions = [];

//sound effects

//music

//---------- ASSETS
//backgrounds
var starfield = newBackground('../assets/gfx/background1.png');
//ships
const TOTAL_SHIPS = 2; //total number of ship assets
var supernova = newShip('../assets/gfx/player1.png',65,65);
var phoenix = newShip('../assets/gfx/player2.png',65,65);
phoenix.y=canvas.width/4; //change y of player 2 so not overlapping with player 1
var total = ["supernova","phoenix"];
//lasers
var singleP1 = newLaser('../assets/gfx/laser.png',16,16);
var singleP2 = newLaser('../assets/gfx/laser.png',16,16);
var singleEnemy = newLaser('../assets/gfx/laser.png',16,16);
//exhausts
var supernova_exhaust = newExhaust("../assets/gfx/thrust.png");
var phoneix_exhaust = newExhaust("../assets/gfx/thrust.png");
//enemies
var enemy_1 = newEnemy('../assets/gfx/enemy1.png',65,65);
//sounds
var fxShot = new Sound("../assets/sounds/laser.m4a",5,1);
var fxExplodeP1 = new Sound("../assets/sounds/explode.m4a");
var fxExplodeP2 = new Sound("../assets/sounds/explode.m4a");
var fxHit = new Sound("../assets/sounds/hit.m4a",5);
var fxThrust = new Sound("../assets/sounds/thrust.m4a",1,0.5);
var fxThrustP2 = new Sound("../assets/sounds/thrust.m4a",1,0.5);
//explosions
var explosionP1 = newExplosion("../assets/gfx/explosion.png");
var explosionP2 = newExplosion("../assets/gfx/explosion.png");
var explosionEnemy = newExplosion("../assets/gfx/explosion.png");

//images
var starfieldImg = new Image(); starfieldImg.src = starfield.url;
var supernovaImg = new Image(); supernovaImg.src = supernova.url;
var supernovaExhaustImg = new Image(); supernovaExhaustImg.src = supernova_exhaust.url;
var phoenixImg = new Image(); phoenixImg.src = phoenix.url;
var phoenixExhaustImg = new Image(); phoenixExhaustImg.src = phoneix_exhaust.url;
var shipImg = new Image(); //image for drawing the lives on top left/right
var enemy_1Img = new Image(); enemy_1Img.src = enemy_1.url;
var explosionP1Img = new Image(); explosionP1Img.src = explosionP1.url;
var explosionP2Img = new Image(); explosionP2Img.src = explosionP2.url;
var explosionEnemyImg = new Image(); explosionEnemyImg.src = explosionEnemy.url;
var laserImg = new Image(); laserImg.src = singleP1.url;

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
    leftKeyP1 = false, rightKeyP1 = false, upKeyP1 = false, downKeyP1 = false, shootingP1 = -1;
    leftKeyP2 = false, rightKeyP2 = false, upKeyP2 = false, downKeyP2 = false, shootingP2 = -1;
    scoreP1 = 0, scoreP2 = 0;
    explodingP1 = false, explodingP2 = false;
    
    while (enemyExplosions.length > 0) {
        enemyExplosions.pop();
    }

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
        blinkNo: Math.ceil(SHIP_INVINCIBILITY_DUR / SHIP_BLINK_DUR),
        blinkTime: Math.ceil(SHIP_BLINK_DUR*FPS),
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
function newExplosion(url1)
{
    return{
        url: url1,
        x: 0,
        y: 0,
        displayCountdown: 0
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
            createLasersPlayer1(); //create lasers if firing
            createLasersPlayer2(); //create lasers if firing
            hitTestPlayer1(); //laser hit test with enemies for P1
            hitTestPlayer2(); //laser hit test with enemies for P2
            shipCollisionPlayer1(); //ship collision for P1
            shipCollisionPlayer2(); //ship collision for P2
            drawLaserEnemy(); //draw and move lasers for enemies
            drawLaserPlayer1(); //draw and move laser for P1
            drawLaserPlayer2(); //draw and move laser for P2
            drawEnemies(); //draw and move enemies
            drawEnemyExplosions(); // draw the exploding enemies
            drawPlayer1(); //draw and move ship for P1
            drawPlayer2(); //draw and move ship for P2
            drawLives(); //draw lives, 1UP, Score, PRESS ENTER
            explodePlayer1(); //draw explosion for P1
            explodePlayer2(); //draw explosion for P2
            showDebug(); //display hitboxes etc
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
                else if(event.keyCode == '32' && shootingP1 == -1) //shoot
                {
                    shootingP1 = SHOT_REPEAT_SPEED - 1;
                    console.log("Shoot P1 key pressed");
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
                else if(event.keyCode == '16' && shootingP2 == -1) //shoot
                {
                    shootingP2 = SHOT_REPEAT_SPEED - 1;
                    console.log("Shoot P2 key pressed");
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
                        phoenix = newShip('../assets/gfx/player2.png', 65, 65);
                        phoenix.y=canvas.width/4; //change y of player 2 so not overlapping with player 1
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
                shootingP1 = -1;
                console.log("Shoot P1 key released");
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
                shootingP2 = -1;
                console.log("Shoot P2 key released");
            }
        }
        this.draw();
    }
}
function drawBackground() {
    context.drawImage(starfieldImg,starfield.x,starfield.y,canvas.width,canvas.height);
    context.drawImage(starfieldImg,starfield.x + canvas.width,starfield.y,canvas.width,canvas.height);

    if(starfield.x <= (canvas.width * -1)) {
        starfield.x += canvas.width;
        //console.log("reset x");
    }

    starfield.x -= BACKGROUND_SPEED;
}

function createLasersPlayer1() {
    if (shootingP1 == -1) return;
    shootingP1++;
    if (shootingP1 < SHOT_REPEAT_SPEED) return;
    shootingP1 = 0;
    
    if (singleP1.lasers.length<=MAX_SHOTS && explodingP1 == false && livesP1>0) {
        fxShot.play();
        singleP1.lasers.push([supernova.x + 16, supernova.y + 45, singleP1.width, singleP1.height]);
    }
}

function createLasersPlayer2() {
    if (shootingP2 == -1) return;
    shootingP2++;
    if (shootingP2 < SHOT_REPEAT_SPEED) return;
    shootingP2 = 0;
    
    if (singleP2.lasers.length<=MAX_SHOTS && explodingP2 == false && livesP2>0) {
        fxShot.play();
        singleP2.lasers.push([phoenix.x + 16, phoenix.y + 45, singleP2.width, singleP2.height]);
    }
}

function drawPlayer1(){
    var blinkOn = supernova.blinkNo % 2 == 0; //var to manage drawing/not drawing ship during invincibility
    
    if(livesP1>0 && explodingP1==false){
        //move ship
        if (rightKeyP1){ //draw exhaust when moving forward
            fxThrust.play();
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
        if ((supernova.y + supernova.height + 100) >= canvas.height){supernova.y = canvas.height - supernova.height - 100;}
        
        if (blinkOn) {
            if (rightKeyP1) {
                context.drawImage(supernovaExhaustImg, supernova.x - 50, supernova.y + 18 + (Math.random() * 5));
            }
            context.drawImage(supernovaImg,supernova.x,supernova.y);
        }
    }

    if(supernova.blinkNo>0)
    {
        //deincrement blink time
        supernova.blinkTime--;
        //deincrement blink No
        if(supernova.blinkTime==0)
        {
            supernova.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
            supernova.blinkNo--;
        }
    }
}
function drawPlayer2(){
    var blinkOn = phoenix.blinkNo % 2 == 0; //var to manage drawing/not drawing ship during invincibility

    if(twoPlayer && livesP2>0 && explodingP2==false)
    {
        //move ship
        if (rightKeyP2){ //draw exhaust when moving forward
            fxThrustP2.play();
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
        if ((phoenix.y + phoenix.height + 100) >= canvas.height){phoenix.y = canvas.height - phoenix.height - 100;}
        
        if (blinkOn) {
            if (rightKeyP2) {
                context.drawImage(phoenixExhaustImg, phoenix.x - 50, phoenix.y + 18 + (Math.random() * 5));
            }
            context.drawImage(phoenixImg,phoenix.x,phoenix.y);
        }
    }

    if(phoenix.blinkNo>0)
    {
        //deincrement blink time
        phoenix.blinkTime--;
        //deincrement blink No
        if(phoenix.blinkTime==0)
        {
            phoenix.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
            phoenix.blinkNo--;
        }
    }
}
function drawLaserPlayer1(){
    if(livesP1>0){
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
                context.drawImage(laserImg, singleP1.lasers[i][0], singleP1.lasers[i][1]);
            }
        } 
    }
}
function drawLaserPlayer2(){
    if(twoPlayer && livesP2>0)
    {
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
                context.drawImage(laserImg, singleP2.lasers[i][0], singleP2.lasers[i][1]);
            }
        } 
    }
}
function drawLaserEnemy(){
    //create lasers
    for(var i = 0; i<enemy_1.enemies.length; i++){
        if (Math.floor(Math.random() * 100) == 0 && enemy_1.enemies[i][0] < 1000) {
            singleEnemy.lasers.push([enemy_1.enemies[i][0] + 32, enemy_1.enemies[i][1] + 32, 16, 16]);
        }
    }

    //move laser
    if(singleEnemy.lasers.length>0)
    {
        for (var i = 0; i < singleEnemy.lasers.length; i++) 
        {
            if(singleEnemy.lasers[i][0] > 0) {
                singleEnemy.lasers[i][0] -= SHOT_SPEED;
            } 
            if(singleEnemy.lasers[i][0] <= 0) { //remove laser when hits edge of screen
                singleEnemy.lasers.splice(i,1);
                i--;
            }
        }
    }

    //draw laser
    if(singleEnemy.lasers.length>0)
    {
        for (var i = 0; i < singleEnemy.lasers.length; i++) {
            context.drawImage(laserImg, singleEnemy.lasers[i][0], singleEnemy.lasers[i][1]);
        }
    } 
}
function drawLives()
{   
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
        context.drawImage(shipImg, 20 + (40 * i), 40, supernova.width/2, supernova.height/2);
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
            context.drawImage(shipImg, (40 * i) + 1140,40,phoenix.width/2,phoenix.height/2);
        }
    }
}
function drawEnemies()
{
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
            context.drawImage(enemy_1Img,enemy_1.enemies[i][0],enemy_1.enemies[i][1]);
        }
    } 
}

function drawEnemyExplosions()
{
    for (var i = 0; i < enemyExplosions.length; i++) {
        enemyExplosions[i][2]--;
        if (enemyExplosions[i][2] <= 0) {
            enemyExplosions.splice(i, 1);
            i--;
            continue;
        }
        context.drawImage(explosionEnemyImg,
                          enemyExplosions[i][0] + ((Math.random() * 20) - 10),
                          enemyExplosions[i][1] + ((Math.random() * 20) - 10));
    }
}

function hitTestPlayer1()
{
    if(livesP1>0 && explodingP1==false){
        for (var i = 0; i < singleP1.lasers.length; i++) 
        {
            for (var j = 0; j < enemy_1.enemies.length; j++) 
            {                
                if (circlesCollide(singleP1.lasers[i][0] + 8, singleP1.lasers[i][1] + 8, 8,
                    enemy_1.enemies[j][0] + 32,
                    enemy_1.enemies[j][1] + 32,
                    32) == true) {
                    
                    enemyExplosions.push([enemy_1.enemies[j][0], enemy_1.enemies[j][1], (SHIP_EXPLODE_DUR * FPS) / 2]);
                    
                    scoreP1 += 70;
                    fxHit.play();
                    enemy_1.enemies.splice(j, 1);
                    singleP1.lasers.splice(i, 1);
                    i--;
                }
            }

        }
    }  
}
function hitTestPlayer2()
{
    if(twoPlayer && livesP2>0 && explodingP2==false)
    {
        for (var i = 0; i < singleP2.lasers.length; i++) 
        {
            for (var j = 0; j < enemy_1.enemies.length; j++) 
            {
                if (circlesCollide(singleP2.lasers[i][0] + 8, singleP2.lasers[i][1] + 8, 8,
                    enemy_1.enemies[j][0] + 32,
                    enemy_1.enemies[j][1] + 32,
                    32) == true) {
                    
                    enemyExplosions.push([enemy_1.enemies[j][0], enemy_1.enemies[j][1], (SHIP_EXPLODE_DUR * FPS) / 2]);
                    
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
    if(!INVINCIBLE && livesP1>0 && supernova.blinkNo==0 && explodingP1==false)
    {
        for (var j = 0; j < enemy_1.enemies.length; j++) 
        {   
            if (circlesCollide(supernova.x + 32, supernova.y + 32, 32,
                enemy_1.enemies[j][0] + 32,
                enemy_1.enemies[j][1] + 32,
                32) == true && explodingP1 == false) {

                fxExplodeP1.play();
                explodingP1 = true;
                explosionP1.x = supernova.x;
                explosionP1.y = supernova.y;
                explosionP1.displayCountdown = (SHIP_EXPLODE_DUR * FPS);

                livesP1--;
                enemy_1.enemies.splice(j, 1);
                j--;
            }
        }
        
        for (var i = 0; i < singleEnemy.lasers.length; i++) {
            if (circlesCollide(supernova.x + 32, supernova.y + 32, 32,
                singleEnemy.lasers[i][0] + 8, singleEnemy.lasers[i][1] + 8, 8) == true && explodingP1 == false) {
                fxExplodeP1.play();
                explodingP1 = true;
                explosionP1.x = supernova.x;
                explosionP1.y = supernova.y;
                explosionP1.displayCountdown = (SHIP_EXPLODE_DUR * FPS);
                livesP1--;
            }
        }
        
    }    
}
function shipCollisionPlayer2()
{
    if(twoPlayer && !INVINCIBLE && livesP2>0 && phoenix.blinkNo==0 && explodingP2==false)
    {
        for (var j = 0; j < enemy_1.enemies.length; j++) 
        {
            if (circlesCollide(phoenix.x + 32, phoenix.y + 32, 32,
                enemy_1.enemies[j][0] + 32,
                enemy_1.enemies[j][1] + 32,
                32) == true) {
                
                fxExplodeP2.play();
                explodingP2 = true;
                explosionP2.x = phoenix.x;
                explosionP2.y = phoenix.y;
                explosionP2.displayCountdown = (SHIP_EXPLODE_DUR * FPS);

                livesP2--;
                enemy_1.enemies.splice(j, 1);
                j--;
            }
        }
        
        for (var i = 0; i < singleEnemy.lasers.length; i++) {
            if (circlesCollide(phoenix.x + 32, phoenix.y + 32, 32,
                singleEnemy.lasers[i][0] + 8, singleEnemy.lasers[i][1] + 8, 8) == true && explodingP2 == false) {
                fxExplodeP2.play();
                explodingP2 = true;
                explosionP2.x = phoenix.x;
                explosionP2.y = phoenix.y;
                explosionP2.displayCountdown = (SHIP_EXPLODE_DUR * FPS);
                livesP2--;
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
        else if(livesP1<=0 && livesP2<=0){
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
function explodePlayer1()
{
    if (explodingP1 == false) return;
    explosionP1.displayCountdown--;
    
    context.drawImage(explosionP1Img,explosionP1.x + ((Math.random() * 30) - 15),explosionP1.y + ((Math.random() * 30) - 15));
    
    if (explosionP1.displayCountdown <= 0) {
        explodingP1 = false;
        supernova = newShip('../assets/gfx/player1.png', 65, 65);
    }
}
function explodePlayer2()
{
    if (explodingP2 == false) return;
    explosionP2.displayCountdown--;
    
    context.drawImage(explosionP2Img,explosionP2.x + ((Math.random() * 30) - 15),explosionP2.y + ((Math.random() * 30) - 15));
    
    if (explosionP2.displayCountdown <= 0) {
        explodingP2 = false;
        phoenix = newShip('../assets/gfx/player2.png', 65, 65);
    }
}

function circlesCollide(firstX, firstY, firstR, secondX, secondY, secondR) {
    if (Math.sqrt(Math.pow(firstX - secondX, 2) + Math.pow(firstY - secondY, 2)) < firstR + secondR) return true;
    return false;
}
function showDebug()
{
    if (showWorkings == -1) return;
    context.fillStyle = "white";
    context.fillRect(starfield.x + canvas.width, 0, 2, 720);
    
    context.strokeStyle = "magenta";
    context.lineWidth = 2;
    for (var i = 0; i < singleP1.lasers.length; i++)  {
        context.beginPath();
        context.arc(singleP1.lasers[i][0] + 8, singleP1.lasers[i][1] + 8, 8, 0, 2*Math.PI);
        context.stroke();
    }
    
    for (var i = 0; i < singleP2.lasers.length; i++)  {
        context.beginPath();
        context.arc(singleP2.lasers[i][0] + 8, singleP2.lasers[i][1] + 8, 8, 0, 2*Math.PI);
        context.stroke();
    }
    
    for (var i = 0; i < singleEnemy.lasers.length; i++) {
        context.beginPath();
        context.arc(singleEnemy.lasers[i][0] + 8, singleEnemy.lasers[i][1] + 8, 8, 0, 2*Math.PI);
        context.stroke();
    }
    
    context.strokeStyle = "cyan";
    for (var i = 0; i < enemy_1.enemies.length; i++)  {
        context.beginPath();
        context.arc(enemy_1.enemies[i][0] + 32, enemy_1.enemies[i][1] + 32, 32, 0, 2*Math.PI);
        context.stroke();
    }
    
    context.strokeStyle = "lightgreen";
    context.beginPath();
    context.arc(supernova.x + 32, supernova.y + 32, 32, 0, 2*Math.PI);
    context.stroke();
    
    context.strokeStyle = "yellow";
    context.beginPath();
    context.arc(phoenix.x + 32, phoenix.y + 32, 32, 0, 2*Math.PI);
    context.stroke();
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

        //context.font = "30px Courier New";
        //context.fillText("PRESS P TO UNPAUSE",canvas.width/2.5 -5,canvas.height/2 + 40);
    }
}