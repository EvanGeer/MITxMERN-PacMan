// Setup constants
const pacManImages = {
  forwardOpen: "./images/PacMan1.png",
  forwardClosed: "./images/PacMan2.png",
  backwardOpen: "./images/PacMan3.png",
  backwardClosed: "./images/PacMan4.png",
};

// Tuning Constants
const mouthVelocity = 3; // controls chomp speed by number of movement iterations per chomp
const acceleration = 2;
const startingPacManImage = pacManImages.forwardOpen;
const bounceEfficiency = .95;

// This array holds all the pacmen
const pacMen = [];
function makeOne() {
  // add a new PacMan
  pacMen.push(makePac());
  if (!started) {
    started = true;
    updatePacMen();
  }
}

// Factory to make a PacMan at a random position with random velocity
let started = false;
function makePac() {
  // returns an object with random values scaled {x: 33, y: 21}
  let velocity = setToRandom(10);

  // gives each ball its own unique acceleration
  let dragCoefficient = Math.random() * (acceleration / 2.0);

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
    drag: dragCoefficient,
  };

  return pacman;
}


// core recursive function to animate the pacmen
let mouthIteration = 0;
function updatePacMen() {
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
  setTimeout(updatePacMen, 20);
}

// core movement logic
function getNextPosition(pacman) {
  
  // get the direction multiplier
  updateDirectionByScreenExtents(pacman);
  let xDirectionMultiplier = getXDirectionMultiplier(pacman);
  let yDirectionMultiplier = getYDirectionMultiplier(pacman);
  
  // get the velocity
  updateVelocityByAcceleration(pacman);
  let xVelocity = pacman.velocity.x;
  let yVelocity = pacman.velocity.y;

  // get the starting position
  let xStart = pacman.position.x;
  let yStart = pacman.position.y;
  console.log(`velocity x: ${xVelocity}, y: ${yVelocity}`);
  console.log(`position x: ${xStart}, y: ${yStart}`);

  // perform movement calc
  // note: setting the min value to the window extents pushes the pacmen back in the window on resize
  let x = Math.min(xDirectionMultiplier * xVelocity + xStart, window.innerWidth - 100);
  let y = Math.min(yDirectionMultiplier * yVelocity + yStart, window.innerHeight - 100);

  let newPos = { x, y };
  console.log(`new pos x: ${newPos.x}, ${newPos.y}`);

  return newPos;
}

function updateVelocityByAcceleration(pacman) {
  // when bouncing off the bottom, reduce the Y velocity by 20%
  if (isAtBottom(pacman)) pacman.velocity.y = bounceEfficiency * pacman.velocity.y;

  let dragAffectedAcceleration = acceleration - pacman.drag;
  if (pacman.isMovingDown) pacman.velocity.y += dragAffectedAcceleration;
  else pacman.velocity.y -= dragAffectedAcceleration;
}

function updateDirectionByScreenExtents(pacman) {
  // detect collision with all walls and make pacman bounce
  let changeNeeded = {
    x: isAtRight(pacman) || isAtLeft(pacman),
    y: isAtBottom(pacman) || isAtTop(pacman),
  };

  if (changeNeeded.x) pacman.isMovingLeft = !pacman.isMovingLeft;
  if (changeNeeded.y) pacman.isMovingDown = !pacman.isMovingDown;
}

// helper functions
const setToRandom = (scale) => ({ x: Math.random() * scale * 2, y: Math.random() * scale });
function getImage(isMouthOpen, isMovingLeft) {
  if (isMouthOpen && isMovingLeft) return pacManImages.forwardOpen;
  if (!isMouthOpen && isMovingLeft) return pacManImages.forwardClosed;
  if (isMouthOpen && !isMovingLeft) return pacManImages.backwardOpen;
  if (!isMouthOpen && !isMovingLeft) return pacManImages.backwardClosed;
  return null;
}

// pacman interpretter functions
const getXDirectionMultiplier = (pacman) => pacman.isMovingLeft ? 1 : -1;
const getYDirectionMultiplier = (pacman) => pacman.isMovingDown ? 1 : -1;
const isAtBottom = (pacman) => pacman.position.y + 100 >= window.innerHeight;
const isAtTop = (pacman) => pacman.position.y < 0;
const isAtLeft = (pacman) => pacman.position.x < 0;
const isAtRight = (pacman) => pacman.position.x + 100 >= window.innerWidth
