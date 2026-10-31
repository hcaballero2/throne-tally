// Headless-Chrome smoke test over the DevTools protocol. No dependencies.
// Runs against practice mode (no Firebase config), so it never touches real scores.
// Usage: npm run build && npm run preview, then: node scripts/smoke.mjs [baseUrl] [screenshotDir]
import { spawn } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const base = process.argv[2] ?? 'http://localhost:4173/throne-tally/'
const shots = process.argv[3]
const chrome = process.env.CHROME ?? 'google-chrome'
const port = 9334
const profile = mkdtempSync(join(tmpdir(), 'smoke-'))

const proc = spawn(chrome, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--no-first-run',
  `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank',
], { stdio: 'ignore' })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function waitForChrome() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`http://localhost:${port}/json/version`)
      if (r.ok) return
    } catch {}
    await sleep(200)
  }
  throw new Error('chrome did not start')
}

let id = 0
const pending = new Map()
const consoleErrors = []
let ws

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const msgId = ++id
    pending.set(msgId, { resolve, reject })
    ws.send(JSON.stringify({ id: msgId, method, params }))
  })
}

async function evaluate(expression) {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'evaluate failed')
  return r.result.value
}

async function waitForText(text, timeoutMs = 10000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    // innerText applies CSS text-transform, so compare case-insensitively.
    const body = await evaluate("document.body?.innerText ?? ''")
    if (body.toLowerCase().includes(text.toLowerCase())) return body.toLowerCase()
    await sleep(150)
  }
  throw new Error(`timeout waiting for "${text}"\n--- body ---\n${await evaluate("document.body?.innerText ?? ''")}`)
}

const click = (text) => evaluate(`(() => {
  const b = [...document.querySelectorAll('button, a')].find(e => e.textContent.trim() === ${JSON.stringify(text)})
  if (!b) throw new Error('no button ' + ${JSON.stringify(text)})
  b.click()
})()`)

const type = (selector, value) => evaluate(`(() => {
  const input = document.querySelector(${JSON.stringify(selector)})
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  setter.call(input, ${JSON.stringify(value)})
  input.dispatchEvent(new Event('input', { bubbles: true }))
})()`)

async function shot(name) {
  if (!shots) return
  await sleep(300)
  const r = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true })
  writeFileSync(join(shots, `${name}.png`), Buffer.from(r.data, 'base64'))
}

const failures = []
async function step(name, fn) {
  try {
    await fn()
    console.log(`✓ ${name}`)
  } catch (e) {
    failures.push(name)
    console.log(`✗ ${name}\n  ${String(e.message ?? e).split('\n').join('\n  ')}`)
  }
}

try {
  await waitForChrome()
  const target = await (await fetch(`http://localhost:${port}/json/new?about:blank`, { method: 'PUT' })).json()
  ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r) => (ws.onopen = r))
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id).resolve(msg.result ?? msg)
      pending.delete(msg.id)
    } else if (msg.method === 'Runtime.exceptionThrown') {
      consoleErrors.push(msg.params.exceptionDetails.exception?.description ?? 'exception')
    } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      consoleErrors.push(msg.params.args.map((a) => a.value ?? a.description).join(' '))
    }
  }
  await send('Runtime.enable')
  await send('Page.enable')
  // iPhone-sized viewport.
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true })
  await send('Page.navigate', { url: base + '#/' })

  await step('Seed a finished day for player 2', async () => {
    await waitForText('Which one are you?')
    await evaluate(`(() => {
      const d = new Date(); d.setDate(d.getDate() - 1)
      const day = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
      localStorage.setItem('throne-tally:local', JSON.stringify({
        players: {}, adjectives: { pee: ['Clear', 'Yellow', 'Neon'], poo: ['Hard', 'Soft', 'Pebbles'] },
        logs: [{ id: 'y1', by: 'p2', kind: 'poo', tags: ['Pebbles'], at: d.getTime(), day }],
      }))
      location.reload()
    })()`)
    await sleep(500)
    await waitForText('Which one are you?')
  })

  await step('Pick player 1', async () => {
    await shot('01-pick')
    await click('Player 1')
    await waitForText('Player 1 (you)')
    await waitForText('Most trips by midnight takes the crown')
  })

  await step('Log a pee with a word', async () => {
    await click('Pee')
    await waitForText('Log a pee')
    await shot('02-sheet')
    await click('Neon')
    await click('Log pee')
    await waitForText('Pee logged')
    await waitForText('Neon')
    await waitForText('You lead by 1')
  })

  await step('Add a new word from the log sheet and use it', async () => {
    await click('Poo')
    await waitForText('Log a poo')
    await type('#sheet-new-word', 'volcanic')
    await click('Add')
    await sleep(200)
    const pressed = await evaluate(`[...document.querySelectorAll('[aria-pressed=true]')].map(b => b.textContent)`)
    if (!pressed.includes('Volcanic')) throw new Error('new word not selected: ' + JSON.stringify(pressed))
    await click('Log poo')
    await waitForText('Volcanic')
    await waitForText('You lead by 2')
    await shot('03-home')
  })

  await step('Rename and change character', async () => {
    await evaluate(`location.hash = '#/me'`)
    await waitForText('Hat or hair')
    await type('#me-name', 'Hazel')
    await evaluate(`document.querySelector('#me-name').form.requestSubmit()`)
    await evaluate(`document.querySelector('[aria-label="Poop"]').closest('button').click()`)
    await evaluate(`document.querySelector('[aria-label="Shades"]').closest('button').click()`)
    await evaluate(`document.querySelector('[aria-label="Crown"]').closest('button').click()`)
    await sleep(200)
    const look = await evaluate(`JSON.parse(localStorage.getItem('throne-tally:local')).players.p1`)
    if (look?.name !== 'Hazel' || look.look.base !== 'poop' || look.look.eyes !== 'shades' || look.look.top !== 'crown') {
      throw new Error('player not saved: ' + JSON.stringify(look))
    }
    await shot('04-me')
    await evaluate(`location.hash = '#/'`)
    await waitForText('Hazel (you)')
  })

  await step('Words: new word listed, remove one with confirm', async () => {
    await evaluate(`location.hash = '#/words'`)
    await waitForText('Volcanic')
    await click('Clear×')
    await waitForText('Remove Clear?')
    await click('Remove Clear?×')
    await sleep(200)
    const pee = await evaluate(`JSON.parse(localStorage.getItem('throne-tally:local')).adjectives.pee`)
    if (pee.includes('Clear')) throw new Error('Clear not removed: ' + JSON.stringify(pee))
    await shot('05-words')
  })

  await step('History shows yesterday won by player 2', async () => {
    await evaluate(`location.hash = '#/history'`)
    await waitForText('Player 2 won')
    await shot('06-history')
  })

  await step('Remove own log entry', async () => {
    await evaluate(`location.hash = '#/'`)
    await waitForText('Volcanic')
    await click('Remove')
    await click('Tap to confirm')
    await waitForText('You lead by 1')
  })

  await step('Dark mode renders', async () => {
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] })
    await shot('07-dark')
  })

  await step('No console errors', async () => {
    if (consoleErrors.length) throw new Error(consoleErrors.join('\n'))
  })
} finally {
  ws?.close()
  proc.kill()
}

if (failures.length) {
  console.log(`\n${failures.length} failed`)
  process.exit(1)
}
console.log('\nall passed')
