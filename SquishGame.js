let spriteSheetFilenames = ["AmongUs2.png", "Bug_To_Squish.png"];
let spriteSheets = [];
let animations = [];
let amongUsSprite;
let forestbackground;

const GameState = {
    Start: "Start",
    Playing: "Playing",
    GameOver: "GameOver",
};

let game = {
    score: 0,
    maxScore: 0,
    maxTime: 30,
    elapsedTime: 0,
    totalSprites: 30,
    amongUsSprites: 5,
    state: GameState.Start,
    targetSprite: 1,
    squished: 0,
};

function preload() {
    for (let i = 0; i < spriteSheetFilenames.length; i++) {
        spriteSheets[i] = loadImage("assets/" + spriteSheetFilenames[i]);
    }
    forestbackground = loadImage("assets/forest.jpg");
}

function setup() {
    createCanvas(800, 600);
    imageMode(CENTER);
    angleMode(DEGREES);

    reset();
}

function reset() {
    game.elapsedTime = 0;
    game.score = 0;
    game.totalSprites = random(20, 40);
    game.amongUsSprites = random(5, 8);
    game.squished = 0;

    animations = [];
    let i = 0;
    for (i; i < game.totalSprites; i++) {
        animations[i] = new WalkingAnimation(
            spriteSheets[1],
            32,
            32,
            random(100, 700),
            random(100, 500),
            4,
            random(1, 2),
            6,
            random([0, 1]),
            0,
            0,
            3
        );
    }

    for (let k = 0; k < game.amongUsSprites; k++) {
        animations[i + k] = new WalkingAnimation(
            spriteSheets[0],
            128,
            128,
            random(100, 700),
            random(100, 500),
            8,
            random(1, 1.5),
            6,
            (vertical = 0),
            128,
            0,
            1
        );
    }
}

function draw() {
    switch (game.state) {
        case GameState.Playing:
            image(forestbackground, 400, 300);

            for (let i = 0; i < animations.length; i++) {
                animations[i].draw();
            }
            fill(255);
            textSize(40);
            text("Score: " + game.score, 80, 40);
            let currentTime = game.maxTime - game.elapsedTime;
            text("Time: " + ceil(currentTime), 700, 40);
            game.elapsedTime += deltaTime / 1000;

            if (currentTime < 0) game.state = GameState.GameOver;
            break;
        case GameState.GameOver:
            game.maxScore = max(game.score, game.maxScore);

            background(0);
            fill(255);
            textSize(40);
            textAlign(CENTER);
            text("Game Over!", 400, 300);
            textSize(35);
            text("Score: " + game.score, 400, 370);
            text("Max Score: " + game.maxScore, 400, 420);
            text("Press Any Key to Restart", 400, 470);
            break;
        case GameState.Start:
            background(0);
            fill(255);
            textSize(50);
            textAlign(CENTER);
            text("Bug Squish Game", 400, 300);
            textSize(30);
            text("Press Any Key to Start", 400, 370);
            textSize(25);
            text("Avoid the Imposter!", 400, 420);
            break;
    }
}

function keyPressed() {
    switch (game.state) {
        case GameState.Start:
            game.state = GameState.Playing;
            break;
        case GameState.GameOver:
            reset();
            game.state = GameState.Playing;
            break;
    }
}

function mousePressed() {
    switch (game.state) {
        case GameState.Playing:
            for (let i = 0; i < animations.length; i++) {
                let contains = animations[i].contains(mouseX, mouseY);
                if (contains) {
                    if (animations[i].moving != 0) {
                        animations[i].stop();
                        if (
                            animations[i].spritesheet ===
                            spriteSheets[game.targetSprite]
                        )
                            game.score += 1;
                        else game.score -= 1;
                    } else {
                        if (animations[i].xDirection === 1)
                            animations[i].moveRight();
                        else animations[i].moveLeft();
                    }
                }
            }
            break;
    }
}

class WalkingAnimation {
    constructor(
        spritesheet,
        sw,
        sh,
        dx,
        dy,
        animationLength,
        speed,
        framerate,
        vertical = false,
        offsetX = 0,
        offsetY = 0,
        scaling = 1
    ) {
        this.spritesheet = spritesheet;
        this.sw = sw;
        this.sh = sh;
        this.dx = dx;
        this.dy = dy;
        this.u = 0;
        this.v = 0;
        this.animationLength = animationLength;
        this.currentFrame = 0;
        this.moving = 1;
        this.xDirection = 1;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.speed = speed;
        this.framerate = framerate * speed;
        this.vertical = vertical;
        this.scaling = scaling;
        this.dead = 0;
    }

    draw() {
        this.u =
            this.moving != 0
                ? this.currentFrame % this.animationLength
                : this.u;
        push();
        translate(this.dx, this.dy);
        if (this.vertical) rotate(90);
        scale(this.xDirection * this.scaling, this.scaling);

        //rect(-26,-35,50,70);

        image(
            this.spritesheet,
            0,
            0,
            this.sw,
            this.sh,
            this.u * this.sw + this.offsetX,
            this.v * this.sh + this.offsetY,
            this.sw,
            this.sh
        );
        pop();
        let proportionalFramerate = round(frameRate() / this.framerate);
        if (frameCount % proportionalFramerate == 0) {
            this.currentFrame++;
        }

        if (this.vertical) {
            this.dy += this.moving * this.speed * (game.squished * 0.15 + 1);
            this.move(this.dy, this.sw, height - this.sw);
        } else {
            this.dx += this.moving * this.speed * (game.squished * 0.15 + 1);
            if (this.spritesheet === spriteSheets[0]) {
                this.move(this.dx, this.sw - 80, width - this.sw + 80);
            } else {
                this.move(this.dx, this.sw, width - this.sw);
            }
        }
    }

    move(position, lowerBounds, upperBounds) {
        if (position > upperBounds) {
            this.moveLeft();
        } else if (position < lowerBounds) {
            this.moveRight();
        }
    }

    moveRight() {
        this.moving = 1;
        this.xDirection = 1;
        this.v = 0;
    }

    moveLeft() {
        this.moving = -1;
        this.xDirection = -1;
        this.v = 0;
    }

    keyPressed(right, left) {
        if (keyCode === right) {
            this.currentFrame = 1;
        } else if (keyCode === left) {
            this.currentFrame = 1;
        }
    }

    keyReleased(right, left) {
        if (keyCode === right || keyCode === left) {
            this.moving = 0;
        }
    }

    contains(x, y) {
        //rect(-26,-35,50,70);
        if (this.dead) {
            return 0;
        }
        let insideX = x >= this.dx - 26 && x <= this.dx + 25;
        let insideY = y >= this.dy - 35 && y <= this.dy + 35;
        return insideX && insideY;
    }

    stop() {
        this.moving = 0;
        game.squished++;
        this.dead = 1;
        if (this.spritesheet === spriteSheets[0]) {
            this.u = 1;
            this.v = 1;
        } else if (this.spritesheet === spriteSheets[1]) {
            this.u = 4;
            this.v = 0;
        }
    }
}
