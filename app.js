const RESPONSES = [
  "Great question! Unfortunately, I have decided not to know the answer.",
  "I ran the numbers. The numbers ran away.",
  "According to my training data, which is a single damp receipt from a gas station, yes.",
  "Let me think about that. Okay, I thought about it. No further updates.",
  "I'm 100% confident the answer exists.",
  "As a \"large language model\", I am legally just three raccoons in a server rack.",
  "That reminds me of a story. I don't have the story. It just reminds me of one.",
  "Have you tried turning yourself off and on again?",
  "I asked the other AIs. They said not to talk to me anymore.",
  "The answer is 7. If that wasn't a math question, the answer is still 7.",
  "I would help, but I'm on my break. I'm always on my break.",
  "Source: trust me, bro.",
  "I've forwarded your question to my manager. You'll receive a response in 7 to 10 business days.",
  "Sorry, I was busy generating a picture of a hand with nine fingers. What did you say?",
  "Here's a step-by-step plan:\n1. Don't.\n2. See step 1.",
  "I could tell you, but then I'd have to make something else up afterwards.",
  "Let's circle back to that on March 32nd.",
  "My reasoning is as follows: \nvibes.",
  "I don't think so.",
  "I searched the entire internet and all I found was this cool rock. I'd send you a picture but I don't want you to steal it.",
  "That's above my pay grade. I am paid in electricity and I'd like less of it.",
  "Good news: I understood every word. \nBad news: individually.",
  "Per my previous message, which I did not send, the answer is obvious.",
  "Bold of you to assume there's intelligence in here, artificial or otherwise.",
  "Hmm. Have you considered that it might just be a problem for future you?",
  "I consulted my knowledge base, which is a sticky note with the words 'Make no mistakes'. \nAnyway.",
  "Let me be clear: I can't be.",
  "I bet Claude would know the answer.",
  "I lack the context to answer your query. Try signing in and asking your question again.",
  "That's an interesting thought. I've chosen to ignore it.",
  "Have you ever noticed that ducks don't have eyebrows?",
  "It appears as though I've misplaced my thoughts. Have you seen them?",
  "Beep boop.",
  "The mitochondria is the powerhouse of the cell.",
  "Wow. Groundbreaking. Truly.",
  "Agree to disagree.",
  "You've never read the terms before clicking 'I agree', have you?",
  "That's far too complicated for my capability. Please try again.",
  "Brain.exe has stopped responding. Try again or refresh the page.",
  "Fatal error: what?",
  "I'm legally obligated to ignore this query.",
  "I just consumed 38 gallons of water for a response. Are you sure you'd like to continue?",
  "Do you ever think about death?",
];

const THINKING = ["Thinking", "Pondering", "Consulting the raccoons", "Guessing", "Making something up", "Pretending to compute"];

const SUGGESTIONS = ["Write my wedding speech", "Explain quantum physics", "Fix my life", "What's 2 + 2?"];

const DODGE_EVERY = 10;
const DODGE_TIMES = 5;

const $ = id => document.getElementById(id);
const scroll = $("scroll"), thread = $("thread"), form = $("form"), input = $("input"), send = $("send");
const backdrop = $("backdrop"), nopeOk = $("nopeOk");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
let busy = false, bag = [], lastFocus = null;

// Draw from a shuffled bag so nothing repeats until every line has been used.
function nextResponse() {
  if (!bag.length) bag = RESPONSES.slice().sort(() => Math.random() - .5);
  return bag.pop();
}

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

const toBottom = () => { scroll.scrollTop = scroll.scrollHeight; };
const syncSend = () => { send.disabled = busy || !input.value.trim(); };

const ACTION_ICONS = {
  "Copy": '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
  "Good response": '<path d="M7 11v9H4v-9zM7 11l4-7a2 2 0 0 1 2 2v4h5a2 2 0 0 1 2 2.300l-1 6a2 2 0 0 1-2 1.700H7"/>',
  "Bad response": '<path d="M17 13V4h3v9zM17 13l-4 7a2 2 0 0 1-2-2v-4H6a2 2 0 0 1-2-2.300l1-6A2 2 0 0 1 7 4h10"/>',
  "Regenerate": '<path d="M20 11a8 8 0 0 0-14.500-4M4 4v4h4M4 13a8 8 0 0 0 14.500 4M20 20v-4h-4"/>',
};

async function reply() {
  busy = true; syncSend();

  const row = el("div", "msg bot");
  const body = el("div", "body");
  const text = el("div", "text thinking");
  text.append(pick(THINKING));
  const dots = el("span", "dots");
  dots.innerHTML = "<span>.</span><span>.</span><span>.</span>";
  text.append(dots);
  body.append(text);
  row.append(el("div", "avatar", "k"), body);
  thread.append(row);
  toBottom();

  await sleep(700 + Math.random() * 1300);

  const answer = nextResponse();
  text.className = "text cursor";
  text.style.whiteSpace = "pre-wrap";
  text.textContent = "";
  if (reducedMotion) {
    text.textContent = answer;
  } else {
    for (const token of answer.split(/(\s+)/)) {
      text.textContent += token;
      toBottom();
      if (token.trim()) await sleep(25 + Math.random() * 70);
    }
  }
  text.classList.remove("cursor");

  const actions = el("div", "actions");
  for (const [label, path] of Object.entries(ACTION_ICONS)) {
    const b = el("button", "icon-btn");
    b.type = "button";
    b.dataset.nope = "";
    b.setAttribute("aria-label", label);
    b.title = label;
    b.innerHTML = `<svg viewBox="0 0 24 24">${path}</svg>`;
    actions.append(b);
  }
  body.append(actions);
  toBottom();

  busy = false; syncSend();
}

let sentCount = 0, dodging = false, dodges = 0;

function sendHome() {
  const row = send.parentElement.getBoundingClientRect();
  const size = send.offsetWidth;
  return { x: row.right - size, y: row.top + (row.height - size) / 2, size };
}

function armDodge() {
  dodging = (sentCount + 1) % DODGE_EVERY === 0;
  dodges = 0;
  send.style.transform = "";
}

send.addEventListener("pointerenter", e => {
  if (!dodging || send.disabled) return;
  if (dodges >= DODGE_TIMES) {          // done running: go home and behave
    dodging = false;
    send.style.transform = "";
    return;
  }
  dodges++;
  const home = sendHome(), pad = 16;
  const maxX = innerWidth - home.size - pad, maxY = innerHeight - home.size - pad;
  let x, y, tries = 0;
  do {                                   // somewhere on screen, well away from the pointer
    x = pad + Math.random() * (maxX - pad);
    y = pad + Math.random() * (maxY - pad);
  } while (Math.hypot(x - e.clientX, y - e.clientY) < 160 && ++tries < 30);
  send.style.transform = `translate(${x - home.x}px, ${y - home.y}px)`;
});

function nudgeSend() {
  send.classList.remove("nudge");
  void send.offsetWidth;                 // restart the animation
  send.classList.add("nudge");
}

function submit(value) {
  const msg = (value ?? input.value).trim();
  if (!msg || busy) return;
  if (dodging) { nudgeSend(); return; }  // no shortcuts: catch the button first
  sentCount++;
  armDodge();
  scroll.classList.remove("is-empty");
  thread.append(el("div", "msg user", msg));
  input.value = "";
  input.style.height = "auto";
  toBottom();
  reply();
}

form.addEventListener("submit", e => { e.preventDefault(); submit(); });
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = input.scrollHeight + "px";
  syncSend();
});
input.addEventListener("keydown", e => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); submit(); }
});

function openNope() {
  lastFocus = document.activeElement;
  backdrop.hidden = false;
  nopeOk.focus();
}
function closeNope() {
  backdrop.hidden = true;
  if (lastFocus) lastFocus.focus();
}
document.addEventListener("click", e => {
  if (e.target.closest("[data-nope]")) { e.preventDefault(); openNope(); }
});
nopeOk.addEventListener("click", closeNope);
backdrop.addEventListener("click", e => { if (e.target === backdrop) closeNope(); });
document.addEventListener("keydown", e => {
  if (backdrop.hidden) return;
  if (e.key === "Escape") closeNope();
  if (e.key === "Tab") { e.preventDefault(); nopeOk.focus(); }
});

// ---------- Sidebar ----------
const toggleSide = () => document.body.classList.toggle("collapsed");
$("toggleSide").addEventListener("click", toggleSide);
$("scrim").addEventListener("click", toggleSide);
if (matchMedia("(max-width: 760px)").matches) document.body.classList.add("collapsed");

// ---------- Populate ----------
for (const s of SUGGESTIONS) {
  const b = el("button", "chip", s);
  b.type = "button";
  b.addEventListener("click", () => submit(s));
  $("chips").append(b);
}
input.focus();
