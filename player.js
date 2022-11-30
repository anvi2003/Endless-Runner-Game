import {Sitting,Running,Jumping,Falling,Rolling,Diving,Hit} from './playerstates.js';
import { CollisionAnimation } from './collisionAnimation.js';
export  class Player{  // It's job will be to draw and update our superdog character
    constructor(game){
        this.game=game;
        this.width=100;
        this.height=91.3;

        this.x=0;
        this.y=this.game.height-this.height-this.game.groundMargin; //position of player
        this.vy=0;
        this.weight=1;
        this.image=document.getElementById('player');
        this.frameX=0; //it'll cycle from left to right animating the player
        this.frameY=0;  //it'll travel in the spritesheet vertically //changing the frame will jump by the width and height of a single frame
        this.maxFrame;
        this.fps=20; //animated at 20 frames per sec

        this.frameInterval=1000/this.fps; // we have value of timeStamp=16 miilisec which is 1000 frames per sec
        this.frameTimer=0;
        this.speed=0; 
        this.maxSpeed=10; //px per frame
        this.states=[new Sitting(this.game),new Running(this.game),new Jumping(this.game), new Falling(this.game),new Rolling(this.game),new Diving(this.game), new Hit(this.game)];//it's an array of values //this references the entire player class // it's indexes havt to match with states in playerstates
        //this.currentState=this.states[0]; //it'll point to indees in the array // a player can only be in one state at a time
        //this.currentState.enter(); 
        


    }

    update(input,deltaTime){ //it'll cycle through the sprite frames //input refers to the keys array in input handler class
        this.checkCollision();
        this.currentState.handleInput(input);
        //horizontal movement
        this.x+=this.speed;
    
        if(input.includes('ArrowRight') && this.currentState!==this.states[6]) this.speed=this.maxSpeed;
        else if(input.includes('ArrowLeft') && this.currentState!==this.states[6])this.speed=-this.maxSpeed;
        else this.speed=0;
        //horizontal boundaries
        if(this.x<0) this.x=0;
        if(this.x>this.game.width-this.width) this.x=this.game.width-this.width;

        //vertical movement
        
        
        this.y+=this.vy;
        if(!this.onGround()) this.vy+=this.weight;
        else this.vy=0;
        //vertical boundaries

        if(this.y>this.game.height-this.height-this.game.groundMargin)this.y=this.game.height-this.height-this.game.groundMargin;

        //sprite animation
        if(this.frameTimer>this.frameInterval){
            this.frameTimer=0;
            if(this.frameX<this.maxFrame) this.frameX++;
            else this.frameX=0;
    
        }else{
            this.frameTimer+=deltaTime;
        }
        


    }
    draw(context){ //it'll draw currently active frame at the current cordinates 
        if(this.game.debug) context.strokeRect(this.x,this.y,this.width,this.height);
        
        context.drawImage(this.image,this.frameX*this.width,this.frameY*this.height,this.width,this.height,this.x,this.y,this.width,this.height);


    }
    onGround(){
        return this.y>=this.game.height-this.height-this.game.groundMargin;
    }
    setState(state,speed){
        this.currentState=this.states[state];
        this.game.speed=this.game.maxSpeed*speed;
        this.currentState.enter();

    }
    checkCollision(){
        this.game.enemies.forEach(enemy=>{
            if(
                enemy.x<this.x+this.width &&
                enemy.x+enemy.width> this.x &&
                enemy.y<this.y+this.height &&
                enemy.y+enemy.height>this.y
            ){
                enemy.markedForDeletion=true;
                this.game.collisions.push(new CollisionAnimation(this.game,enemy.x+enemy.width*0.5,enemy.y+enemy.height*0.5));
                if(this.currentState===this.states[4] || this.currentState===this.states[5]){
                    this.game.score++;
                }
                else{
                    this.setState(6,0);
                    this.game.score-=2; //penalty
                    this.game.lives--;
                    if(this.game.lives<=0) this.game.gameOver=true;
                    
                }
                
            }
        });
    }
}