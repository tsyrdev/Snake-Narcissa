/*	Narcissa

Aluno 1: ?60196 ?José Soares <-- mandatory to fill
Aluno 2: ?63439 ?Tomás Marta <-- mandatory to fill

Comentario:

O ficheiro "Narcissa.js" tem de incluir, logo nas primeiras linhas,
um comentÃ¡rio inicial contendo: o nome e nÃºmero dos dois alunos que
realizaram o projeto; indicaÃ§Ã£o de quais as partes do trabalho que
foram feitas e das que nÃ£o foram feitas (para facilitar uma correÃ§Ã£o
sem enganos); ainda possivelmente alertando para alguns aspetos da
implementaÃ§Ã£o que possam ser menos Ã³bvios para o avaliador.

0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
*/

// TODO: change all comments, in between brackets should be the type of the parameters
// TODO: include preconditions for the methods for eatable actors and crashable actors

// GLOBAL CONSTANTS

const ANIMATION_EVENTS_PER_SECOND = 4;

const IMAGE_NAME_EMPTY = "empty";
const IMAGE_NAME_INVALID = "invalid";
const IMAGE_NAME_SHRUB = "shrub";
const IMAGE_NAME_SNAKE_HEAD = "snakeHead";
const IMAGE_NAME_SNAKE_BODY = "snakeBody";

// BERRY COLOURS
const IMAGE_NAME_BERRY_BLUE = "berryBlue";
const IMAGE_NAME_BERRY_BROWN = "berryBrown";
const IMAGE_NAME_BERRY_DARK_GREEN = "berryDarkGreen";
const IMAGE_NAME_BERRY_GREEN = "berryGreen"; 
const IMAGE_NAME_BERRY_PURPLE = "berryPurple"; 
const IMAGE_NAME_BERRY_RED = "berryRed";

const MOVE_X_RIGHT = 1;
const MOVE_X_LEFT = -1;
const MOVE_Y_UP = -1;
const MOVE_Y_DOWN = 1; 
const STAY_IN_AXIS = 0;

const IS_NOT_CRASHABLE = false;
const IS_CRASHABLE = true;
const IS_NOT_EATABLE = false;
const IS_EATABLE = true;
const NO_WORTH = 0;

// The next constants are increased by one so the actual number
// (the one in the left side of the operation) is included in 
// the result of the random function 
const MAX_SINK_TIME = 100 + 1;
const MAX_EXPAND_TIME = 100 + 1;
const MAX_BERRY_NUM = 5 + 1;
const MAX_BERRY_SPAWN = 11 + 1;

const MIN_SINK_TIME = 20;
const MIN_EXPAND_TIME = 20; 
const MIN_BERRY_NUM = 1;
const MIN_BERRY_SPAWN = 1;

const ALMOST_SINK_DELAY = 10;

const SNAKE_WIN_CONDITION = 300;

const MAX_FOOD_IN_BELLY = 3;
const PERMANENT_SNAKE_BODY_SIZE = 4;

// These constants belong to the other game difficulties
const HARD_MAX_SINK_TIME = 30 + 1;
const HARD_MIN_SINK_TIME = 20;
const HARD_MAX_EXPAND_TIME = 9 + 1;
const HARD_MIN_EXPAND_TIME = 2;

const HARD_AMOST_SINK_DELAY = 5;

const NUMBER_OF_COLORS = 6;

let control;	// Try not no define more global variables



// EXTRAS
const ENDGAME_POPUP_ID = "endgame-popup";
const ENDGAME_MESSAGE_ID = "endgame-message";
const FINAL_SCORE_ID = "final-score-span";
const PAUSE_BUTTON_ID = "pause-btn";
const CLOCK_DISPLAY_ID = "clock-display";
const SCORE_DISPLAY_ID = "score-display";
const MODE_DISPLAY_ID = "mode-display";

const WIN = "You won!";
const LOSS = "You lost!";

// We need to define this to keep track of the gameMode even after a reset 
let hardMode = false;

// ACTORS

class Actor {
	constructor(x, y, imageName) {
		this.x = x;
		this.y = y;
		this.atime = 0;	// This has a very technical role in the control of the animations
		this.imageName = imageName;
        this.show();
        this.crashType = IS_NOT_CRASHABLE;
        this.eatType = IS_NOT_EATABLE;
        this.sinkTime;
        this.almostSinkTime;
        this.almostSinking;
        this.startSinking();
	}

    /**
     * Draws the actor (his image) in the game map (the canvas)
     * @param {x} x - the actor's x position
     * @param {y} y - the actor's y position
     * @param {image} image - the actor's image
     */
	draw(x, y, image) {
		control.ctx.drawImage(image, x * ACTOR_PIXELS_X, y * ACTOR_PIXELS_Y);
	}
 
    /**
     * Draws the actor in the map at the position and returns the previous actor there
     * @returns the previous actor at the position
     */
	show() {
        let previousActor = control.getWorld()[this.x][this.y];
		control.getWorld()[this.x][this.y] = this;
		this.draw(this.x, this.y, GameImages[this.imageName]);
        return previousActor;
	}

    /**
     * Clears the actor from the game map
     */
	hide() {
		control.world[this.x][this.y] = control.getEmpty();
		this.draw(this.x, this.y, GameImages[IMAGE_NAME_EMPTY]);
    }
 
    /**
     * Moves the actor from his current position to a new one and returns the actor at the new position 
     * @param {dx} dx - the actor's x direction
     * @param {dy} dy - the actor's y direction
     * @returns the actor at the new position 
     */
	move(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
        [this.x, this.y] = control.checkInGameBounds(this.x, this.y);
		return this.show();
	}

    /**
     * Updates the actor every tick of the game clock
     */
	animation() {
        if(this.isEatable()) {
            this.tryToSink();
        }
	}
  
    /**
     * @returns the x coordinate of the actor
     */
    getX() { return this.x; }

    /**
     * @returns the y coordinate of the actor
     */
    getY() { return this.y; }

    /**
     * Sets the x coordinate of the actor to the specified one  
     * @param {x} x - the new x coordinate
     */
    setX(x) { this.x = x; } 

    /**
     * Sets the y coordinate of the actor to the specified one  
     * @param {y} y - the new y coordinate
     */
    setY(y) { this.y = y; }

    /**
     * @returns whether the actor is crashable, that is, whether the player dies when crashing against it 
     */
    isCrashable() { return this.crashType };

    /**
     * @returns whether the actor is eatable, that is, the player can eat the actor
     */
    isEatable() { return this.eatType };

    /**
     * If the actor is eatable than he will have a sink time, an almost sink time 
     * and an almost sinking status associated 
     */
    startSinking() {
        this.almostSinking = false;
        this.setSinkTime();

        let delay = ALMOST_SINK_DELAY;
        if(hardMode)
            delay = HARD_AMOST_SINK_DELAY;

        this.almostSinkTime = this.sinkTime - (delay * ANIMATION_EVENTS_PER_SECOND);
    }

    /**
     * Sets the sink time
     */
    setSinkTime() {
        let max = MAX_SINK_TIME;
        let min = MIN_SINK_TIME;

        if (hardMode) {
            max = HARD_MAX_SINK_TIME;
            min = HARD_MIN_SINK_TIME;
        }
        let randomTime = rand(max - min);
        this.sinkTime = ((randomTime + min) * ANIMATION_EVENTS_PER_SECOND) + control.getTime();
        
    }

    /**
     * Tries to sink/almost sink the actor
     * @pre actor has to be eatable 
     */
    tryToSink() {
        if (this.almostSinking) { // if already sinking try to sink
            control.drawAlmostSink(this.x, this.y);
            if (this.sinkTime <= control.getTime())
                this.sink();
        }
        else { // otherwise try to start sinking 
            if (this.almostSinkTime <= control.getTime()) {
                this.almostSink();
            }
        }
    }

    /**
     * Clears the actor from the map 
     */
    sink() {
        this.hide();
    }

    /**
     * Almost sinks the actor and increases its worth to whatever that class has defined
     */
    almostSink() {
        this.almostSinking = true;
        this.increaseWorth();
    }

    /**
     * Increases the actors worth
     * Left as abstract because different actors can have different worths
     */
    increaseWorth() {}

    /**
     * Returns its worth (points)
     * @returns the number of points the actor is worth
     */
    getPoints() { return this.worth; }

    getFoodType() { return this.imageName; }
    /**
     * Sets the actor has eatable
     */
    setIsEatable() { this.eatType = IS_EATABLE; }

    /**
     * Sets the actor has crashable
     */
    setIsCrashable() { this.crashType = IS_CRASHABLE; }
}

class GrowingActor extends Actor {
    constructor(x, y, image) {
        super(x, y, image);
        this.bodyLocations = [];
        this.setBody();
    }
    
    setBody() {
        this.bodyLocations.push([this.x, this.y]);
    }
    
    drawBody(bodyImage) {
        for(let i = 0; i < this.bodyLocations.length; i++) {
            let x = this.bodyLocations[i][0];
            let y = this.bodyLocations[i][1];

        	control.getWorld()[x][y] = this;
		    this.draw(x, y, GameImages[bodyImage]);
        }
    }

    hideBody() {
        for(let i = 0; i < this.bodyLocations.length; i++) {
            let x = this.bodyLocations[i][0];
            let y = this.bodyLocations[i][1];
		    this.draw(x, y, GameImages[IMAGE_NAME_EMPTY]);
        }
    }

    expand() {}
}

class Shrub extends GrowingActor {
	constructor(x, y) {
        super(x, y, IMAGE_NAME_SHRUB); 
        this.setIsCrashable();
        this.expandTime = this.setExpandTime();
    }

    setExpandTime() {
        let max = MAX_EXPAND_TIME;
        let min = MIN_EXPAND_TIME;

        if (hardMode) {
            max = HARD_MAX_EXPAND_TIME;
            min = HARD_MIN_EXPAND_TIME;
        }

        let randTime = rand(max - min);
        return (randTime + min) * ANIMATION_EVENTS_PER_SECOND;
    }

    animation() {
        if(this.expandTime <= control.getTime()) {
            this.expand();
        }
        this.drawBody(this.imageName);
    }
   

    expand() {
        let availablePositions = this.getAvailablePositions();
        let randPos = rand(availablePositions.length);

        this.bodyLocations.push(availablePositions[randPos]);


        this.expandTime += this.setExpandTime();
    }

    getAvailablePositions() {
        let available = [];
        for(let i = 0; i < this.bodyLocations.length; i++) { // for every part of the shrub
            let thisPosFree = control.getFreeAround(this.bodyLocations[i]); 
            available = available.concat(thisPosFree);
        }
        
        return available.filter(elem => !this.bodyLocations.includes(elem));
    }

    hide() {
        this.hideBody();
    }
}

class Empty extends Actor {
	constructor() {
		super(-1, -1, IMAGE_NAME_EMPTY);
		this.atime = Number.MAX_SAFE_INTEGER;	// This has a very technical role
	}
	show() {}
	hide() {}
}

class Invalid extends Actor {
	constructor(x, y) { super(x, y, IMAGE_NAME_INVALID); }
}


class Berry extends Actor {
	constructor(x, y, color) {
		super(x, y, color);
        this.worth = 1;
        this.setIsEatable();
	}
    /**
     * Increases the actor's worth
     */
    increaseWorth() {
        this.worth = 2;
    }
}

class Snake extends GrowingActor {
	constructor(x, y) {
		super(x, y, IMAGE_NAME_SNAKE_HEAD);
		[this.moveX, this.moveY];
        [this.previousMoveX, this.previousMoveY];
        [this.previousTailX, this.previousTailY];
        this.lastEaten = [];
        this.setIsCrashable();
	}

    /**
     * Initates the snake's movement.
     * Hard coded to RIGHT
     */
    initiateMovement() {
		[this.moveX, this.moveY] = [MOVE_X_RIGHT, STAY_IN_AXIS];
        [this.previousMoveX, this.previousMoveY] = [MOVE_X_RIGHT, STAY_IN_AXIS];
    }

    /**
     * Initiate's the snakes body.
     */
    setBody() {
        this.initiateMovement();

        let newX = this.x + -this.moveX; // starts the tail in the opposite direction of the movement
        let newY = this.y + -this.moveY;

        for(let i = 0; i < PERMANENT_SNAKE_BODY_SIZE; i++) {
            this.bodyLocations.unshift([newX, newY]);
            
            newX += -this.moveX;
            newY += -this.moveY;
        }

        this.drawBody(IMAGE_NAME_SNAKE_BODY);
    }

    /**
     * Handles the user's input and converts it to a (x, y) pair used for the snake's directions
     */
	handleKey() {
		let k = control.getKey();
		if (k === null)
			;
		else if (typeof(k) === "string") // There are no special commands
            ; 
        else {
			[this.moveX, this.moveY] = k;
		}
	}

    hide() {
        super.hide();
        this.hideBody();
    }

    /**
     * Updates the snake's position/status every tick of the game's clock
     */
	animation() {
		this.handleKey(); // Gets the input from the user
  
        this.fixDirection(); // Fixes the direction in case the user chose one that wasnt valid

        if(this.willCrash())// Checks if the user is moving into something crashable
            control.displayEndGame(LOSS);
        else {
            this.updatePrevious(); // Stores the last position the snake was at

		    let foodCell = this.move(this.moveX, this.moveY); // Moves the snake to the new position 

            if(!this.tryToEat(foodCell)) // Tries to eat whatever was in that position
                this.dropTail(); // Only removes the tail if it didnt eat

            this.updateBody(); // Moves the old tail behind the head

            this.drawStomach(); // The stomach to be drawn on top of the body (after it)
        }

        // EXTRA 
        control.updateScoreDisplay(this.bodyLocations.length + 1); // add 1 for the head

        this.checkForWin();
	}

    /**
     * Removes the tail from the snake and clears it from the map
     */
    dropTail() {
        let tail = this.bodyLocations.shift();
        control.hideCoord(tail);

        [this.previousTailX, this.previousTailY] = tail;
    }

    /**
     * Adds a new position behind the head of the snake
     */
    updateBody() {
        let prevX = this.x + -this.previousMoveX;
        let prevY = this.y + -this.previousMoveY;

        let previousPos = control.checkInGameBounds(prevX, prevY);

        this.bodyLocations.push(previousPos);

        this.drawBody(IMAGE_NAME_SNAKE_BODY);
    }

    /**
     * Checks if the snake's next position is a crashable actor
     * @returns true if the snake will crash and false otherwise
     */
    willCrash() {
        let newX = this.moveX + this.x;
        let newY = this.moveY + this.y;

        [newX, newY] = control.checkInGameBounds(newX, newY);
        
        return control.isCrashCell(newX, newY);
    }

    /**
     * Tries to eat the actor in the snake's current position
     */
    tryToEat(foodCell) {
        let ate = false
        if(foodCell.isEatable()) {
            let foodType = foodCell.getFoodType();
            if(this.isToxic(foodType))
                this.dropHalfTail();
            else {
                this.checkPoints(foodCell);
                ate = true;
            }
            this.updateLastEaten(foodType);
        }
        return ate;
    }
  
    checkPoints(food) { // if 2 points add another bit of tail
        if (food.getPoints() == 2) {
            this.addPreviousTail();
        }
    }

    addPreviousTail() {
        this.bodyLocations.unshift([this.previousTailX, this.previousTailY]);
    }

    drawStomach() {
        let lastPos = this.bodyLocations.length - 1;

        let coords = [];

        for(let i = 0; i < MAX_FOOD_IN_BELLY; i++) {
            coords.unshift(this.bodyLocations[lastPos - i]);
        }


        for(let i = 0; i < MAX_FOOD_IN_BELLY; i++) {
            let color = this.lastEaten[i];

            if(color === undefined)
                continue;

            let currentCoord = coords.pop();
            let x = currentCoord[0];
            let y = currentCoord[1];

            this.draw(x, y, GameImages[color]);
        }
    }

    updateLastEaten(foodType) {
        if (this.lastEaten.length === MAX_FOOD_IN_BELLY)
            this.lastEaten.pop();

        this.lastEaten.unshift(foodType);
    }

    dropHalfTail() { 
        let size = this.bodyLocations.length;
        let halfSize = div(size, 2);
        let dropSize = halfSize <= 4 ? this.bodyLocations.length - 4 : halfSize;

        for(let i = 0; i < dropSize; i++) {
            let fallen = this.bodyLocations.shift();
            control.hideCoord(fallen);
            [this.previousTailX, this.previousTailY] = fallen;
        }
    }

    isToxic(foodType) {
        return this.lastEaten.includes(foodType);
    }

    /**
     * Checks if the game has reached its winning condition and stops the game if true 
     */
    checkForWin() {
        if ((this.bodyLocations.length + 1) >= SNAKE_WIN_CONDITION) {
            control.displayEndGame(WIN);
        } // add one for the head 
    }

    /**
     * Checks if the user has chosen a valid direction and fixes it if they haven't 
     */
    fixDirection() {
        if (this.isOppositeDirection())
            this.goStraight();
    }

    /**
     * Checks if the user has chosen the opposite direction to the snake's current movement, that is, the snake's body's current cell
     * @returns true if it has and false otherwise
     */
    isOppositeDirection() {
        return this.moveX === -this.previousMoveX && this.moveY === -this.previousMoveY;
    } 

    /**
     * Ignores the user's input and keeps the snake going in its previous direction
     */
    goStraight() { 
        this.moveX = this.previousMoveX;
        this.moveY = this.previousMoveY;
    }

    /**
     * Updates the snake's previous direction
     */
    updatePrevious() { 
        this.previousMoveX = this.moveX;
        this.previousMoveY = this.moveY;
    }
}



// GAME CONTROL

class GameControl {
	constructor() {
		control = this;	// setup global var
		this.key = 0;
		this.time = 0;
		this.ctx = document.getElementById("swamp-canvas").getContext("2d");
		this.empty = new Empty();	// only one empty actor needed, global var
		this.world = this.createWorld();
		this.loadLevel(1);
		this.setupEvents();
        this.interval;
        this.berryTimer = this.randomizeBerryTimer() * ANIMATION_EVENTS_PER_SECOND;
        this.berryNumber = this.randomizeBerryNumber();
        this.colors = [];
        this.loadColors();

        this.isOver = false;
        this.isPlaying = true;
	}
    /**
     * @returns an empty object
     */
	getEmpty() {
		return this.empty;
	}
 
    /**
     * Creates the game's map 
     * @returns a two dimensional array representing the game's map
     */
	createWorld() { // matrix needs to be stored by columns
		let world = new Array(WORLD_WIDTH);
		for( let x = 0 ; x < WORLD_WIDTH ; x++ ) {
			let a = new Array(WORLD_HEIGHT);
			for( let y = 0 ; y < WORLD_HEIGHT ; y++ )
				a[y] = this.empty;
			world[x] = a;
		}
		return world;
	}

    /**
     * Sets up the map as a predefined level
     * @param {level} level - the number of the level being loaded
     */
	loadLevel(level) {
		if( level < 1 || level > MAPS.length )
			fatalError("Invalid level " + level)
		let map = MAPS[level-1];	// -1 because levels start at 1
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
					// x/y reversed because map is stored by lines
				GameFactory.actorFromCode(map[y][x], x, y);
			}
	}

    /**
     * Reads the input from the user and converts it to usable values 
     * @returns the pair (x, y) of coordinates that correspond to the key the user pressed
     */
	getKey() {
		let k = this.key;
		this.key = 0;
		switch( k ) {
			case 37: case 79: case 74: return [-1, 0];	// LEFT, O, J
			case 38: case 81: case 73: return [0, -1];	// UP, Q, I
			case 39: case 80: case 76: return [1, 0];	// RIGHT, P, L
			case 40: case 65: case 75: return [0, 1];	// DOWN, A, K
			case 0: return null;
			default: return String.fromCharCode(k);
		// http://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes
		};	
	}

    /**
     * Sets the functions called every tick of the game's clock
     */
	setupEvents() {
		addEventListener("keydown", e => this.keyDownEvent(e), false);
		addEventListener("keyup", e => this.keyUpEvent(e), false);
		this.interval = setInterval(() => this.animationEvent(), 1000 / ANIMATION_EVENTS_PER_SECOND);
	}

    /**
     * Calls the functions that update each of the actors in the map
     */
	animationEvent() {
		this.time++;
		for(let x=0 ; x < WORLD_WIDTH ; x++)
			for(let y=0 ; y < WORLD_HEIGHT ; y++) {
				let a = this.world[x][y];
				if( a.atime < this.time ) {
					a.atime = this.time;
					a.animation(x, y);
				}
			}
        this.spawnBerries();
        this.updateClockDisplay();
	}

    /**
     * Reads the key that caused the event
     * @param {e} e - the event 
     */
	keyDownEvent(e) {
		this.key = e.keyCode;
    }
 
    /**
     * Nothing
     * @param {e} e - the event
     */
	keyUpEvent(e) {
	}

    /**
     * @returns the current value of the game's clock
     */
    getTime() { return this.time; }

    /**
     * @returns a two dimensional array representing the game's map
     */
    getWorld() { return this.world; }

    /**
     * Checks whether there's a crashable actor at the (x, y) coordinates or not 
     * @param {x} x - the x coordinate
     * @param {y} y - the y coordinate
     * @returns true if it is a crashable actor and false if not
     */
    isCrashCell(x, y) {
        return this.world[x][y].isCrashable();
    }

    /**
     * Checks if the actor was inside the game map and if 
     * not returns the position he'd be in after being repositioned
     * @param {x} x - the x coordinate of the actor
     * @param {y} y - the y coordinate of the actor
     */
    checkInGameBounds(x, y) {
        let newX = x;
        let newY = y;
        if (x === -1)
            newX = WORLD_WIDTH - 1;
        else if (x === WORLD_WIDTH)
            newX = 0;
        else if(y === -1)
            newY = WORLD_HEIGHT - 1;
        else if (y === WORLD_HEIGHT)
            newY = 0;
        return [newX, newY];
    }

    /**
     * @returns the time it takes for the next wave of berries to spawn
     */
    randomizeBerryTimer() {
        let randomTime = rand(MAX_BERRY_SPAWN - MIN_BERRY_SPAWN);

        return randomTime + MIN_BERRY_SPAWN;
    }

    /**
     * @returns the number of berries spawned in the next spawn wave
     */
    randomizeBerryNumber() {
        let randomNum = rand(MAX_BERRY_NUM - MIN_BERRY_NUM);
        return randomNum + MIN_BERRY_NUM;
    }

    /**
     * Spawns more berries in the game
     */
    spawnBerries() {
        if (this.berryTimer <= this.time) {
            for (let i = 0; i < this.berryNumber; i++) {
                let x, y;
                [x, y] = this.getFreeRandomCell();

                let imageName = this.randomizeBerryColor();

                this.world[x][y] = new Berry(x, y, imageName);
            }
            this.updateTimers();
        }
    }

    randomizeBerryColor() {
        let randCol = rand(NUMBER_OF_COLORS);

        return this.colors[randCol];
    }

    loadColors() {
        this.colors.push(IMAGE_NAME_BERRY_BLUE);
        this.colors.push(IMAGE_NAME_BERRY_BROWN);
        this.colors.push(IMAGE_NAME_BERRY_DARK_GREEN);
        this.colors.push(IMAGE_NAME_BERRY_GREEN);
        this.colors.push(IMAGE_NAME_BERRY_RED);
        this.colors.push(IMAGE_NAME_BERRY_PURPLE);
    }

    /**
     * @returns a pair of (x, y) coordinates that is empty
     */
    getFreeRandomCell() {
        let randX = rand(WORLD_WIDTH);
        let randY = rand(WORLD_HEIGHT);

        while(!this.world[randX][randY] instanceof Empty) {
            randX = rand(WORLD_WIDTH);
            randY = rand(WORLD_HEIGHT);
        }

        return [randX, randY];
    }

    /**
     * Updates the time it will take for the next berry wave to spawn and the number being spawned
     */
    updateTimers() {
        this.berryNumber = this.randomizeBerryNumber();
        this.berryTimer += (this.randomizeBerryTimer() * ANIMATION_EVENTS_PER_SECOND);
    }

    pauseGame() {
        this.isPlaying = this.isPlaying == true ? false : true;
        clearInterval(this.interval);
        return this.isPlaying;
    }

    resumeGame() {
        this.isPlaying = this.isPlaying == true ? false : true;
		this.interval = setInterval(() => this.animationEvent(), 1000 / ANIMATION_EVENTS_PER_SECOND);
    }


    //TODO: make this a bit better looking 
    drawAlmostSink(x, y) {
        let realX = (x * ACTOR_PIXELS_X) + (ACTOR_PIXELS_X - 4) / 2;
        let realY = (y * ACTOR_PIXELS_Y) + (ACTOR_PIXELS_Y - 3) / 2;
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(realX, realY, 3, 3);
    }

    /**
     * Gets all the locations around a specified position
     * @param {x} x - the x coordinate
     * @param {y} y - the y coordinate
     * @returns the array of all the empty cells around a position
     */
    getFreeAround(coord) {
        let x = coord[0];
        let y = coord[1];
        let freeCells = [];

        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++) {
                let newX = x + i;
                let newY = y + j;

                [newX, newY] = this.checkInGameBounds(newX, newY); // In case the shrub spreads outside the game's map 

                if (i == 0 && j == 0) // Skips the center entry (itself)
                    continue;
                else if (this.world[newX][newY] instanceof Empty) {
                    freeCells.push([newX, newY]);
                }
            }

        return freeCells;
    }

    hideCoord(coord) {
        let x = coord[0];
        let y = coord[1];

        let old = control.world[x][y];
        control.world[x][y] = control.getEmpty();
		old.draw(x, y, GameImages[IMAGE_NAME_EMPTY]);
    }

    updateClockDisplay() {
        let actualTime = div(this.time, ANIMATION_EVENTS_PER_SECOND);

        let minutes = div(actualTime, 60);
        let strMin = minutes.toString();
        if (minutes < 10)
           strMin = `0${minutes}`;

        let seconds = actualTime - (minutes * 60);
        let strSec = seconds.toString();
        if (seconds < 10)
            strSec = `0${seconds}`; 

        document.getElementById(CLOCK_DISPLAY_ID).textContent = `${strMin}:${strSec}`;
    }

    updateScoreDisplay(score) {
        document.getElementById(SCORE_DISPLAY_ID).textContent = score;
    }

    isGamePlaying() { return this.isPlaying; }

    clearMap() { 
        for(let i = 0; i < WORLD_WIDTH; i++)
            for(let j = 0; j < WORLD_HEIGHT; j++) {

                this.world[i][j].hide();
            }
    }

    isGameOver() { return this.isOver; }

    resetGame() { 
        this.isOver = false;
        this.pauseGame();
        this.clearMap();
    }

    displayEndGame(message) {
        this.isOver = true;
        clearInterval(this.interval);
        document.getElementById(ENDGAME_POPUP_ID).style.visibility = "visible";
        document.getElementById(ENDGAME_MESSAGE_ID).textContent = message;
        document.getElementById(FINAL_SCORE_ID).textContent = document.getElementById(SCORE_DISPLAY_ID).textContent;
    }

    changeModes() {
        this.resetGame();
        hardMode = hardMode === true ? false : true;
    }
}


// Functions called from the HTML page

function onLoad() {
	// Asynchronously load the images an then run the game
	GameImages.loadAll(() => new GameControl());
}

function changeGameStatus() {
    if (!control.isGameOver()) {
        if (control.isGamePlaying()) {
            control.pauseGame();
            document.getElementById(PAUSE_BUTTON_ID).textContent = "resume";
        }
        else {
            control.resumeGame();
            document.getElementById(PAUSE_BUTTON_ID).textContent = "pause";
        } 
    }
}

function changeDifficulty() {
    let newMode = hardMode ? "EASY" : "HARD";
    control.changeModes(); 

    control = new GameControl();
    document.getElementById(MODE_DISPLAY_ID).textContent = newMode; 
}

function reset() {
    control.resetGame();

    document.getElementById(ENDGAME_POPUP_ID).style.visibility = "hidden";
    control = new GameControl();
}
