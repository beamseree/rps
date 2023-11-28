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

document.getElementById('zoomIn').addEventListener('click', function () {
    if (zoomIndex < zoomIncrement.length - 1) {
        zoomIndex++;
        zoom = zoomIncrement[zoomIndex];
        for (let obj of gameObjects) {
            obj.x *= 2;
            obj.y *= 2;
        }
    }
}
);

document.getElementById('zoomOut').addEventListener('click', function () {
    if (zoomIndex > 0) {
        zoomIndex--;
        zoom = zoomIncrement[zoomIndex];
        for (let obj of gameObjects) {
            obj.x /= 2;
            obj.y /= 2;
        }
    }
}
);

document.getElementById('start').addEventListener('click', function () {
    paused = false;
    gameLoop();
});

document.getElementById('stop').addEventListener('click', function () {
    paused = true;
});

document.getElementById('reset').addEventListener('click', function () {
    resetGame();
    render()
});

const typeText = document.getElementById('type');
const pathText = document.getElementById('path');
const speedText = document.getElementById('speed');
const selectedImg = document.getElementById('selectedImg');
const selectedItem = document.getElementById('selected-item');

function updateSelectedObject() {
    if (selectedObject) {
        typeText.innerHTML = capitalizeFirstLetter(selectedObject.type);
        pathText.innerHTML = "Path: " + selectedObject.path.join(" -> ");
        speedText.innerHTML = "Speed: " + Math.sqrt(selectedObject.speedX * selectedObject.speedX + selectedObject.speedY * selectedObject.speedY).toFixed(2);
        selectedImg.src = "./img/" + selectedObject.type + ".png";
    }
}

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

class GameObject {
    constructor(type, x, y, speedX, speedY, path) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.speedX = speedX;
        this.speedY = speedY;
        this.path = path;
    }

    draw() {
        const image = new Image();
        image.src = `./img/${this.type}.png`;

        ctx.drawImage(image, this.x - (20 * zoom), this.y - (20 * zoom), (40 * zoom), (40 * zoom));
    }

    update() {
        this.x += this.speedX * globalSpeed * zoom;
        this.y += this.speedY * globalSpeed * zoom;

        if (this.x < (20 * zoom) || this.x > canvas.width - (20 * zoom)) this.speedX *= -1;
        if (this.y < (20 * zoom) || this.y > canvas.height - (20 * zoom)) this.speedY *= -1;
    }
}

class Rock extends GameObject {
    constructor(x, y, path, speedX, speedY) {
        super('rock', x, y);
        this.path = path;
        this.speedX = speedX;
        this.speedY = speedY;
    }
}

class Paper extends GameObject {
    constructor(x, y, path, speedX, speedY) {
        super('paper', x, y);
        this.path = path;
        this.speedX = speedX;
        this.speedY = speedY;
    }
}

class Scissors extends GameObject {
    constructor(x, y, path, speedX, speedY) {
        super('scissors', x, y);
        this.path = path;
        this.speedX = speedX;
        this.speedY = speedY;
    }
}

function checkCollision(obj1, obj2) {
    if (isOverlapping(obj1, obj2, (40 * zoom))) {
        // Handle bounce
        const tempSpeedX = obj1.speedX;
        const tempSpeedY = obj1.speedY;
        obj1.speedX = obj2.speedX;
        obj1.speedY = obj2.speedY;
        obj2.speedX = tempSpeedX;
        obj2.speedY = tempSpeedY;

        // Handle type change
        if ((obj1.type === 'rock' && obj2.type === 'scissors') ||
            (obj1.type === 'scissors' && obj2.type === 'paper') ||
            (obj1.type === 'paper' && obj2.type === 'rock')) {

            if (obj1.type === 'rock') gameObjects.push(new Rock(obj2.x, obj2.y, obj2.path.push(capitalizeFirstLetter(obj1.type)), obj2.speedX, obj2.speedY));
            else if (obj1.type === 'paper') gameObjects.push(new Paper(obj2.x, obj2.y, obj2.path.push(capitalizeFirstLetter(obj1.type)), obj2.speedX, obj2.speedY));
            else if (obj1.type === 'scissors') gameObjects.push(new Scissors(obj2.x, obj2.y, obj2.path.push(capitalizeFirstLetter(obj1.type)), obj2.speedX, obj2.speedY));

            gameObjects.remove(obj2);
        } else if ((obj2.type === 'rock' && obj1.type === 'scissors') ||
            (obj2.type === 'scissors' && obj1.type === 'paper') ||
            (obj2.type === 'paper' && obj1.type === 'rock')) {
            if (obj2.type === 'rock') gameObjects.push(new Rock(obj1.x, obj1.y, obj1.path.push(capitalizeFirstLetter(obj2.type)), obj1.speedX, obj1.speedY));
            else if (obj2.type === 'paper') gameObjects.push(new Paper(obj1.x, obj1.y, obj1.path.push(capitalizeFirstLetter(obj2.type)), obj1.speedX, obj1.speedY));
            else if (obj2.type === 'scissors') gameObjects.push(new Scissors(obj1.x, obj1.y, obj1.path.push(capitalizeFirstLetter(obj2.type)), obj1.speedX, obj1.speedY));

            gameObjects.remove(obj1);
        }


    }
}

function isOverlapping(obj1, obj2, detectDist) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < detectDist; 
}

function createUniqueObject(type) {
    let overlap;
    let newObj;
    do {
        overlap = false;
        if (type === 'rock') newObj = new Rock(Math.random() * canvas.width, Math.random() * canvas.height, ['Rock'], Math.random() * 2 - 1, Math.random() * 2 - 1);
        else if (type === 'paper') newObj = new Paper(Math.random() * canvas.width, Math.random() * canvas.height, ['Paper'], Math.random() * 2 - 1, Math.random() * 2 - 1);
        else if (type === 'scissors') newObj = new Scissors(Math.random() * canvas.width, Math.random() * canvas.height, ['Scissors'], Math.random() * 2 - 1, Math.random() * 2 - 1);

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

function gameLoop() {
    if (paused) return;

    render()
    setTimeout(() => {
        checkWin();
    }, 1000);
    requestAnimationFrame(gameLoop);
}

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