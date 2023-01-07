let pos = 0;
let started = false;

const pacManImages = {
  forwardOpen: "./images/PacMan1.png",
  forwardClosed: "./images/PacMan2.png",
  backwardOpen: "./images/PacMan3.png",
  backwardClosed: "./images/PacMan4.png",
};

const startingPacManImage = pacManImages.forwardOpen;

const pacMen = [];

// This array holds all the pacmen
// This function returns an object with random values
function setToRandom(scale) {
  return { x: Math.random() * scale, y: Math.random() * scale };
}

// Factory to make a PacMan at a random position with random velocity
function makePac() {
  // returns an object with random values scaled {x: 33, y: 21}
  let velocity = setToRandom(10);

  // {x:?, y:?}
  let position = setToRandom(200);

  // Add image to div id = game
  var game = document.getElementById("game");
  let newimg = document.createElement("img");
  newimg.classList.add("pacMan");
  newimg.src = startingPacManImage;

  // set initial position here
  newimg.style.left = position.x;
  newimg.style.top = position.y;

  // add new Child image to game
  game.appendChild(newimg);

  // return details in an object
  let pacman = {
    position: position,
    velocity: velocity,
    isMovingLeft: true,
    isMovingDown: true,
    isMouthOpen: true,
    img: newimg,
  };

  return pacman;
}

function getImage(isMouthOpen, isMovingLeft) {
  if (isMouthOpen && isMovingLeft) return pacManImages.forwardOpen;
  if (!isMouthOpen && isMovingLeft) return pacManImages.forwardClosed;
  if (isMouthOpen && !isMovingLeft) return pacManImages.backwardOpen;
  if (!isMouthOpen && !isMovingLeft) return pacManImages.backwardClosed;
  return null;
}

const mouthVelocity = 3;
let mouthIteration = 0;
function update() {
  // loop over pacmen array and move each one and move image in DOM
  pacMen.forEach((pacman) => {
    // update position
    pacman.position = getNextPosition(pacman);
    pacman.img.style.left = pacman.position.x;
    pacman.img.style.top = pacman.position.y;
    pacman.img.src = getImage(pacman.isMouthOpen, pacman.isMovingLeft);

    // make him chomp
    if (mouthIteration >= mouthVelocity)
      pacman.isMouthOpen = !pacman.isMouthOpen;
  });

  // since this is recursive, check the mouth iteration each time
  if (mouthIteration >= mouthVelocity) {
    mouthIteration = 0;
  } else {
    mouthIteration++;
  }

  // iterate recursively
  setTimeout(update, 20);
}

function getNextPosition(pacman) {
  updateDirectionByScreenExtents(pacman);

  // arrange values for calc
  let xDirectionMultiplier = getXDirectionMultiplier(pacman);
  let yDirectionMultiplier = getYDirectionMultiplier(pacman);

  let xVelocity = pacman.velocity.x;
  let yVelocity = pacman.velocity.y;

  let xStart = pacman.position.x;
  let yStart = pacman.position.y;

  // log starting values
  console.log(`velocity x: ${xVelocity}, y: ${yVelocity}`);
  console.log(`position x: ${xStart}, y: ${yStart}`);

  // perform movement calc
  // note: setting the min value to the window extents pushes the pacmen back in the window on resize
  let x = Math.min(xDirectionMultiplier * xVelocity + xStart, window.innerWidth - 100);
  let y = Math.min(yDirectionMultiplier * yVelocity + yStart, window.innerHeight - 100);
  let newPos = { x, y };

  // log result
  console.log(`new pos x: ${newPos.x}, ${newPos.y}`);
  return newPos;
}

function getXDirectionMultiplier(pacman) {
  return pacman.isMovingLeft ? 1 : -1;
}
function getYDirectionMultiplier(pacman) {
  return pacman.isMovingDown ? 1 : -1;
}

function updateDirectionByScreenExtents(pacman) {
  // detect collision with all walls and make pacman bounce
  let changeNeeded = {
    x: pacman.position.x + 100 >= window.innerWidth || pacman.position.x < 0,
    y: pacman.position.y + 100 >= window.innerHeight || pacman.position.y < 0,
  };

  if (changeNeeded.x) pacman.isMovingLeft = !pacman.isMovingLeft;
  if (changeNeeded.y) pacman.isMovingDown = !pacman.isMovingDown;
}
function makeOne() {
  // add a new PacMan
  pacMen.push(makePac());
  if (!started) {
    started = true;
    update();
  }
}

//don't change this line
if (typeof module !== "undefined") {
  module.exports = {
    checkCollisions: updateDirectionByScreenExtents,
    update,
    pacMen,
  };
}
