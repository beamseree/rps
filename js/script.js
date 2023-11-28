const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let gameObjects = [];
let spawnAmount = 3;
let paused = false;
let globalSpeed = 1;
let selectedObject = null;
let numRocks = 0;
let numPapers = 0;
let numScissors = 0;
const zoomIncrement = [0.5, 1, 2, 4];
let zoomIndex = 1;
let zoom = zoomIncrement[zoomIndex];


// Start Button
document.getElementById('start').addEventListener('click', function () {
    paused = false;
    gameLoop();
});

// Stop Button
document.getElementById('stop').addEventListener('click', function () {
    paused = true;
});

// Reset Button
document.getElementById('reset').addEventListener('click', function () {
    resetGame();
    render()
});

const typeText = document.getElementById('type');
const pathText = document.getElementById('path');
const speedText = document.getElementById('speed');
const selectedImg = document.getElementById('selectedImg');
const selectedItem = document.getElementById('selected-item');

/**
 * Updates the information displayed for the selected object.
 * It sets the type, path, and speed information in the UI and updates the image source.
 */
function updateSelectedObject() {
    if (selectedObject) {
        typeText.innerHTML = capitalizeFirstLetter(selectedObject.type);
        pathText.innerHTML = "Path: " + selectedObject.path.join(" -> ");
        speedText.innerHTML = "Speed: " + Math.sqrt(selectedObject.speedX * selectedObject.speedX + selectedObject.speedY * selectedObject.speedY).toFixed(2);
        selectedImg.src = "./img/" + selectedObject.type + ".png";
    }
}

// Handle mouse clicks on the canvas
canvas.addEventListener('click', function (event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    for (let obj of gameObjects) {
        if (isOverlapping({ x: mouseX, y: mouseY }, obj, (20 * zoom))) {
            selectedItem.style.display = 'flex';
            selectedObject = obj;
            updateSelectedObject()
        }
    }
});

/**
 * Capitalizes the first letter of a given string.
 * @param {string} string - The string to capitalize.
 * @return {string} The string with the first letter capitalized.
 */
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

var speedSlider = document.getElementById('speedSlider');
var speedValue = document.getElementById('speedValue');

// Display the default slider value
speedValue.innerHTML = speedSlider.value;

// Update the current slider value (each time you drag the slider handle)
speedSlider.oninput = function () {
    speedValue.innerHTML = this.value;
    globalSpeed = this.value;
}

var numSlider = document.getElementById('numSlider');
var numValue = document.getElementById('numValue');

// Display the default slider value
numValue.innerHTML = numSlider.value;

// Update the current slider value (each time you drag the slider handle)
numSlider.oninput = function () {
    numValue.innerHTML = this.value;
    spawnAmount = this.value;
}

/**
 * Represents a game object in the simulation.
 * Each object has a type (rock, paper, or scissors), coordinates (x, y),
 * speed in both the x and y directions, and a path history.
 * 
 * Methods:
 * - draw(): Renders the object on the canvas with an image based on its type.
 * - updateType(type): Changes the object's type and updates its path history.
 * - update(): Updates the object's position based on its speed and handles
 *   border collision by reversing speed when hitting canvas edges.
 * 
 * Properties:
 * - type: The type of the object (rock, paper, or scissors).
 * - x, y: The current position of the object on the canvas.
 * - speedX, speedY: The object's current speed in the horizontal and vertical directions.
 * - path: An array representing the path history of the object, storing each type change.
 */
class GameObject {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.speedX = Math.random() * 2 - 1; // Random horizontal speed
        this.speedY = Math.random() * 2 - 1; // Random vertical speed
        this.path = [capitalizeFirstLetter(type)]
    }

    draw() {
        const image = new Image();
        image.src = `./img/${this.type}.png`;

        ctx.drawImage(image, this.x - (20 * zoom), this.y - (20 * zoom), (40 * zoom), (40 * zoom));
    }

    updateType(type) {
        this.path.push(capitalizeFirstLetter(type));
        this.type = type;
    }

    update() {
        // Update position
        this.x += this.speedX * globalSpeed * zoom;
        this.y += this.speedY * globalSpeed * zoom;

        // Collision with canvas borders
        if (this.x < (20 * zoom) || this.x > canvas.width - (20 * zoom)) this.speedX *= -1;
        if (this.y < (20 * zoom) || this.y > canvas.height - (20 * zoom)) this.speedY *= -1;
    }
}

/**
 * Checks for a collision between two game objects and handles the aftermath.
 * In case of a collision, it changes the type of the losing object according to
 * the game's rules (rock beats scissors, scissors beat paper, paper beats rock).
 * Also swaps their velocities to simulate a bounce effect.
 * 
 * @param {GameObject} obj1 - The first game object.
 * @param {GameObject} obj2 - The second game object.
 */
function checkCollision(obj1, obj2) {
    if (isOverlapping(obj1, obj2, (40 * zoom))) {
        // Handle type change
        if ((obj1.type === 'rock' && obj2.type === 'scissors') ||
            (obj1.type === 'scissors' && obj2.type === 'paper') ||
            (obj1.type === 'paper' && obj2.type === 'rock')) {
            obj2.updateType(obj1.type);
        } else if ((obj2.type === 'rock' && obj1.type === 'scissors') ||
            (obj2.type === 'scissors' && obj1.type === 'paper') ||
            (obj2.type === 'paper' && obj1.type === 'rock')) {
            obj1.updateType(obj2.type);
        }

        // Handle bounce
        const tempSpeedX = obj1.speedX;
        const tempSpeedY = obj1.speedY;
        obj1.speedX = obj2.speedX;
        obj1.speedY = obj2.speedY;
        obj2.speedX = tempSpeedX;
        obj2.speedY = tempSpeedY;
    }
}

/**
 * Checks if two objects are overlapping within a certain distance.
 * @param {Object} obj1 - The first object with x and y coordinates.
 * @param {Object} obj2 - The second object with x and y coordinates.
 * @param {number} detectDist - The distance within which to detect overlap.
 * @return {boolean} True if objects are overlapping, false otherwise.
 */
function isOverlapping(obj1, obj2, detectDist) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < detectDist;
}

/**
 * Creates a new GameObject ensuring it doesn't overlap with existing ones.
 * @param {string} type - The type of the GameObject (rock, paper, or scissors).
 * @return {GameObject} The newly created GameObject.
 */
function createUniqueObject(type) {
    let overlap;
    let newObj;
    do {
        overlap = false;
        newObj = new GameObject(type, Math.random() * canvas.width, Math.random() * canvas.height);

        // Check for overlap with existing objects
        for (let obj of gameObjects) {
            if (isOverlapping(newObj, obj, (50 * zoom))) {
                overlap = true;
                break;
            }
        }
    } while (overlap);

    return newObj;
}

/**
 * Resets the game to its initial state.
 * Clears all game objects, resets zoom, and spawns new objects.
 */
function resetGame() {
    zoom = zoomIncrement[1];
    gameObjects = [];
    selectedObject = null;
    selectedItem.style.display = 'none';

    for (let i = 0; i < 3; i++) {
        const type = ['rock', 'paper', 'scissors'][i];
        for (let j = 0; j < spawnAmount; j++) {
            gameObjects.push(createUniqueObject(type));
        }
    }
}

/**
 * Checks if a win condition is met in the game and displays an alert if so.
 * Resets the game if a win condition is met.
 */
function checkWin() {
    if (numRocks === 0 && numPapers === 0) {
        alert('Scissors wins!');
        resetGame();
    } else if (numRocks === 0 && numScissors === 0) {
        alert('Paper wins!');
        resetGame();
    } else if (numPapers === 0 && numScissors === 0) {
        alert('Rock wins!');
        resetGame();
    }
}

/**
 * Main game loop function. 
 * Handles rendering and win checking, and continues the loop if not paused.
 */
function gameLoop() {
    if (paused) return;

    render()
    setTimeout(() => {
        checkWin();
    }, 1000);
    requestAnimationFrame(gameLoop);
}

/**
 * Renders the game state onto the canvas.
 * Clears the canvas and draws each object. Also updates collision and selection.
 */
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    numRocks = 0;
    numPapers = 0;
    numScissors = 0;

    updateSelectedObject();

    for (let obj of gameObjects) {
        obj.update();
        obj.draw();

        if (obj.type === 'rock') numRocks++;
        else if (obj.type === 'paper') numPapers++;
        else if (obj.type === 'scissors') numScissors++;

        for (let otherObj of gameObjects) {
            checkCollision(obj, otherObj);
        }
    }

    document.getElementById('rock').innerHTML = numRocks;
    document.getElementById('paper').innerHTML = numPapers;
    document.getElementById('scissors').innerHTML = numScissors;

    if (selectedObject) {
        ctx.strokeStyle = 'purple';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(selectedObject.x, selectedObject.y, (20 * zoom), 0, 2 * Math.PI);
        ctx.stroke();
    }
}

resetGame();
gameLoop();