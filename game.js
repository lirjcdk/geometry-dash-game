const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const scoreEl = document.querySelector('#score');
const bestEl = document.querySelector('#best-score');
const startScreen = document.querySelector('#start-screen');
const gameOver = document.querySelector('#game-over');
const finalScore = document.querySelector('#final-score');

const W = canvas.width, H = canvas.height;
const ground = 430;
let state = 'menu', score = 0, best = Number(localStorage.getItem('neon-dash-best') || 0);
let speed = 7, spawnTimer = 0, lastTime = 0, distance = 0;
bestEl.textContent = best;
const player = { x: 145, y: ground - 42, size: 42, vy: 0, rotation: 0, grounded: true };
let obstacles = [], particles = [], stars = Array.from({ length: 80 }, () => ({ x: Math.random()*W, y: Math.random()*ground, r: Math.random()*1.8+.3, a: Math.random()*.7+.2 }));

function reset() { score = 0; speed = 7; spawnTimer = 0; distance = 0; obstacles = []; particles = []; player.y = ground-player.size; player.vy = 0; player.rotation = 0; player.grounded = true; scoreEl.textContent = 0; }
function start() { reset(); state = 'playing'; startScreen.classList.add('hidden'); gameOver.classList.add('hidden'); }
function jump() { if (state !== 'playing') return; if (player.grounded) { player.vy = -15.2; player.grounded = false; burst(player.x+20, player.y+42, '#76f1fa', 7); } }
function endGame() { state = 'over'; finalScore.textContent = score; gameOver.classList.remove('hidden'); if (score > best) { best = score; localStorage.setItem('neon-dash-best', best); bestEl.textContent = best; } burst(player.x+20, player.y+20, '#ff587d', 25); }
function addObstacle() { const tall = Math.random() > .25; const h = tall ? 42 + Math.random()*35 : 30; const w = tall ? 34 : 50; obstacles.push({ x: W+30, y: ground-h, w, h, type: tall ? 'spike' : 'block' }); }
function burst(x,y,color,count) { for(let i=0;i<count;i++) particles.push({x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.8)*5,life:1,color,size:Math.random()*4+2}); }
function update(dt) {
  distance += speed*dt; speed = Math.min(13, 7 + distance/1600); spawnTimer -= dt; if (spawnTimer <= 0) { addObstacle(); spawnTimer = 1.05 + Math.random()*.8 - Math.min(.3, distance/5000); }
  player.vy += 0.72; player.y += player.vy; if (player.y >= ground-player.size) { player.y=ground-player.size; player.vy=0; player.grounded=true; player.rotation=0; } else player.rotation += .13;
  obstacles.forEach(o => o.x -= speed*dt*60); obstacles = obstacles.filter(o => o.x+o.w > -20);
  for (const o of obstacles) { if (player.x+player.size-8 > o.x && player.x+8 < o.x+o.w && player.y+player.size-7 > o.y) endGame(); }
  score = Math.floor(distance/100); scoreEl.textContent = score;
  particles.forEach(p => { p.x+=p.vx; p.y+=p.vy; p.vy+=.15; p.life-=dt*2; }); particles=particles.filter(p=>p.life>0);
}
function draw() {
  const grad=ctx.createLinearGradient(0,0,0,H); grad.addColorStop(0,'#11183d'); grad.addColorStop(1,'#090d24'); ctx.fillStyle=grad; ctx.fillRect(0,0,W,H);
  stars.forEach(s => { let x=(s.x-distance*.12)%W; if(x<0)x+=W; ctx.globalAlpha=s.a; ctx.fillStyle='#b9d5ff'; ctx.beginPath(); ctx.arc(x,s.y,s.r,0,Math.PI*2); ctx.fill(); }); ctx.globalAlpha=1;
  ctx.strokeStyle='#273267'; ctx.lineWidth=1; for(let x=-(distance*.35%48);x<W;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();} for(let y=40;y<ground;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.fillStyle='#151c42'; ctx.fillRect(0,ground,W,H-ground); ctx.strokeStyle='#68edf5'; ctx.shadowBlur=14; ctx.shadowColor='#4eeef4'; ctx.lineWidth=3; ctx.beginPath();ctx.moveTo(0,ground);ctx.lineTo(W,ground);ctx.stroke();ctx.shadowBlur=0;
  obstacles.forEach(o => { ctx.save(); ctx.translate(o.x,o.y); ctx.shadowBlur=16;ctx.shadowColor='#ff4d8d';ctx.fillStyle='#ff4d8d'; if(o.type==='spike'){ctx.beginPath();ctx.moveTo(0,o.h);ctx.lineTo(o.w/2,0);ctx.lineTo(o.w,o.h);ctx.closePath();ctx.fill();}else{ctx.fillRect(0,0,o.w,o.h);ctx.fillStyle='#ff9ebc';ctx.fillRect(7,7,o.w-14,5);} ctx.restore(); });
  ctx.save();ctx.translate(player.x+21,player.y+21);ctx.rotate(player.rotation);ctx.shadowBlur=20;ctx.shadowColor='#72f4ff';ctx.fillStyle='#71f2f5';ctx.fillRect(-21,-21,42,42);ctx.fillStyle='#182052';ctx.fillRect(-10,-10,20,20);ctx.fillStyle='#ffe66d';ctx.fillRect(-5,-5,10,10);ctx.restore();
  particles.forEach(p=>{ctx.globalAlpha=p.life;ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);});ctx.globalAlpha=1;
}
function loop(t) { const dt=Math.min(.032,(t-lastTime)/1000||0);lastTime=t;if(state==='playing')update(dt);draw();requestAnimationFrame(loop); }
function action() { if(state==='menu'||state==='over') start(); else jump(); }
document.querySelector('#start-button').onclick=start; document.querySelector('#restart-button').onclick=start;
window.addEventListener('keydown', e => { if(['Space','ArrowUp','KeyW'].includes(e.code)){e.preventDefault();action();} if(e.code==='KeyR')start(); if(e.code==='KeyP'&&state==='playing')state='paused'; else if(e.code==='KeyP'&&state==='paused')state='playing'; });
canvas.addEventListener('pointerdown', action); requestAnimationFrame(loop);
