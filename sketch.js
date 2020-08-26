// import Map from './map.js';

// map
const TILE_SIZE = 64;
const MAP_NUM_ROWS = 10;
const MAP_NUM_COLS = 16;
const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;
const MINIMAP_SCALE_FACTOR = 0.2;
// const VISION_ANGLE = 2*Math.PI ;
const VISION_ANGLE = Math.PI / 3;
const RAY_WIDTH = 2; // can be increased for optimization
const NUM_RAYS = WINDOW_WIDTH / RAY_WIDTH;
class Map {
    constructor() {
        this.grid = [
            [1, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 1],
            [2, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [2, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1]
        ];
        this.width = WINDOW_WIDTH;
        this.height = WINDOW_HEIGHT;
    }
    hasWallAt(x, y) {
        if (x <= 0 || y <= 0 || x > WINDOW_WIDTH || y > WINDOW_HEIGHT) return true;
        var i = Math.floor(x / TILE_SIZE)
        var j = Math.floor(y / TILE_SIZE)
        return this.grid[j][i];
    }

    render() {
        for (var i = 0; i < MAP_NUM_ROWS; i++) {
            for (var j = 0; j < MAP_NUM_COLS; j++) {
                var tileX = j * TILE_SIZE;
                var tileY = i * TILE_SIZE;
                var tileColor = this.grid[i][j] == 0 ? "#222" : "#fff";
                stroke("#222");
                fill(tileColor);
                rect(
                    MINIMAP_SCALE_FACTOR * tileX,
                    MINIMAP_SCALE_FACTOR * tileY,
                    MINIMAP_SCALE_FACTOR * TILE_SIZE,
                    MINIMAP_SCALE_FACTOR * TILE_SIZE
                );
            }
        }
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2;
        this.radius = 4;
        this.turnDirection = 0;      //-1 for left , 1 for right
        this.walkDirection = 0;      //-1 for back , 1 for front
        this.strafeDirection = 0;      //-1 for back , 1 for front
        this.rotationAngle =  Math.PI / 2;
        this.moveSpeed = 5.0;
        this.rotationSpeed = 3 * (Math.PI / 180)

    }
    update() {
        this.rotationAngle += this.turnDirection * this.rotationSpeed;
        // this.rotationAngle = normalizeAngle(this.rotationAngle)
        var moveStep = this.walkDirection * this.moveSpeed;

        var newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
        var newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;

        if (grid.hasWallAt(newPlayerX, newPlayerY) == 0) {
            this.x = newPlayerX;
            this.y = newPlayerY;
            // console.log(this);
        }
        if (this.strafeDirection) {

            var newX = this.x + this.strafeDirection * this.moveSpeed * Math.sin(this.rotationAngle);
            var newY = this.y + this.strafeDirection * this.moveSpeed * Math.cos(this.rotationAngle);
            if (grid.hasWallAt(newX, newY) !== 0) {
                this.x = newX;
                this.y = newY;
            }
        }
    }
    render() {
        noStroke();
        fill("blue");
        circle(
            MINIMAP_SCALE_FACTOR * this.x,
            MINIMAP_SCALE_FACTOR * this.y,
            MINIMAP_SCALE_FACTOR * this.radius
        );
        stroke("blue");
        line(
            MINIMAP_SCALE_FACTOR * this.x,
            MINIMAP_SCALE_FACTOR * this.y,
            MINIMAP_SCALE_FACTOR * (this.x + Math.cos(this.rotationAngle) * 30),
            MINIMAP_SCALE_FACTOR * (this.y + Math.sin(this.rotationAngle) * 30)
        );
    }
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.wasHitVertical = false;
        this.wallColor = 0;
        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;

        this.isRayFacingRight = this.rayAngle < 0.5 * Math.PI || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }
    cast() {
        var xintercept, yintercept;
        var xstep, ystep;

        ///////////////////////////////////////////
        // HORIZONTAL RAY-GRID INTERSECTION CODE
        ///////////////////////////////////////////
        var foundHorzWallHit = false;
        var horzWallHitX = 0;
        var horzWallHitY = 0;
        var horWallColor = 0

        // Find the y-coordinate of the closest horizontal grid intersenction
        yintercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        yintercept += this.isRayFacingDown ? TILE_SIZE : 0;

        // Find the x-coordinate of the closest horizontal grid intersection
        xintercept = player.x + (yintercept - player.y) / Math.tan(this.rayAngle);

        // Calculate the increment xstep and ystep
        ystep = TILE_SIZE;
        ystep *= this.isRayFacingUp ? -1 : 1;

        xstep = TILE_SIZE / Math.tan(this.rayAngle);
        xstep *= (this.isRayFacingLeft && xstep > 0) ? -1 : 1;
        xstep *= (this.isRayFacingRight && xstep < 0) ? -1 : 1;

        var nextHorzTouchX = xintercept;
        var nextHorzTouchY = yintercept;

        // Increment xstep and ystep until we find a wall
        while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
            if (grid.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0)) !== 0) {
                foundHorzWallHit = true;
                horzWallHitX = nextHorzTouchX;
                horzWallHitY = nextHorzTouchY;
                horWallColor = grid.hasWallAt(nextHorzTouchX, nextHorzTouchY - (this.isRayFacingUp ? 1 : 0))
                break;
            } else {
                nextHorzTouchX += xstep;
                nextHorzTouchY += ystep;
            }
        }

        ///////////////////////////////////////////
        // VERTICAL RAY-GRID INTERSECTION CODE
        ///////////////////////////////////////////
        var foundVertWallHit = false;
        var vertWallHitX = 0;
        var vertWallHitY = 0;
        var verWallColor = 0

        // Find the x-coordinate of the closest vertical grid intersenction
        xintercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        xintercept += this.isRayFacingRight ? TILE_SIZE : 0;

        // Find the y-coordinate of the closest vertical grid intersection
        yintercept = player.y + (xintercept - player.x) * Math.tan(this.rayAngle);

        // Calculate the increment xstep and ystep
        xstep = TILE_SIZE;
        xstep *= this.isRayFacingLeft ? -1 : 1;

        ystep = TILE_SIZE * Math.tan(this.rayAngle);
        ystep *= (this.isRayFacingUp && ystep > 0) ? -1 : 1;
        ystep *= (this.isRayFacingDown && ystep < 0) ? -1 : 1;

        var nextVertTouchX = xintercept;
        var nextVertTouchY = yintercept;

        // Increment xstep and ystep until we find a wall
        while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
            if (grid.hasWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY) !== 0) {
                foundVertWallHit = true;
                vertWallHitX = nextVertTouchX;
                vertWallHitY = nextVertTouchY;
                verWallColor = grid.hasWallAt(nextVertTouchX - (this.isRayFacingLeft ? 1 : 0), nextVertTouchY)
                break;
            } else {
                nextVertTouchX += xstep;
                nextVertTouchY += ystep;
            }
        }

        // Calculate both horizontal and vertical distances and choose the smallest value
        var horzHitDistance = (foundHorzWallHit)
            ? calculateDistance(player.x, player.y, horzWallHitX, horzWallHitY)
            : Number.MAX_VALUE;
        var vertHitDistance = (foundVertWallHit)
            ? calculateDistance(player.x, player.y, vertWallHitX, vertWallHitY)
            : Number.MAX_VALUE;

        // only store the smallest of the distances
        if (vertHitDistance < horzHitDistance) {
            this.wallHitX = vertWallHitX;
            this.wallHitY = vertWallHitY;
            this.distance = vertHitDistance;
            this.wallColor = verWallColor
            this.wasHitVertical = true;
        } else {
            this.wallHitX = horzWallHitX;
            this.wallHitY = horzWallHitY;
            this.distance = horzHitDistance;
            this.wallColor = horWallColor
            this.wasHitVertical = false;
        }
    }
    render() {
        stroke("rgba(255, 0, 0, 1.0)");
        line(
            MINIMAP_SCALE_FACTOR * player.x,
            MINIMAP_SCALE_FACTOR * player.y,
            MINIMAP_SCALE_FACTOR * this.wallHitX,
            MINIMAP_SCALE_FACTOR * this.wallHitY
        );
    }
}

var player = new Player()
var grid = new Map()
var rays = []

function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle = (2 * Math.PI) + angle;
    }
    return angle;
}

function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

}
function castAllRays() {

    var rayAngle = player.rotationAngle - (VISION_ANGLE / 2);

    rays = [];
    for (var i = 0; i < NUM_RAYS; i++) {
        var ray = new Ray(rayAngle);
        ray.cast()
        rays.push(ray);
        rayAngle += VISION_ANGLE / NUM_RAYS;
    }

}

function render3DProjectedWalls() {
    // loop every ray in the array of rays
    for (var i = 0; i < NUM_RAYS; i++) {
        var ray = rays[i];

        // get the perpendicular distance to the wall to fix fishbowl distortion
        var correctWallDistance = ray.distance
            * Math.cos(ray.rayAngle - player.rotationAngle);

        // calculate the distance to the projection plane
        var distanceProjectionPlane = (WINDOW_WIDTH / 2) / Math.tan(VISION_ANGLE / 2);

        // projected wall height
        var rayHeight = (TILE_SIZE / correctWallDistance) * distanceProjectionPlane;

        // compute the transparency based on the wall distance
        var alpha = 1.0; //170 / correctWallDistance;

        var alpha = 180 / correctWallDistance

        var alpha = ray.wasHitVertical ? 1 : 0.8;

        // render a rectangle with the calculated wall height
        // fill("rgba(" + color + "," + color/3 + "," + color/.3 + "," + alpha + ")");

        var colorR = ray.wallColor == 1 ? 108 : ray.wallColor == 2 ? 39 : ray.wallColor == 3 ? 60 : 255;
        var colorG = ray.wallColor == 1 ? 145 : ray.wallColor == 2 ? 145 : ray.wallColor == 3 ? 160 : 255;
        var colorB = ray.wallColor == 1 ? 70 : ray.wallColor == 2 ? 190 : ray.wallColor == 3 ? 100 : 255;
        noStroke();
        fill('#ccc')
        rect(i * RAY_WIDTH,
            0,
            RAY_WIDTH,
            (WINDOW_HEIGHT / 2) - (rayHeight / 2))
        fill("rgba(" + colorR + ", " + colorG + ", " + colorB + ", " + alpha + ")");
        rect(
            i * RAY_WIDTH,
            (WINDOW_HEIGHT / 2) - (rayHeight / 2),
            RAY_WIDTH,
            rayHeight
        );
        fill('#474747')
        rect(i * RAY_WIDTH,
            (WINDOW_HEIGHT - rayHeight) / 2 + rayHeight,
            RAY_WIDTH,
            WINDOW_HEIGHT /2)
    }
}


function setup() {
    // initialize all objects
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    // update game objects
    player.update()
    castAllRays()

}

function draw() {
    // render objects
    clear("#111");
    update();

    render3DProjectedWalls();
    // fill('#eee')

    grid.render()
    for (const ray of rays) {
        ray.render()
    }
    player.render()
}

// actions

function keyPressed() {
    // console.log(keyCode);
    switch (keyCode) {
        case UP_ARROW:
            player.walkDirection = +1
            break;
        case DOWN_ARROW:
            player.walkDirection = -1
            break;
        case RIGHT_ARROW:
            player.turnDirection = +1
            break;
        case LEFT_ARROW:
            player.turnDirection = -1
            break;
        case 33:
            player.strafeDirection = +1
            break;
        case 34:
            player.strafeDirection = -1
            break;

        default:
            break;
    }
}
function keyReleased() {
    switch (keyCode) {
        case UP_ARROW:
            player.walkDirection = 0;
            break;
        case DOWN_ARROW:
            player.walkDirection = 0;
            break;
        case RIGHT_ARROW:
            player.turnDirection = 0;
            break;
        case LEFT_ARROW:
            player.turnDirection = 0;
            break;
        case 33:
            player.strafeDirection = 0;
            break;
        case 34:
            player.strafeDirection = 0;
            break;


        default:
            break;
    }
}


// setup()


