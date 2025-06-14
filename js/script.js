const scoreEl = document.querySelector('#scoreEl')
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.width = 1024
canvas.height = 576

class Player {
  constructor() {
    this.velocity = {
      x: 0,
      y: 0
    }
    this.rotation = 0
    this.opacity = 1

    const image = new Image()
    image.src = '../assets/images/spaceship.png'
    image.onload = () => {
      const scale = 0.15
      this.image = image
      this.width = image.width * scale
      this.height = image.height * scale
      this.position = {
        x: canvas.width / 2 - this.width / 2,
        y: canvas.height - this.height - 20
      }
    }
  }    
    
  draw() {
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.translate(
      player.position.x + player.width / 2, 
      player.position.y + player.height / 2)
    ctx.rotate(this.rotation)
    ctx.translate(
      -player.position.x - player.width / 2, 
      -player.position.y - player.height / 2)
    ctx.drawImage(
      this.image, 
      this.position.x, 
      this.position.y, 
      this.width, 
      this.height)
    ctx.restore()
  }
  update() {
    if (this.image) {
      this.draw()
      this.position.x += this.velocity.x
    }
  }
}

class Projectile {
  constructor({ position, velocity }) {
    this.position = position
    this.velocity = velocity
    this.radius = 4
  }
  draw() {
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = '#ff4500'
    ctx.fill()
    ctx.closePath()
  }
  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
}

class Particle {
  constructor({ position, velocity, radius, colour, fades }) {
    this.position = position
    this.velocity = velocity
    this.radius = radius
    this.colour = colour
    this.opacity = 1
    this.fades = fades
  }
  draw() {
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.colour
    ctx.fill()
    ctx.closePath()
    ctx.restore()
  }
  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
    if (this.fades) this.opacity -= 0.01
  }
}

class InvaderProjectile {
  constructor({ position, velocity }) {
    this.position = position
    this.velocity = velocity
    this.width = 3
    this.height = 10
  }
  draw() {
    ctx.fillStyle = 'ffd700'
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y
  }
}

class Invader {
  constructor({ position }) {
    this.velocity = {
      x: 0,
      y: 0
    }
    const image = new Image()
    image.src = '../assets/images/invader.png'
    image.onload = () => {
      const scale = 1
      this.image = image
      this.width = image.width * scale
      this.height = image.height * scale
      this.position = { 
        x: position.x,
        y: position.y
      }
    }
  }    
  draw() {
    ctx.drawImage(
        this.image, 
        this.position.x, 
        this.position.y, 
        this.width, 
        this.height
    )
  }
  update({ velocity }) {
    if (this.image) {
      this.draw()
      this.position.x += velocity.x
      this.position.y += velocity.y
    }
  }
  shoot(invaderProjectiles) {
    invaderProjectiles.push(
      new InvaderProjectile({
        position: {
          x: this.position.x + this.width / 2,
          y: this.position.y + this.height
        },
        velocity: {
          x: 0,
          y: 5
        }
      })
    )
  }
}

class Grid {
  constructor() {
    this.position = {
      x: 0,
      y: 0 
    }
    this.velocity = {
      x: 3,
      y: 0
    }
    this.invaders = []
    
    const columns = Math.floor(Math.random() * 10 + 5)
    const rows = Math.floor(Math.random() * 5 + 2)
    this.width = columns * 30

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        this.invaders.push(
          new Invader({
            position: {
              x: x * 30,
              y: y * 30
            }
          })
        )
      }
    }
  }
  update() {
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y   
    this.velocity.y = 0;

    if (this.position.x + this.width >= canvas.width ||
      this.position.x <= 0) {
      this.velocity.x = -this.velocity.x
      this.velocity.y = 30
    }
  }
}

class Bomb {
  static radius = 30    
  constructor({ position, velocity }) {
    this.position = position
    this.velocity = velocity
    this.radius = 30
    this.colour = '#ffd700'
  }
  draw() {
    ctx.beginPath()
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    ctx.closePath()
    ctx.fillStyle = this.colour
    ctx.fill()
  }
  update() {
    this.draw()
    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    if (this.position.x + this.radius + this.velocity.x >= canvas.width || this.position.x - this.radius + this.velocity.x <= 0) {
      this.velocity.x = -this.velocity.x 
    } else if (this.position.y + this.radius + this.velocity.y >= canvas.height || this.position.y - this.radius + this.velocity.y <= 0) {
      this.velocity.y = -this.velocity.y
    }
  }
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

const player = new Player()
const projectiles = []
const grids = []
const invaderProjectiles = []
const particles = []

const bombs = [
  new Bomb({
    position: {
      x: randomBetween(Bomb.radius, canvas.width - Bomb.radius),
      y: randomBetween(Bomb.radius, canvas.height - Bomb.radius)
    },
    velocity: {
      x: (Math.random() - 0.5) * 6,
      y: (Math.random() - 0.5) * 6
    }
  }),
  new Bomb({
    position: {
      x: randomBetween(Bomb.radius, canvas.width - Bomb.radius),
      y: randomBetween(Bomb.radius, canvas.height - Bomb.radius)
    },
    velocity: {
      x: (Math.random() - 0.5) * 6,
      y: (Math.random() - 0.5) * 6
    }
  }),
]

const keys = {
  o: {
    pressed: false
  },
  p: {
    pressed: false
  },
  space: {
    pressed: false
  }
}

let frames = 0
let score = 0
let randomInterval = Math.floor(Math.random() * 500 + 500)
let game = {
  over: false,
  active: true
}

for (let i = 0; i < 100; i++) {
  particles.push(new Particle({
    position: {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height
    },
    velocity: {
      x: 0,
      y: 0.3        
    },
    radius: Math.random() * 2,
    colour: '#ffffff'       
  }))
}

function createParticles({ object, colour, fades }) {
  for (let i = 0; i < 15; i++) {
    particles.push(new Particle({
      position: {
        x: object.position.x + object.width / 2,
        y: object.position.y + object.height / 2
      },
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2          
      },
      radius: Math.random() * 3,
      colour: colour || '#baa0de',
      fades
    }))
  }
}

function animate() {
  if (!game.active) return
  requestAnimationFrame(animate)
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  for (let i = bombs.length - 1; i >= 0; i--) {
    const bomb = bombs[i]
    bomb.update()
  }

  player.update()
  particles.forEach((particle, i) => {
    if (particle.position.y - particle.radius >= canvas.height) {
      particle.position.x = Math.random() * canvas.width
      particle.position.y = particle.radius
    }
    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(i, 1)
      }, 0)
    } else {
      particle.update()
    }
  })

  invaderProjectiles.forEach((invaderProjectile, index) => {
    if (invaderProjectile.position.y + invaderProjectile.height >= canvas.height) {
      setTimeout(() => {
        invaderProjectiles.splice(index, 1)
      }, 0)
    } else invaderProjectile.update()

    if (
      invaderProjectile.position.y + invaderProjectile.height >= player.position.y &&
      invaderProjectile.position.x + invaderProjectile.width >= player.position.x &&
      invaderProjectile.position.x <= player.position.x + player.width
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1)
        player.opacity = 0
        game.over = true
      }, 0)
      setTimeout(() => {
        game.active = false
      }, 2000)
      createParticles({
        object: player,
        colour: 'ff4500',
        fades: true
      })
    }
  })

  projectiles.forEach((projectile, index) => {
    if (projectile.position.y + projectile.radius <= 0) {
      setTimeout(() => {
        projectiles.splice(index, 1)
      }, 0)
    } else {
      projectile.update()
    }
  })

  grids.forEach((grid, gridIndex) => {
    grid.update()
    
    if (frames % 100 === 0 && grid.invaders.length > 0) {
      grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(invaderProjectiles)
    }

    grid.invaders.forEach((invader, i) => {
      invader.update({ velocity: grid.velocity })

      projectiles.forEach((projectile, j) => {
        if (projectile.position.y - projectile.radius <= invader.position.y + invader.height &&
            projectile.position.x + projectile.radius >= invader.position.x &&
            projectile.position.x - projectile.radius <= invader.position.x + invader.width &&
            projectile.position.y + projectile.radius >= invader.position.y) {
          setTimeout(() => {
            const invaderFound = grid.invaders.find((invader2) => invader2 === invader)
            const projectileFound = projectiles.find((projectiles2) => projectiles2 === projectile)

            if (invaderFound && projectileFound) {
              score += 100
              scoreEl.innerHTML = score
              const scoreLabel = document.createElement('label')
              scoreLabel.innerHTML = 100
              scoreLabel.style.position = 'absolute'
              scoreLabel.style.colour = '#ffffff'
              scoreLabel.style.top = invader.position.y + 'px'
              scoreLabel.style.left = invader.position.x + 'px'
              scoreLabel.style.userSelect = 'none'
              document.querySelector('#parentDiv').appendChild(scoreLabel)

              gsap.to(scoreLabel, {
                opacity: 0,
                y: -30,
                duration: 0.75,
                onComplete: () => {
                  document.querySelector('#parentDiv').removeChild(scoreLabel)
                }
              })

              createParticles({
                object: invader,
                fades: true
              })
              grid.invaders.splice(i, 1);
              projectiles.splice(j, 1);

              if (grid.invaders.length > 0) {
                const firstInvader = grid.invaders[0];
                const lastInvader = grid.invaders[grid.invaders.length - 1];
                grid.width = lastInvader.position.x - firstInvader.position.x + lastInvader.width
                grid.position.x = firstInvader.position.x
              } else {
                grids.splice(gridIndex, 1)
              }
            }
          }, 0)
        }
      })
    })
  })

  if (keys.o.pressed && player.position.x >= 0) {
    player.velocity.x = -7
    player.rotation = -0.15
  } else if (keys.p.pressed && player.position.x + player.width <= canvas.width) {
    player.velocity.x = 7
    player.rotation = 0.15
  } else {
    player.velocity.x = 0
    player.rotation = 0
  }

  if (frames % randomInterval === 0) {
    grids.push(new Grid())
    randomInterval = Math.floor(Math.random() * 500 + 500)
    frames = 0
  }
  frames++
}
                
animate()

addEventListener('keydown', ({ key }) => {
  if (game.over) return
  switch (key) {
    case 'o':    
    keys.o.pressed = true
    break
  case 'p':
    keys.p.pressed = true
    break
  case ' ':
    projectiles.push(new Projectile({
      position: {
        x: player.position.x + player.width / 2,
        y: player.position.y
      },
      velocity: {
        x: 0,
        y: -10
      }
    }))
    break
  }
})

addEventListener('keyup', ({ key }) => {
  switch (key) {
    case 'o':
      keys.o.pressed = false;
      break
    case 'p':
      keys.p.pressed = false;
      break
    case ' ':
      break
  }
})