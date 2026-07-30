/* ================================================================
   COFFEE CIRCLE — SHARED SHOP LOGIC
   Products data, cart (localStorage), common UI (cursor, nav, reveals)
   ================================================================ */

const PRODUCTS = [
  {
    slug: 'classic-cold-brew',
    name: 'Classic Cold Brew',
    desc: 'Pure, unsweetened, single origin.',
    longDesc: 'Our signature pour. Single-origin beans, steeped cold for eighteen hours with nothing added — no sugar, no cream, just the bean speaking for itself. Bright, clean, and quietly intense.',
    price: 199,
    image: 'images/classic-cold-brew.png'
  },
  {
    slug: 'mocha-blast',
    name: 'Mocha Blast',
    desc: 'Dark chocolate meets slow-brewed coffee.',
    longDesc: 'Dark chocolate folded into our cold brew base, finished with a whisper of cream. Rich without being heavy — built for afternoons that need a little more.',
    price: 249,
    image: 'images/mocha-blast.png'
  },
  {
    slug: 'vanilla-latte',
    name: 'Vanilla Latte',
    desc: 'Cold brew softened with Madagascar vanilla.',
    longDesc: 'Real Madagascar vanilla, folded into cold-brewed coffee and fresh milk. Smooth, softly sweet, and endlessly drinkable.',
    price: 229,
    image: 'images/vanilla-latte.png'
  },
  {
    slug: 'caramel-cream',
    name: 'Caramel Cream',
    desc: 'Salted caramel, folded into cold cream.',
    longDesc: 'A slow caramel reduction stirred through cold cream and our house cold brew. Salted at the edges, sweet at the center.',
    price: 259,
    image: 'images/caramel-cream.png'
  },
  {
    slug: 'hazelnut-brew',
    name: 'Hazelnut Brew',
    desc: 'Roasted hazelnut, deep and nutty finish.',
    longDesc: 'Roasted hazelnut steeped alongside the beans for a deep, nutty finish that lingers. One of our most requested small-batch pours.',
    price: 269,
    image: 'images/hazelnut-brew.png'
  },
  {
    slug: 'dark-chocolate-brew',
    name: 'Dark Chocolate Brew',
    desc: 'Belgian dark chocolate, intensely brewed.',
    longDesc: 'Belgian dark chocolate, intensely brewed with our strongest roast. Bittersweet, bold, and built for chocolate purists.',
    price: 289,
    image: 'images/dark-chocolate-brew.png'
  }
];

function findProduct(slug){ return PRODUCTS.find(p => p.slug === slug); }

/* ---------------- CART (localStorage) ---------------- */
const CART_KEY = 'coffeecircle_cart';

function getCart(){
  try{ return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch(e){ return []; }
}
function saveCart(cart){
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCartBadge();
}
function addToCart(slug, qty=1){
  const cart = getCart();
  const existing = cart.find(i => i.slug === slug);
  if(existing) existing.qty += qty;
  else cart.push({ slug, qty });
  saveCart(cart);
}
function updateCartQty(slug, qty){
  let cart = getCart();
  if(qty <= 0){ cart = cart.filter(i => i.slug !== slug); }
  else{
    const item = cart.find(i => i.slug === slug);
    if(item) item.qty = qty;
  }
  saveCart(cart);
}
function removeFromCart(slug){
  const cart = getCart().filter(i => i.slug !== slug);
  saveCart(cart);
}
function clearCart(){ saveCart([]); }
function cartCount(){ return getCart().reduce((sum,i)=>sum+i.qty, 0); }
function cartLines(){
  return getCart().map(i => {
    const p = findProduct(i.slug);
    if(!p) return null;
    return { ...p, qty:i.qty, lineTotal: p.price * i.qty };
  }).filter(Boolean);
}
function cartSubtotal(){ return cartLines().reduce((sum,l)=>sum+l.lineTotal, 0); }

const SHIPPING_FLAT = 40;
function cartShipping(){ return cartLines().length ? SHIPPING_FLAT : 0; }
function cartTotal(){ return cartSubtotal() + cartShipping(); }

function renderCartBadge(){
  document.querySelectorAll('.cart-badge').forEach(el=>{
    const count = cartCount();
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

/* ---------------- TOAST ---------------- */
function showToast(msg){
  let toast = document.querySelector('.toast');
  if(!toast){
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> toast.classList.remove('show'), 2200);
}

/* ---------------- COMMON UI (cursor, scroll progress, nav, reveals) ---------------- */
function initCommonUI(){
  renderCartBadge();

  if(typeof gsap === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  if(typeof Lenis !== 'undefined'){
    const lenis = new Lenis({ lerp:0.1, smoothWheel:true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time)=>{ lenis.raf(time*1000); });
    gsap.ticker.lagSmoothing(0);
  }

  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if(dot && ring){
    let mx=0,my=0, rx=0, ry=0;
    window.addEventListener('mousemove', e=>{
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    gsap.ticker.add(()=>{
      rx += (mx-rx)*0.16; ry += (my-ry)*0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
    });
    document.querySelectorAll('a, button, .add-cart').forEach(el=>{
      el.addEventListener('mouseenter', ()=>ring.classList.add('hovering'));
      el.addEventListener('mouseleave', ()=>ring.classList.remove('hovering'));
    });
  }

  const progressBar = document.getElementById('scroll-progress');
  if(progressBar){
    ScrollTrigger.create({ start:0, end:'max', onUpdate:self=>{ progressBar.style.width = (self.progress*100)+'%'; } });
  }

  const header = document.getElementById('site-header');
  if(header){
    ScrollTrigger.create({ start:80, end:99999, onUpdate:self=>{ header.classList.toggle('scrolled', self.scroll() > 80); } });
  }

  document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('mousemove', e=>{
      const r = btn.getBoundingClientRect();
      gsap.to(btn, { x:(e.clientX-r.left-r.width/2)*0.2, y:(e.clientY-r.top-r.height/2)*0.35, duration:0.4, ease:'power3.out' });
    });
    btn.addEventListener('mouseleave', ()=>gsap.to(btn, { x:0, y:0, duration:0.5, ease:'elastic.out(1,0.4)' }));
  });

  gsap.utils.toArray('.reveal').forEach((el,i)=>gsap.to(el,{
    opacity:1, y:0, duration:1, ease:'power3.out',
    scrollTrigger:{ trigger:el, start:'top 88%' }, delay:(i%3)*0.06
  }));
}

/* ---------------- LINE-BY-LINE TEXT REVEAL ---------------- */
function initLineReveal(selector){
  if(typeof gsap === 'undefined') return;
  document.querySelectorAll(selector).forEach(el=>{
    if(el.dataset.lined) return;
    el.dataset.lined = '1';
    const parts = el.innerHTML.split('<br>');
    el.innerHTML = parts.map(p => `<span class="line-mask"><span class="line-inner">${p}</span></span>`).join('');
    gsap.to(el.querySelectorAll('.line-inner'), {
      y: '0%', duration: 0.9, ease: 'power3.out', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 85%' }
    });
  });
}

/* ---------------- IMAGE CURTAIN REVEAL ---------------- */
function initCurtainReveal(selector){
  if(typeof gsap === 'undefined') return;
  document.querySelectorAll(selector).forEach(el=>{
    if(el.dataset.curtained) return;
    el.dataset.curtained = '1';
    const curtain = document.createElement('div');
    curtain.className = 'curtain';
    el.appendChild(curtain);
    gsap.to(curtain, {
      yPercent: -100, duration: 1, ease: 'power4.inOut',
      scrollTrigger: { trigger: el, start: 'top 82%' }
    });
  });
}

/* ---------------- ANIMATED COUNTERS ---------------- */
function initCounters(selector){
  if(typeof gsap === 'undefined') return;
  document.querySelectorAll(selector).forEach(el=>{
    if(el.dataset.counted) return;
    el.dataset.counted = '1';
    const raw = el.textContent.trim();
    const match = raw.match(/^(\d+)(.*)$/);
    if(!match) return;
    const target = parseInt(match[1], 10);
    const suffix = match[2];
    const counter = { val: 0 };
    gsap.to(counter, {
      val: target, duration: 1.6, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 88%' },
      onUpdate: () => { el.textContent = Math.floor(counter.val) + suffix; }
    });
  });
}

/* ---------------- CARD TILT ---------------- */
function initCardTilt(selector){
  document.querySelectorAll(selector).forEach(card=>{
    if(card.dataset.tilted) return;
    card.dataset.tilted = '1';
    card.style.transformStyle = 'preserve-3d';
    card.addEventListener('mousemove', e=>{
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if(typeof gsap !== 'undefined'){
        gsap.to(card, { rotateX: py * -6, rotateY: px * 8, duration: 0.4, ease: 'power2.out', transformPerspective: 700 });
      }
    });
    card.addEventListener('mouseleave', ()=>{
      if(typeof gsap !== 'undefined') gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
    });
  });
}

/* ---------------- HORIZONTAL SCROLL RAIL (native scroll + drag) ---------------- */
function initHorizontalRail(wrapSelector){
  const wrap = document.querySelector(wrapSelector);
  if(!wrap) return;

  let isDown = false, startX = 0, startScroll = 0, moved = false;
  wrap.addEventListener('mousedown', e=>{
    isDown = true; moved = false;
    wrap.classList.add('dragging');
    startX = e.pageX; startScroll = wrap.scrollLeft;
  });
  window.addEventListener('mouseup', ()=>{ isDown = false; wrap.classList.remove('dragging'); });
  window.addEventListener('mousemove', e=>{
    if(!isDown) return;
    e.preventDefault();
    const dx = e.pageX - startX;
    if(Math.abs(dx) > 4) moved = true;
    wrap.scrollLeft = startScroll - dx;
  });
  // prevent accidental link click right after a drag
  wrap.addEventListener('click', e=>{ if(moved){ e.preventDefault(); e.stopPropagation(); } }, true);
}

document.addEventListener('DOMContentLoaded', initCommonUI);
