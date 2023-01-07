// Setup constants
const spriteImages = {
  forwardOpen: "./images/sprite1.png",
  forwardClosed: "./images/sprite2.png",
  backwardOpen: "./images/sprite3.png",
  backwardClosed: "./images/sprite4.png",
};

// Tuning Constants
const updateSpeed_MS = 20;  // (i.e. updates per ms)
const mouthVelocity = 3;    // controls chomp speed by number of movement iterations per chomp
const acceleration = 2;
const startingspriteImage = spriteImages.forwardOpen;
const bounceEfficiency = .95;
const jumpVelocity = 40;

// This array holds all the sprite
const sprites = [];
var pacMenBeaten = 0;
var kirbysEaten = 0;

// Main function to execute in html
function makeOne(spriteName = 'pacman') {
  // add a new sprite
  sprites.push(makeSprite(spriteName));

  if (!started) {
    started = true;
    updateSprites();
  }
}

// Factory to make a sprite at a random position with random velocity
let started = false;
function makeSprite(spriteName) {
  // returns an object with random values scaled {x: 33, y: 21}
  let velocity = setToRandom(10);

  // gives each ball its own unique acceleration
  let dragCoefficient = Math.random() * (acceleration / 2.0);

  // {x:?, y:?}
  let position = setToRandom(200);

  // Add image to div id = game
  var game = document.getElementById("game");
  let newimg = document.createElement("img");
  newimg.classList.add("sprite");
  newimg.src = startingspriteImage;
  
  // set initial position here
  newimg.style.left = position.x;
  newimg.style.top = position.y;
  
  // add new Child image to game
  game.appendChild(newimg);
  
  // return details in an object
  let sprite = {
    position: position,
    velocity: velocity,
    isMovingLeft: Math.random() > 0.5,
    isMovingDown: true,
    isMouthOpen: true,
    img: newimg,
    drag: dragCoefficient,
    name: spriteName,
    poof: false,
  };

  return sprite;
}


// core recursive function to animate the sprite
let mouthIteration = 0;
function updateSprites() {
  
  evaluateWinners();
  document.getElementById('pacMenBeaten').textContent = pacMenBeaten;
  document.getElementById('kirbysEaten').textContent = kirbysEaten;

  // loop over sprite array and move each one and move image in DOM
  sprites.filter(x => !x.poof).forEach((sprite) => {
    // update position
    sprite.position = getNextPosition(sprite);
    sprite.img.style.left = sprite.position.x;
    sprite.img.style.top = sprite.position.y;
    sprite.img.src = getImage(sprite);

    // make him chomp
    if (mouthIteration >= mouthVelocity)
      sprite.isMouthOpen = !sprite.isMouthOpen;
  });

  // since this is recursive, check the mouth iteration each time
  if (mouthIteration >= mouthVelocity) {
    mouthIteration = 0;
    sprites.filter(x => x.poof).forEach((sprite) => {
      sprite.img.remove();
    })
  } else {
    mouthIteration++;
  }

  // iterate recursively
  setTimeout(updateSprites, updateSpeed_MS);
}

function jump(sprite) {
  sprite.velocity.y = jumpVelocity;
  sprite.isMovingDown = false;
}

function jumpAll() {
  sprites
    .filter(p => p.isMovingDown || isAtBottom(p))
    .forEach(p => jump(p));
}

// core movement logic
function getNextPosition(sprite) {
  
  // get the direction multiplier
  updateDirectionByScreenExtents(sprite);
  let xDirectionMultiplier = getXDirectionMultiplier(sprite);
  let yDirectionMultiplier = getYDirectionMultiplier(sprite);
  
  // get the velocity
  updateVelocityByAcceleration(sprite);
  let xVelocity = sprite.velocity.x;
  let yVelocity = sprite.velocity.y;

  // get the starting position
  let xStart = sprite.position.x;
  let yStart = sprite.position.y;
  console.log(`velocity x: ${xVelocity}, y: ${yVelocity}`);
  console.log(`position x: ${xStart}, y: ${yStart}`);

  // perform movement calc
  // note: setting the min value to the window extents pushes the sprite back in the window on resize
  let x = Math.min(xDirectionMultiplier * xVelocity + xStart, window.innerWidth - 100);
  let y = Math.min(yDirectionMultiplier * yVelocity + yStart, window.innerHeight - 100);

  let newPos = { x, y };
  console.log(`new pos x: ${newPos.x}, ${newPos.y}`);

  return newPos;
}

function updateVelocityByAcceleration(sprite) {
  // when bouncing off the bottom, reduce the Y velocity by 20%
  if (isAtBottom(sprite)) sprite.velocity.y = bounceEfficiency * sprite.velocity.y;

  let dragAffectedAcceleration = acceleration - sprite.drag;
  if (sprite.isMovingDown) sprite.velocity.y += dragAffectedAcceleration;
  else sprite.velocity.y -= dragAffectedAcceleration;
}

function updateDirectionByScreenExtents(sprite) {
  // detect collision with all walls and make sprite bounce
  let changeNeeded = {
    x: isAtRight(sprite) || isAtLeft(sprite),
    y: isAtBottom(sprite) || isAtTop(sprite),
  };

  if (changeNeeded.x) sprite.isMovingLeft = !sprite.isMovingLeft;
  if (changeNeeded.y) sprite.isMovingDown = !sprite.isMovingDown;
}

function evaluateWinners() {
  // PacMan has the upper hand since he's evaluated first
  // if a sprite isMouthOpen and near another sprite, that sprite wins
  // ToDo: a nice future enhancement would to add an evaluation for facing direction

  let pacMen = sprites.filter(x => !x.poof && x.name === 'pacman');
  let kirbys = sprites.filter(x => !x.poof && x.name === 'kirby');

  pacMen.filter(p => p.isMouthOpen).forEach(pacman => {
    let losingKirbys = kirbys.filter(kirby => 
      kirby.position.x <= pacman.position.x - 15 
      && kirby.position.x >= pacman.position.x - 85
      && kirby.position.y <= pacman.position.y - 15
      && kirby.position.y >= pacman.position.y - 85
      );

    if (losingKirbys.length > 0)
    {
      losingKirbys.forEach(sprite => {
        sprite.img.src = 'images/poof.png';
        sprite.poof = true;
        sprite.img.classList.remove('sprite');
        sprite.img.classList.add('poof');
        kirbysEaten++;
      });
    }
  })

  kirbys.filter(k => k.isMouthOpen).forEach(kirby => {
    let losingPacMen = pacMen.filter(pacman => 
      pacman.name === 'pacman'
      && !pacman.isMouthOpen
      && pacman.position.x <= kirby.position.x - 15 
      && pacman.position.x >= kirby.position.x - 85
      && pacman.position.y <= kirby.position.y - 15
      && pacman.position.y >= kirby.position.y - 85
      );

    if (losingPacMen.length > 0)
    {
      losingPacMen.forEach(sprite => {
        sprite.img.src = 'images/poof.png';
        sprite.poof = true;
        sprite.img.classList.remove('sprite');
        sprite.img.classList.add('poof');
        pacMenBeaten++;
      });
    }
  })
}

// helper functions
const setToRandom = (scale) => ({ x: Math.random() * scale * 2, y: Math.random() * scale });
const getSelectedSprite = () => document.getElementById("sprite").value;

// sprite interpretter functions
const getXDirectionMultiplier = (sprite) => sprite.isMovingLeft ? 1 : -1;
const getYDirectionMultiplier = (sprite) => sprite.isMovingDown ? 1 : -1;
const isAtBottom = (sprite) => sprite.position.y + 100 >= window.innerHeight;
const isAtTop = (sprite) => sprite.position.y < 0;
const isAtLeft = (sprite) => sprite.position.x < 0;
const isAtRight = (sprite) => sprite.position.x + 100 >= window.innerWidth
function getImage(sprite) {
  if (sprite.isMouthOpen && sprite.isMovingLeft) return `images/${sprite.name}/rightOpen.png`;
  if (!sprite.isMouthOpen && sprite.isMovingLeft) return `images/${sprite.name}/rightClosed.png`;
  if (sprite.isMouthOpen && !sprite.isMovingLeft) return `images/${sprite.name}/leftOpen.png`;
  if (!sprite.isMouthOpen && !sprite.isMovingLeft) return `images/${sprite.name}/leftClosed.png`;
  return null;
}
