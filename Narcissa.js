/*	Narcissa

Aluno 1: ?60196 ?José Soares <-- mandatory to fill
Aluno 2: ?63439 ?Tomás Marta <-- mandatory to fill

Game Features:
    - Everything asked for (snake movement, berry spawn, shrub expand...)
    - Automatic Snake Movement.
    - A start screen with the game rules.
    - A reset and pause button:
        .The pause button pauses/resumes the game.
        .The reset button reloads the game and restarts the counter.
    - Different Difficulties you can choose from:
        .The time it took for shrubs to grow was decreased and so was 
        the time the berries last in the game board.
    - A leaderboard table that registers the 3 top scores and the players names.
    - A game clock and score displayed in the page for the user.

0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789
*/

// GLOBAL CONSTANTS

const ANIMATION_EVENTS_PER_SECOND = 4;

const GAME_LEVEL = 1; // Please choose the predefined configuration for the map using this constant

// Image Names
const IMAGE_NAME_EMPTY = "empty";
const IMAGE_NAME_INVALID = "invalid";
const IMAGE_NAME_SHRUB = "shrub";
const IMAGE_NAME_SNAKE_HEAD = "snakeHead";
const IMAGE_NAME_SNAKE_BODY = "snakeBody";

// Berry Colours
const IMAGE_NAME_BERRY_BLUE = "berryBlue";
const IMAGE_NAME_BERRY_BROWN = "berryBrown";
const IMAGE_NAME_BERRY_DARK_GREEN = "berryDarkGreen";
const IMAGE_NAME_BERRY_GREEN = "berryGreen"; 
const IMAGE_NAME_BERRY_PURPLE = "berryPurple"; 
const IMAGE_NAME_BERRY_RED = "berryRed";

const NUMBER_OF_COLORS = 6;

// Movement Coordinates
const MOVE_X_RIGHT = 1;
const MOVE_X_LEFT = -1;
const MOVE_Y_UP = -1;
const MOVE_Y_DOWN = 1; 
const STAY_IN_AXIS = 0;

// Actor Type 
const IS_NOT_CRASHABLE = false;
const IS_CRASHABLE = true;
const IS_NOT_EATABLE = false;
const IS_EATABLE = true;
const NO_WORTH = 0;

// Some constants are increased by one so the actual number
// (the one in the left side of the operation) is included in 
// the result of the random function 

// Shrub Related
const MAX_EXPAND_TIME = 100 + 1;
const MIN_EXPAND_TIME = 20; 

// Food Related
const MAX_BERRY_NUM = 5 + 1;
const MIN_BERRY_NUM = 1;
const MAX_BERRY_SPAWN = 11 + 1;
const MIN_BERRY_SPAWN = 1;
const MAX_SINK_TIME = 100 + 1;
const MIN_SINK_TIME = 20;
const ALMOST_SINK_DELAY = 10;

// Snake Related 
const SNAKE_WIN_CONDITION = 300;
const MAX_FOOD_IN_BELLY = 3;
const PERMANENT_SNAKE_BODY_SIZE = 4;

// Game Diff Related
const HARD_MAX_SINK_TIME = 30 + 1;
const HARD_MIN_SINK_TIME = 20;
const HARD_MAX_EXPAND_TIME = 4 + 1;
const HARD_MIN_EXPAND_TIME = 1;
const HARD_ALMOST_SINK_DELAY = 10;

const HARD_DIFF = "HARD";
const EASY_DIFF = "EASY";

// Game Mode Related
const MAN_MODE = "MANUAL";
const AUTO_MODE = "AUTOMATIC";

// DOM Related
const STARTGAME_POPUP_ID = "welcome-screen";
const ENDGAME_POPUP_ID = "endgame-popup";
const ENDGAME_MESSAGE_ID = "endgame-message";
const FINAL_SCORE_ID = "final-score-span";
const PAUSE_BUTTON_ID = "pause-btn";
const CLOCK_DISPLAY_ID = "clock-display";
const SCORE_DISPLAY_ID = "score-display";
const DIFF_DISPLAY_ID = "diff-display";
const MODE_DISPLAY_ID = "mode-display";
const LEADERBOARD_ID = "leader-popup";
const NO_SCORES = "no-scores";
const SCORE_LIST = "score-list";
const NAME_INPUT = "player-name-input";

const PAUSE = "Pause";
const RESUME = "Resume";

const ANON = "Anon";

const LEADERBOARD_SIZE = 3;

// Result Message
const WIN = "You won!";
const LOSS = "You lost!";


let control; // Try not no define more global variables

// ACTORS

/**
 * Class that represents every Actor (board cell) in the game board.
 */
class Actor {
	constructor(x, y, imageName) {
		this.x = x;
		this.y = y;
		this.atime = 0;	// This has a very technical role in the control of the animations
		this.imageName = imageName;
        this.show();
        this.crashType = IS_NOT_CRASHABLE; // Defaults to not eatable or crashable
        this.eatType = IS_NOT_EATABLE;

        // All Actor's will have a sink time, though Non-Eatable Actors will not use it
        this.sinkTime; 
        this.almostSinkTime; // This is the time when the Actors will be worth more points 
        this.almostSinking;
        this.startSinking();
	}
    
    
    // Setup Methods

    /**
     * Chooses the time at which the Actor will sink & almost sink.
     */
    startSinking() {
        this.almostSinking = false;
        this.setSinkTime();

        let delay = ALMOST_SINK_DELAY;
        if(control.isHardMode()) // Checks the game difficulty
            delay = HARD_ALMOST_SINK_DELAY;

        this.almostSinkTime = this.sinkTime - (delay * ANIMATION_EVENTS_PER_SECOND);
    }

    /**
     * Sets the Actor's sink time.
     */
    setSinkTime() {
        let max = MAX_SINK_TIME;
        let min = MIN_SINK_TIME;

        if (control.isHardMode()) { // Checks the game difficulty
            max = HARD_MAX_SINK_TIME;
            min = HARD_MIN_SINK_TIME;
        }
        let randomTime = rand(max - min);
        this.sinkTime = ((randomTime + min) * ANIMATION_EVENTS_PER_SECOND) + control.getTime();
    }

    /**
     * Sets the Actor has an Eatable type Actor.
     */
    setIsEatable() { this.eatType = IS_EATABLE; }

    /**
     * Sets the Actor has a Crashable type Actor.
     */
    setIsCrashable() { this.crashType = IS_CRASHABLE; }

    
    // Actor Type Methods

    /**
     * @returns whether the Actor is crashable, that is, whether the player dies when crashing into it
     */
    isCrashable() { return this.crashType };

    /**
     * @returns whether the actor is eatable, that is, the player can eat the actor
     */
    isEatable() { return this.eatType };


    // Update & Status Related Methods

   /**
     * Updates the Actor every tick of the game clock.
     * Checks if the Actor is Eatable and tries to sink him. 
     * Non-Eatable Actor's will define they're own animation 
     * or simply won't animate, e.g. Empty type Actors.
     */
	animation() {
        if(this.isEatable()) {
            this.tryToSink();
        }
	}

    /**
     * Tries to sink or almost sink the Actor.
     * @pre the Actor is Eatable
     */
    tryToSink() {
        if (this.almostSinking) { // if already sinking try to sink
            control.drawAlmostSink(this.x, this.y); // Draws a white dot representing the almost sinking status 
            if (this.sinkTime <= control.getTime())
                this.hide();
        }
        else { // otherwise try to almost sink
            if (this.almostSinkTime <= control.getTime()) {
                this.almostSink();
            }
        }
    }

    /**
     * Almost sinks the actor and increases its worth to whatever that class has defined.
     * @pre the Actor is Eatable
     */
    almostSink() {
        this.almostSinking = true;
        this.increaseWorth();
    }

    /**
     * Increases the Actor's worth.
     * Left as abstract since it will be defined by a Eatable type subclass.
     * @pre the Actor is Eatable
     */
    increaseWorth() {}

    /**
     * Returns its worth (points)
     * @pre the Actor is Eatable
     * @returns the number of points the actor is worth
     */
    getPoints() { return this.worth; }

    /**
     * Gets the Actor's image
     * Only to be used with Eatable type actors. 
     * @returns the Actor's image name
     */
    getFoodType() { return this.imageName; }


    // Movement & Position Related Methods 
    
    /**
     * Calculates the Actor's new position with the specified direction
     * and returns the Actor previously at that position.
     * @param {int} dx - the Actor's x direction
     * @param {int} dy - the Actor's y direction
     * @returns the previous Actor at the new position 
     */
	move(dx, dy) {
		this.hide();
		this.x += dx;
		this.y += dy;
        [this.x, this.y] = control.checkInGameBounds(this.x, this.y);
		return this.show();
	}

    /**
     * @returns the Actor's x coordinate 
     */
    getX() { return this.x; }

    /**
     * @returns the Actor's y coordinate
     */
    getY() { return this.y; }

    /**
     * Sets the Actor's x coordinate to the specified one.  
     * @param {int} x - the new x coordinate
     */
    setX(x) { this.x = x; } 

    /**
     * Sets the Actor's y coordinate to the specified one.
     * @param {int} y - the new y coordinate
     */
    setY(y) { this.y = y; }


    // Visual Methods

    /**
     * Draws the Actor (his image) in the game map (the canvas)
     * @param {int} x - the actor's x position
     * @param {int} y - the actor's y position
     * @param {img} image - the actor's image
     */
	draw(x, y, image) {
		control.ctx.drawImage(image, x * ACTOR_PIXELS_X, y * ACTOR_PIXELS_Y);
	}
 
    /**
     * Draws the Actor currently in his position and returns what was there before.
     * The return part is important when eating Berries 
     * since we move the Snake before we add points.
     * @returns the previous actor in that position
     */
	show() {
        let previousActor = control.getWorld()[this.x][this.y];
		control.getWorld()[this.x][this.y] = this;
		this.draw(this.x, this.y, GameImages[this.imageName]);
        return previousActor;
	}

    /**
     * Removes the Actor from the map and clears his cell
     */
	hide() {
		control.world[this.x][this.y] = control.getEmpty();
		this.draw(this.x, this.y, GameImages[IMAGE_NAME_EMPTY]);
    }
}

/**
 * Class that extends Actor and represents Berries.
 * An Eatable type Class.
 */
class Berry extends Actor {
	constructor(x, y, color) {
		super(x, y, color);
        this.worth = 1; // The Berry is initially worth 1 point
        this.setIsEatable(); // Sets the Class as Eatable
	}

    /**
     * Increases the actor's worth to 2
     */
    increaseWorth() {
        this.worth = 2;
    }
}

/**
 * Class that extends Actor and represents those Actors 
 * who may increase their size, that is, the number of Cells they take up in the map.
 * NOTE: The term Head will be used to refer to the first position of the Actor.
 */
class GrowingActor extends Actor {
    constructor(x, y, image) {
        super(x, y, image);
        this.bodyLocations = []; // Coordinates taken up by the Actor, an array of [x, y] elements
        this.setBody();
    }
   
    // Growing methods

    /**
     * Sets the Actor's very first position (the Head).
     */
    setBody() {
        this.bodyLocations.push([this.x, this.y]);
    }

    /**
     * Increases the positions taken up by the Actor
     * Left as abstract since each Growing type Actor can have different ways of expanding.
     */
    expand() {}


    // Visual Methods

    /**
     * Draws the Actor's body in all the coordinates he takes up. 
     * @param {string} bodyImage - the name of the body's image
     */
    drawBody(bodyImage) {
        for(let i = 0; i < this.bodyLocations.length; i++) {
            let [x, y] = this.bodyLocations[i];

        	control.getWorld()[x][y] = this;
		    this.draw(x, y, GameImages[bodyImage]);
        }
    }

    /**
     * Hides the Actor's entire body. 
     * Has to be used since the Actor's hide method only hides the Head.
     */
    hideBody() {
        for(let i = 0; i < this.bodyLocations.length; i++) {
            let [x, y] = this.bodyLocations[i];

            control.getWorld()[x][y] = control.getEmpty();
		    this.draw(x, y, GameImages[IMAGE_NAME_EMPTY]);
        }
    }
}

/**
 * Class representing Shrubs and is Crashable (the player may crash into a Shrub and die).
 * Extends GrowingActor.
 */
class Shrub extends GrowingActor {
	constructor(x, y) {
        super(x, y, IMAGE_NAME_SHRUB); 
        this.setIsCrashable(); // Sets the class as Crashable
        this.expandTime = this.setExpandTime(); // Sets the exact time when the Shrub will grow 
    }


    // Setup Methods

    /**
     * @returns the exact time when the Shrub will grow
     */
    setExpandTime() {
        let max = MAX_EXPAND_TIME;
        let min = MIN_EXPAND_TIME;

        if (control.isHardMode()) { // Checks the game difficulty
            max = HARD_MAX_EXPAND_TIME;
            min = HARD_MIN_EXPAND_TIME;
        }

        let randTime = rand(max - min);
        return (randTime + min) * ANIMATION_EVENTS_PER_SECOND;
    }


    // Updates & Status Related Methods 

    /**
     * Updates the Shrub every tick of the game clock.
     * Checks if it's for the Shrub to grow and if so "grows" (expands) it
     * and then draws the updated body.
     */
    animation() {
        if(this.expandTime <= control.getTime()) {
            this.expand();
            this.drawBody(this.imageName);
        }
    }
   
    /**
     * Grows the Shrub.
     * Increases the total number of positions occupied by it by one.
     * The new position is randomly selected from all the positions adjacent to it.
     * The expand time is also refreshed.
     */
    expand() {
        let availablePositions = this.getAvailablePositions();
        let randPos = rand(availablePositions.length);

        this.bodyLocations.push(availablePositions[randPos]);

        this.expandTime += this.setExpandTime();
    }

    /**
     * Gets all the positions that are available around the Shrub. 
     * @returns an array with all the free adjacent positions to the Shrub
     */
    getAvailablePositions() {
        let available = [];
        for(let i = 0; i < this.bodyLocations.length; i++) { // for every part of the shrub
            let thisPosFree = control.getFreeAround(this.bodyLocations[i]); 
            available = available.concat(thisPosFree);
        }
       
        // Removes the positions already occupieed by the shrub
        return available.filter(elem => !this.bodyLocations.includes(elem)); 
    }


    // Visual Methods 

    // Hides all of the Shrub 
    hide() {
        this.hideBody();
    }
}

/**
 * Class extending GrowingActor and represents the Snake (the only playable Actor currently).
 * The snake will have an Head and then a body which may increase in length.
 */
class Snake extends GrowingActor {
	constructor(x, y) {
		super(x, y, IMAGE_NAME_SNAKE_HEAD);
		[this.moveX, this.moveY];
        [this.previousMoveX, this.previousMoveY];
        [this.previousTailX, this.previousTailY];
        this.lastEaten = []; // The set of the images of the Eatable type Actors the Snake last ate
        this.setIsCrashable(); // Sets as crashable in case the player crashes into himself
	}


    // Setup Methods

    /**
     * Initiate's the snakes body.
     * Chooses the first PERMANENT_SNAKE_BODY_SIZE starting coordinates of the Snake's body
     * and inserts them into the occupied body coordinates array.
     * The Head of the snake is not included in this array.
     */
    setBody() {
        this.initiateMovement();

        // starts the tail in the opposite direction of the movement
        let newX = this.x + -this.moveX; 
        let newY = this.y + -this.moveY;

        for(let i = 0; i < PERMANENT_SNAKE_BODY_SIZE; i++) {
            // the first body locations (nearest to the head) are stored at the end of the array
            this.bodyLocations.unshift([newX, newY]);
            
            newX += -this.moveX;
            newY += -this.moveY;
        }

        this.drawBody(IMAGE_NAME_SNAKE_BODY);
    }
    
    /**
     * Initates the snake's movement.
     * Sets the initial direction of the movement.
     * Hard coded to moving RIGHT.
     */
    initiateMovement() {
		[this.moveX, this.moveY] = [MOVE_X_RIGHT, STAY_IN_AXIS];
        [this.previousMoveX, this.previousMoveY] = [MOVE_X_RIGHT, STAY_IN_AXIS];
    }


    // Visual Methods

    /**
     * Hides the entire Snake Actor from the map.
     */
    hide() {
        super.hide(); // Has to use this since the head isn't part of the body array
        this.hideBody();
    }


    // Update & Status related Methods

    /**
     * Updates the snake's position & other things every tick of the game's clock.
     */
	animation() {
        if(control.isAutoGame()) { // Checks the game mode
            [this.moveX, this.moveY] = control.automateMovement(this); 
        } 
        else
	    	this.handleKey(); // Gets the input from the user
        
        this.fixDirection(); // Fixes the direction in case the user chose one that wasnt valid

        if(this.willCrash())// Checks if the user is moving into something crashable
            control.displayEndGame(LOSS);
        else {
            this.updatePrevious(); // Stores the last position the snake was at

		    let foodCell = this.move(this.moveX, this.moveY); // Moves the snake to the new position and gets the actor previously there

            if(!this.tryToEat(foodCell)) // Tries to eat whatever was in that position
                this.dropTail(); // Only removes the tail if it didnt eat

            this.updateBody(); // Moves the old tail behind the head

            this.drawStomach(); // The stomach to be drawn on top of the body (after the body was drawn)

            control.updateScoreDisplay(this.bodyLocations.length + 1); // EXTRA: Updates the score display in the web page

            this.checkForWin(); // Checks if the player has won
        }
    }

    /**
     * Draws the Snake's MAX_FOOD_IN_BELLY last eaten foods in her stomach. 
     */
    drawStomach() {
        let lastPos = this.bodyLocations.length - 1;
        let coords = []; // Array for storing the stomach's position

        for(let i = 0; i < MAX_FOOD_IN_BELLY; i++) {
            coords.unshift(this.bodyLocations[lastPos - i]); // Adds the first three body locations to the array
        }

        for(let i = 0; i < MAX_FOOD_IN_BELLY; i++) {
            let foodImage = this.lastEaten[i]; 

            if(foodImage === undefined) // If it hasn't eaten three Eatable type Actors yet
                continue;

            let currentCoord = coords.pop();
            let [x, y] = currentCoord;

            this.draw(x, y, GameImages[foodImage]); 
        }
	}
    
    /**
     * Removes the tail (the last position occupied) from the Snake's body
     * and clears it from the map.
     */
    dropTail() {
        let tail = this.bodyLocations.shift();
        control.hideCoord(tail);

        [this.previousTailX, this.previousTailY] = tail;
    }

    /**
     * Adds a new body location behind the Head of the Snake.
     */
    updateBody() {
        let prevX = this.x + -this.previousMoveX;
        let prevY = this.y + -this.previousMoveY;

        let previousPos = control.checkInGameBounds(prevX, prevY); // Checks if the position is within game bounds and fixes if not

        this.bodyLocations.push(previousPos);

        this.drawBody(IMAGE_NAME_SNAKE_BODY);
    }

    /**
     * Adds the previously lost tail back.
     */
    addPreviousTail() {
        this.bodyLocations.unshift([this.previousTailX, this.previousTailY]);
    }
 
    /**
     * Loses half of the length of the tail the player had acquired.
     */
    dropHalfTail() { 
        let tailSize = this.bodyLocations.length - PERMANENT_SNAKE_BODY_SIZE;
        let dropSize;
        
        if(tailSize == 0) 
            dropSize = 0;
        else {
            if (tailSize == 1)
                dropSize = 1; 
            else
                dropSize = div(tailSize, 2);

            let fallen;
            for(let i = 0; i < dropSize; i++) {
                fallen = this.bodyLocations.shift();
                control.hideCoord(fallen);
            }

            [this.previousTailX, this.previousTailY] = fallen;
        }    
    }

    /**
     * Updates the array of the last eaten foods. 
     * @param {string} foodType - the imageName of the food last eaten
     */
    updateLastEaten(foodType) {
        if (this.lastEaten.length === MAX_FOOD_IN_BELLY)
            this.lastEaten.pop();

        this.lastEaten.unshift(foodType);
    }

    /**
     * Checks if the game has reached its winning condition and stops the game if true.
     */
    checkForWin() {
        if ((this.bodyLocations.length + 1) >= SNAKE_WIN_CONDITION) // +1 for the Head
            control.displayEndGame(WIN);
    }

    
    // Interaction With Other Actors Methods

    /**
     * Checks if the Snake's next position is a Crashable type Actor.
     * @returns true if the Snake will crash and false otherwise
     */
    willCrash() {
        let newX = this.moveX + this.x;
        let newY = this.moveY + this.y;

        [newX, newY] = control.checkInGameBounds(newX, newY); // Checks if the position is within game bounds and fixes if not
        
        return control.isCrashCell(newX, newY);
    }

    /**
     * Tries to eat the Actor specified. 
     */
    tryToEat(foodCell) {
        let ate = false

        if(foodCell.isEatable()) {
            let foodType = foodCell.getFoodType();
            if(this.isToxic(foodType)) {
                this.dropHalfTail(); // If the food is Toxic the player is punished with losing half of the length he already acquired
            }
            else {
                this.checkPoints(foodCell); // Checks how much the food is worth
                ate = true;
            }
            this.updateLastEaten(foodType); // Updates the array of last eaten foods
        }
        return ate;
    }
 
    /**
     * Checks how much the food is worth.
     * If it's worth 2 then add one more body location to the Snake.
     * @param {Actor} food - the Actor being checked
     * @pre Actor has to be an Eatable type Actor
     */
    checkPoints(food) { // if 2 points add another bit of tail
        if (food.getPoints() == 2) {
            this.addPreviousTail();
        }
    }

    /**
     * Checks if the food is toxic to the Snake or not.
     * @param {string} foodType - the name of the food the Snake ate
     * @returns true if the food is toxic and false otherwise
     */
    isToxic(foodType) {
        return this.lastEaten.includes(foodType);
    }


    // Movement & Position related Methods 

    /**
     * Checks if the user has chosen a valid direction and makes the Snake keep going
     * forward if they haven't.
     */
    fixDirection() {
        if (this.isOppositeDirection())
            this.goStraight();
    }

    /**
     * Checks if the user has chosen the opposite direction to the Snake's current movement,
     * that is, the snake's body's first cell.
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
     * @returns the Snake's previous direction
     */
    getPreviousDir() {
        return [this.previousMoveX, this.previousMoveY];
    }

    /**
     * Refreshes the snake's previous direction
     */
    updatePrevious() { 
        this.previousMoveX = this.moveX;
        this.previousMoveY = this.moveY;
    }

    /**
     * @returns the array of foods the Snake has last eaten
     */
    getToxicFoods() {
        return this.lastEaten;
    }
    

    // User Input Methods 

    /**
     * Handles the user's input and converts it to a [x, y] coordinates array
     * that can be used to change the Snake's movement's direction.
     */
	handleKey() {
		let k = control.getKey();
		if (k === null || typeof(k) === "string") // There are no special commands
            ; // Ignores everything except proper input 
        else {
			[this.moveX, this.moveY] = k;
		}
	}
}


/**
 * Class extending Acctor that represents an empty cell in the game board.
 */
class Empty extends Actor {
	constructor() {
		super(-1, -1, IMAGE_NAME_EMPTY);
		this.atime = Number.MAX_SAFE_INTEGER;	// This has a very technical role
	}
	show() {}
	hide() {}
}

// GAME CONTROL

class GameControl {
	constructor() {
		control = this;	// setup global var
		this.key = 0;
		this.time = 0;
		this.ctx = document.getElementById("swamp-canvas").getContext("2d");
		this.empty = new Empty(); // only one empty actor needed, global var
		this.world = this.createWorld();
		this.loadLevel(GAME_LEVEL);
		this.setupEvents();
        this.interval;

        // Spawn Berries
        this.berryTimer = this.randomizeBerryTimer() * ANIMATION_EVENTS_PER_SECOND;
        this.berryNumber = this.randomizeBerryNumber();
        
        // Load other Berries colours
        this.colors = [];
        this.loadColors();

        // Game Status & Settings
        this.isAuto = false;
        this.isHard = false;
        this.isPlaying = true;
        this.isOver = false;
 
        // LeaderBoard
        this.topScores = [];
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
     * @param {int} level - the number of the level being loaded
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
     * @returns the array [x, y] of coordinates that correspond to the user pressed key
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
     * @param {event} e - the event 
     */
	keyDownEvent(e) {
		this.key = e.keyCode;
    }
 
    /**
     * Nothing
     * @param {event} e - the event
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


    // Berry Management Related Methods

    /**
     * Loads the chosen colors for the Berries.
     */
    loadColors() {
        this.colors.push(IMAGE_NAME_BERRY_BLUE);
        this.colors.push(IMAGE_NAME_BERRY_BROWN);
        this.colors.push(IMAGE_NAME_BERRY_DARK_GREEN);
        this.colors.push(IMAGE_NAME_BERRY_GREEN);
        this.colors.push(IMAGE_NAME_BERRY_RED);
        this.colors.push(IMAGE_NAME_BERRY_PURPLE);
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
     * @returns a random color for a Berry
     */
    randomizeBerryColor() {
        let randCol = rand(NUMBER_OF_COLORS);

        return this.colors[randCol];
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

    /**
     * Updates the time it will take for the next Berry wave to spawn and the number being spawned
     */
    updateTimers() {
        this.berryNumber = this.randomizeBerryNumber();
        this.berryTimer += (this.randomizeBerryTimer() * ANIMATION_EVENTS_PER_SECOND);
    }

    

    // Position & Movement Related Methods

    /**
     * Checks whether there's a crashable actor at the (x, y) coordinates or not 
     * @param {int} x - the x coordinate
     * @param {int} y - the y coordinate
     * @returns true if it is a crashable actor and false if not
     */
    isCrashCell(x, y) {
        return this.world[x][y].isCrashable();
    }

    /**
     * Checks if the actor was inside the game map and if 
     * not returns the position he'd be in after being repositioned
     * @param {int} x - the x coordinate of the actor
     * @param {int} y - the y coordinate of the actor
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
     * @returns an array of [x, y] coordinates that are empty
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
     * Gets all the locations around a specified position
     * @param {[int]} coord - an [x, y] array with the specified position's coordinates
     * @returns the array of all the empty cells around a position
     */
    getFreeAround(coord) {
        let [x, y] = coord;
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

    
    // Visual Methods

    /**
     * Hides (clears from the map) the cell at the specified coordinates.
     * @param {[int]} coord - a [x, y] coordinates array
     */
    hideCoord(coord) {
        let [x, y] = coord;

        let old = control.world[x][y];
        control.world[x][y] = control.getEmpty();
		old.draw(x, y, GameImages[IMAGE_NAME_EMPTY]);
    }

    /**
     * Draws a white dot in the center of a specified Eatable Actor reprenting its "almost sinking" status.
     * @param {int} x - the x coordinates of the Actor 
     * @param {int} y - the y coordinates of the Actor
     */
    drawAlmostSink(x, y) {
        // The decimals at the end are minor adjustments to center the dot
        let realX = (x * ACTOR_PIXELS_X) + (ACTOR_PIXELS_X / 2) - 1.5;
        let realY = (y * ACTOR_PIXELS_Y) + (ACTOR_PIXELS_Y / 2) - 0.5;
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(realX, realY, 2, 2);
    }

    /**
     * Clears the Map of any Actors. 
     */
    clearMap() { 
        for(let i = 0; i < WORLD_WIDTH; i++)
            for(let j = 0; j < WORLD_HEIGHT; j++)
                this.world[i][j].hide();
    }

    
    // Methods for calculating the Automatic Snake's Movemement

    /**
     * Gets the direction for the Snake to go in to get food.
     * @param {Snake} snake - the Snake
     * @returns the direction for the Snake to go in
     */
    automateMovement(snake) {
        let snakeX = snake.getX();
        let snakeY = snake.getY();
        let pos = this.findNearestFood(snake.getToxicFoods(), snakeX, snakeY); 
        let [foodX, foodY] = pos;

        if(foodX == -1 && foodY == -1) {
            // If there are no berries spawned keep moving straight ahead
            let moveY;
            let moveX;
            [moveX, moveY] = snake.getPreviousDir();
            let newX = snakeX + moveX;
            let newY = snakeX + moveY;
            return this.correctAutomatic(snakeX, snakeY, newX, newY, snake.getToxicFoods());
        } else {
            return this.correctAutomatic(snakeX, snakeY, foodX, foodY, snake.getToxicFoods());
        }
    }

    /**
     * Gets the nearest food that isn't toxic to the coordinates specified. 
     * @param {[string]} toxic - an array of the Snake's toxic foods
     * @param {int} x - the Snake's x coordinate
     * @param {int} y - the Snake's y coordinate
     * @returns the array of [x, y] coordinates of the nearest food
     */
    findNearestFood (toxic, x, y) {
        let minDist;
        let foodX = -1;
        let foodY = -1; 

        for (let i = 0; i < WORLD_WIDTH; i++) 
            for (let j = 0; j < WORLD_HEIGHT; j++) {
                let currFood = this.world[i][j];
                if (currFood.isEatable()) {
                    if (toxic.includes(currFood.getFoodType())) // if toxic skip 
                        continue;
                    else {
                        let currWorth = currFood.getPoints();
                        let dist = distance(x, y, i, j);

                        if (foodX == -1 && foodY == -1) { // just for initializing the values
                            foodX = i;
                            foodY = j;
                            minDist = dist;
                        } else if (minDist >= dist) {
                            if (minDist > dist ) { // if closer set immediatedly 
                                foodX = i;
                                foodY = j;
                                minDist = dist; 
                            } 
                            else if (minDist == dist && 
                                    this.world[foodX][foodY].getPoints() < currWorth) {
                                // if same distance has to be worth more to be set 
                                foodX = i;
                                foodY = j;
                                minDist = dist; 
                            }
                        }
                    }
                }
            }

        return [foodX, foodY];
    }

    /**
     * Gets the direction from (sX, sY) to (bX, bY) making sure there are no
     * obstacles in the way.
     * @param {int} sX - the Snake's x coordinate
     * @param {int} sY - the Snake's y coordinate
     * @param {int} bX - the Food's x coordinate
     * @param {int} bY - the Food's y coordinate
     * @param {[string]} toxic - an array with the Snake's toxic foods
     * @returns the direction for the snake to go in after being verified
     */
    correctAutomatic(sX, sY, bX, bY, toxic) {
        let dir = this.getDirectionTo(sX, sY, bX, bY);
        let [moveX, moveY] = dir;
        
        let nextX = sX + moveX;
        let nextY = sY + moveY; 
        [nextX, nextY] = this.checkInGameBounds(nextX, nextY);
        let nextCell = this.world[nextX][nextY];

        let tries = 0;

        while (this.isCrashCell(nextX, nextY) ||
                (nextCell.isEatable() && toxic.includes(nextCell.getFoodType()))) {
            let t = moveX;
            moveX = moveY * -1;
            moveY = t;  
            nextX = sX + moveX;
            nextY = sY + moveY;  
            [nextX, nextY] = this.checkInGameBounds(nextX, nextY);
            nextCell = this.world[nextX][nextY];

            tries++;

            if (tries == 3) { // All options gone, the Snake loses
                break;
            }
        }

        return [moveX, moveY];
    }

    /**
     * Gets the direction from (sX, sY) to (bX, bY).
     * @param {int} sX - the Snake's x coordinate
     * @param {int} sY - the Snake's x coordinate
     * @param {int} bX - the Food's x coordinate
     * @param {int} bY - the Food's y coordinate
     * @returns the [x, y] array of coordinates for the snake to move in 
     */
    getDirectionTo(sX, sY, bX, bY) {
        let dirX;
        let dirY;        

        if(sY === bY) {
            if(sX < bX) {
                dirX = MOVE_X_RIGHT;
                dirY = STAY_IN_AXIS;
            } else {
                dirX = MOVE_X_LEFT;
                dirY = STAY_IN_AXIS;
            }
        } else if (sX === bX) {
            if(sY < bY) {
                dirX = STAY_IN_AXIS;
                dirY = MOVE_Y_DOWN;
            } else {
                dirX = STAY_IN_AXIS;
                dirY = MOVE_Y_UP;
            }
        } else { // If not in the same row or col as the berry then first go to the same Col
            if(sX < bX) {
                dirX = MOVE_X_RIGHT;
                dirY = STAY_IN_AXIS;
            } else {
                dirX = MOVE_X_LEFT;
                dirY = STAY_IN_AXIS;
            }
        }
        return [dirX, dirY];
    }


    // Game Status & Settings Methods

    /**
     * @returns true if the game is not on pause and false otherwise
     */
    isGamePlaying() { return this.isPlaying; }

    /**
     * @returns true if the user hasn't lost or won and false otherwise
     */
    isGameOver() { return this.isOver; }

    /**
     * @returns true if the game is on hard mode and false otherwise
     */
    isHardMode() { return this.isHard; }

    /**
     * @returns true if the game is on automatic mode and false otherwise
     */
    isAutoGame() { return this.isAuto; }

    /**
     * Changes the game difficulty from easy to hard and vice versa.
     */
    changeDiff() {
        this.isHard = this.isHard === true ? false : true;
        this.resetGame();
    }

    /**
     * Changes the game mode from automatic to manual and vice versa.
     */
    changeMode() {
        this.isAuto = this.isAuto === true ? false : true;
        this.resetGame();
    }

    /**
     * Pauses the game.
     */
    pauseGame() {
        this.isPlaying = this.isPlaying == true ? false : true;
        clearInterval(this.interval);
    }

    /**
     * Resusmes the game.
     */
    resumeGame() {
        this.isPlaying = this.isPlaying == true ? false : true;
		this.interval = setInterval(() => this.animationEvent(), 1000 / ANIMATION_EVENTS_PER_SECOND);
    }

    /**
     * Updates the clock being displayed to the user.
     */
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

    /**
     * Updates the score being displayed to the user.
     * @param {int} score - the user's score
     */
    updateScoreDisplay(score) {
        document.getElementById(SCORE_DISPLAY_ID).textContent = score;
    }

    /**
     * Resets the entire game but leaves the user's setting intact.
     * E.g. If reset on automatic & hard the game will come back as automatic & hard.
     */
    resetGame() { 
        this.isOver = false;
        this.pauseGame();
        this.clearMap();
        this.isPlaying = true;
        document.getElementById(PAUSE_BUTTON_ID).textContent = PAUSE;
        document.getElementById(ENDGAME_POPUP_ID).style.display = "none";

        this.berryTimer = this.randomizeBerryTimer() * ANIMATION_EVENTS_PER_SECOND;
        this.berryNumber = this.randomizeBerryNumber();
        this.world = this.createWorld();
        this.loadLevel(GAME_LEVEL);
        this.time = 0;
        this.interval = setInterval(() => this.animationEvent(), 1000 / ANIMATION_EVENTS_PER_SECOND);
    }

    /**
     * Display a message to the user once the game is over as well as his final score.
     * @param {string} message - the message that the user will see
     */
    displayEndGame(message) {
        this.isOver = true;
        const score = document.getElementById(SCORE_DISPLAY_ID).textContent;
        clearInterval(this.interval);
        document.getElementById(ENDGAME_POPUP_ID).style.display = "block";
        document.getElementById(ENDGAME_MESSAGE_ID).textContent = message;
        document.getElementById(FINAL_SCORE_ID).textContent = score; 
        this.updateLeaderBoard(score);
    }

    /**
     * Updates the leader board displayed to the user.
     * If the game is being played on Automatic Mode the score will not be added.
     * @param {string} score - the score the user got this try 
     */
    updateLeaderBoard(score) {
        if(this.isAuto) {
            return;
        }

        const list = document.getElementById(SCORE_LIST);
        const noScores = document.getElementById(NO_SCORES);
        const newScore = document.createElement("li");
        let playerName = document.getElementById(NAME_INPUT).value;
        playerName = playerName == "" ? ANON : playerName;

        newScore.textContent = `${playerName} - ${score}`;
        newScore.classList.add("list-elem");

        if (noScores !== null) {// if no scores have been inserted yet
            noScores.remove();
            list.appendChild(newScore);
            this.topScores.push(+score);
        } else 
            this.orderScores(list, newScore, +score);
    }

    /**
     * Inserts the new score into the list depending on 
     * if its greater than a score already in the list. 
     * @param {htmlOrderedList} list - the leader board
     * @param {htmlListElement} scoreNode - the HTML element with the List element 
     * @param {int} score - an integer with the new score's value 
     */
    orderScores(list, scoreNode, score) {
        let children = list.children;
        let added = false;

        for(let i = 0; i < children.length; i++) {
            let currentChild = children[i];

            if (score >= this.topScores[i]) {
                list.insertBefore(scoreNode, currentChild);
                this.topScores.splice(i, 0, score);
                added = true;
                break;
            }
        }

        // For when the list has less than 3 entries 
        if (!added && children.length < 3) {
            list.appendChild(scoreNode);
            this.topScores.push(+score);
        }
        // Makes sure the leaderboard isn't bigger than the defined size and removes the last entry
        if (children.length > LEADERBOARD_SIZE) {
                this.topScores.pop();
                list.removeChild(children[children.length - 1]);
        }
    }
}
 

// Functions called from the HTML page

/**
 * Loads the game.
 */
function startGame() {
	// Asynchronously load the images an then run the game
    document.getElementById(STARTGAME_POPUP_ID).style.display = "none";
	GameImages.loadAll(() => new GameControl());
}

/**
 * Resets the game.
 */
function reset() {
    control.resetGame();
}

/**
 * Pauses or Resumes the game.
 */
function changeGameStatus() {
    if (!control.isGameOver()) {
        if (control.isGamePlaying()) {
            control.pauseGame();
            document.getElementById(PAUSE_BUTTON_ID).textContent = RESUME;
        }
        else {
            control.resumeGame();
            document.getElementById(PAUSE_BUTTON_ID).textContent = PAUSE;
        } 
    }
}

/**
 * Changes the game difficulty.
 */
function changeDifficulty() {
    let diffMode = control.isHardMode() ? EASY_DIFF : HARD_DIFF;
    control.changeDiff(); 

    document.getElementById(DIFF_DISPLAY_ID).textContent = diffMode;
}

/**
 * Changes the game mode.
 */
function changeMode() {
    let newMode = control.isAutoGame() ? MAN_MODE : AUTO_MODE;
    control.changeMode();

    document.getElementById(MODE_DISPLAY_ID).textContent = newMode;
}

function getLeaderBoard() {
    document.getElementById(LEADERBOARD_ID).style.display = "block";
}

function hideLeader() {
    document.getElementById(LEADERBOARD_ID).style.display = "none";
}