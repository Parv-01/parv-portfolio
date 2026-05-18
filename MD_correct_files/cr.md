# Code Review: 8085 Simulator Test Suite - Issues & Solutions

## Overview
This document audits all 20 test cases for the 8085 microprocessor simulator playground. Each test is analyzed for correctness, potential runtime issues, and implementation requirements.

---

## Test 1: Baseline — Add Two Numbers

**Program:**
```asm
; A = 0x0A + 0x14
MVI A, 0AH
MVI B, 14H
ADD B
HLT
```

**Expected Behavior:**
- `A = 0x1E` (26), `B = 0x14` (20)
- `PC = 0x0003`
- `HALTED` badge visible
- Status = `halted`
- Line counter = `3 / 4`

**Problems Identified:**
1. **PC Expectation Issue**: After executing 4 lines (MVI A, MVI B, ADD B, HLT), PC should be 0x0004, not 0x0003
   - Line 0: MVI A, 0AH → PC increments to 1
   - Line 1: MVI B, 14H → PC increments to 2
   - Line 2: ADD B → PC increments to 3
   - Line 3: HLT → PC increments to 4 (or stays at 3 after halt)
   - **Resolution**: Clarify if PC points to the current instruction (would be 3) or post-increment (would be 4). Most architectures increment during fetch, so PC=4 is standard.

2. **Line Counter Consistency**: If the program has 4 instructions and we've executed 3 (up to but not including HLT results), the counter should reflect "executed 3 / total 4"
   - **Resolution**: Verify the line counter logic matches the "current execution line" vs "total lines" semantics.

**Solution:**
- Verify and document PC increment timing (pre-execute or post-execute)
- Update test expectation: Either `PC = 0x0004` if PC increments after executing HLT, or adjust halt behavior to NOT increment past the HLT instruction
- Confirm line counter reflects "lines executed so far / total lines in program"

---

## Test 2: HLT Actually Halts

**Program:**
```asm
MVI A, 01H
HLT
MVI A, FFH
```

**Expected Behavior:**
- `A = 0x01` (post-HLT instruction never executes)
- Run loop stops
- `HALTED` badge visible
- Run + Step buttons disabled until Reset

**Problems Identified:**
1. **HLT Execution Semantics**: Need to confirm HLT is executed (PC increments past it) or HLT prevents its own post-increment
   - If HLT increments PC normally, PC would be 1
   - If HLT does NOT increment PC, PC remains at line 1 (the HLT line itself)
   - **Resolution**: Most real 8085 behavior: HLT executes and increments PC normally, but the next fetch cycle is a no-op loop.

2. **Button State Management**: Ensure Run and Step are properly disabled while halted
   - **Resolution**: Add disabled state to button DOM during halted status, remove onclick or add guard clauses.

**Solution:**
- Implement HLT opcode to set an `isHalted` flag after incrementing PC
- In the run-loop, check `isHalted` before fetching the next instruction
- Update button event handlers to check `isHalted` status and disable/enable accordingly
- Example logic:
  ```javascript
  if (isHalted) {
    runButton.disabled = true;
    stepButton.disabled = true;
  }
  ```

---

## Test 3: Line Highlight Tracks PC

**Program:**
```asm
MVI A, 01H
MVI B, 02H
MVI C, 03H
MVI D, 04H
MVI E, 05H
HLT
```

**Expected Behavior:**
- Clicking Step 5 times advances the ▸ marker one line per click
- Registers update one at a time
- Phase chip cycles: fetch → decode → execute → idle

**Problems Identified:**
1. **Phase Animation Timing**: If phase animations are set too fast or if the UI updates are batched, the phase chip cycle may not complete before the next Step is clicked
   - **Resolution**: Ensure each phase animation completes before allowing the next Step.

2. **Current Line Marker Position**: If the ▸ marker is positioned based on PC and doesn't update immediately on Step, users may see lag
   - **Resolution**: Update marker position synchronously with PC change, before phase animations start.

3. **Register Update Order**: If multiple registers update in a single Step, they should be visually sequential
   - **Resolution**: Queue register updates to animate one per cycle phase.

**Solution:**
- Implement a phase state machine: `FETCH → DECODE → EXECUTE → IDLE`
- On each Step:
  1. Update ▸ marker to current PC (synchronously)
  2. Start phase animation loop through all 4 phases
  3. Update register values during the EXECUTE phase
  4. Disable Step button during animation
  5. Re-enable Step when animation completes
- Example:
  ```javascript
  async function step() {
    if (isAnimating) return;
    isAnimating = true;
    stepButton.disabled = true;
    
    // Update PC marker
    updateLineMarker(pc);
    
    // Animate phases
    for (const phase of ['fetch', 'decode', 'execute', 'idle']) {
      updatePhaseChip(phase);
      await delay(100); // adjust per design
    }
    
    // Execute instruction & update registers
    executeInstruction();
    updateRegisters();
    
    isAnimating = false;
    stepButton.disabled = false;
  }
  ```

---

## Test 4: Run / Step Produce Identical State

**Program:**
```asm
MVI A, 10H
MVI B, 02H
ADD B
MOV C, A
INR C
HLT
```

**Expected Behavior:**
- Step through to end: `A = 0x12`, `C = 0x13`
- Reset and Run to end: identical `A = 0x12`, `C = 0x13`

**Problems Identified:**
1. **Determinism**: If Run uses different instruction fetch/execution logic than Step, or if there's any timing-based branching, state will diverge
   - **Resolution**: Ensure Run and Step share the same core execution function.

2. **Speed-Dependent Logic**: If the speed slider affects not just animation delay but also instruction behavior, results will differ
   - **Resolution**: Keep speed slider as UI-only; core execution must be identical.

3. **Register Initialization**: MOV C, A requires MOV to be implemented correctly
   - If MOV is missing or broken, both Run and Step will fail identically, but this test won't catch it
   - **Resolution**: Verify MOV implementation independently.

**Solution:**
- Create a single `executeInstruction()` function used by both Step and Run
- Step mode: call `executeInstruction()` once per click, with animation delays
- Run mode: call `executeInstruction()` in a loop, with speed-adjusted delays, but same core logic
- Example:
  ```javascript
  function step() {
    executeInstruction(); // same function as Run uses
    updateUI();
  }
  
  async function run() {
    while (!isHalted && !isPaused) {
      executeInstruction(); // exact same call
      updateUI();
      await delay(speedToDelay(currentSpeed));
    }
  }
  ```
- Verify MOV, INR, and ADD are all correctly implemented before running this test.

---

## Test 5: Pause Then Step Uses Fresh PC/Regs

**Program:**
```asm
MVI A, 00H
INR A
INR A
INR A
INR A
INR A
HLT
```

**Expected Behavior:**
- Set speed to Slow, Run, Pause around the 3rd increment
- Click Step once
- A increments by exactly one more, no jump back, PC advances by 1

**Problems Identified:**
1. **State Capture on Pause**: If Pause doesn't cleanly halt the run-loop, a buffered instruction might execute after Pause is clicked
   - **Resolution**: Check for `isPaused` flag at the top of each execute cycle, not just between cycles.

2. **Stale Closures**: If the run-loop closure captures old PC/register values, Step might use stale state
   - **Resolution**: Always read PC and registers from refs/state, never cache in closures.

3. **Queue Flushing**: If instructions are queued/batched, Pause might not stop the queue mid-cycle
   - **Resolution**: No batching; each execute cycle is atomic.

**Solution:**
- Implement Pause as a flag check at the START of each execute cycle:
  ```javascript
  async function run() {
    while (!isHalted) {
      if (isPaused) break; // Check first, before any execution
      executeInstruction();
      updateUI();
      await delay(...);
    }
  }
  ```
- Ensure `isPaused` is reset after Step is called:
  ```javascript
  function pause() {
    isPaused = true;
  }
  
  function step() {
    isPaused = false; // Or leave it alone and let Step work independently
    const savedPC = pc; // Capture current state
    executeInstruction();
    updateUI();
  }
  ```
- Add a test: run a few cycles, pause, note PC and A. Step once. Verify PC = savedPC + 1 and A = savedA + 1 (for INR).

---

## Test 6: Reset Clears Everything

**Program:** (Use test 1 program)

**Expected Behavior:**
- After Run to halt, click Reset
- All registers: `A..L = 0x00`, `PC = 0x0000`, `SP = 0xFFFF`
- `HALTED` badge gone
- Status = `ready`
- Line counter = `0 / 4`
- No current-line marker

**Problems Identified:**
1. **Incomplete State Reset**: If any register or flag is missed, state won't be fully cleared
   - **Resolution**: Create a `resetState()` function that explicitly resets every register, flag, and UI element.

2. **Badge/UI Not Cleared**: If `HALTED` badge remains or status doesn't update, UI is out of sync
   - **Resolution**: Update UI state before updating badge visibility.

3. **Line Marker Not Hidden**: If the ▸ marker doesn't disappear, it suggests the marker logic doesn't handle PC=0
   - **Resolution**: Hide marker when PC is 0 or when state is not running.

**Solution:**
- Implement `resetState()`:
  ```javascript
  function resetState() {
    pc = 0;
    registers = { A: 0, B: 0, C: 0, D: 0, E: 0, H: 0, L: 0, M: 0 };
    sp = 0xFFFF;
    isHalted = false;
    isPaused = false;
    status = 'ready';
    lineCounter = '0 / ' + totalLines;
    clearLineMarker();
    hideBadge('HALTED');
    updateUI();
  }
  ```
- Call `resetState()` from the Reset button handler.
- Verify the line counter text updates correctly.

---

## Test 7: Unsupported Opcode → Error + Run Stops

**Program:**
```asm
MVI A, 05H
JMP 0000H
HLT
```

**Expected Behavior:**
- Run triggers an error on line 2: `line 2 · JMP — Unsupported opcode "JMP".`
- Hint lists supported opcodes
- Line 2 tinted red in rom view
- Run loop stops on line 2
- `A = 0x05` preserved
- Status = `error`

**Problems Identified:**
1. **Opcode Validation Timing**: If JMP is validated during parsing, not execution, this test won't work
   - **Resolution**: Validate opcode during execution, not parsing.

2. **Error Message Format**: The expected format is `line N · OPCODE — message`. If formatting differs, the test fails
   - **Resolution**: Use exact error format; construct as `line ${pc} · ${opcode.toUpperCase()} — ${errorMsg}`.

3. **Row Highlighting**: If the line tinting relies on CSS classes, ensure the class is applied to the correct DOM element
   - **Resolution**: Apply `.error-line` class to the line in rom-view matching current PC.

4. **State Preservation**: A must remain 0x05 after the error; ensure PC doesn't auto-increment past the bad instruction
   - **Resolution**: On error, set status='error' but do NOT increment PC; the error line is the "current" line.

5. **Hint Display**: The hint should list supported opcodes
   - **Resolution**: Create a mapping of all supported opcodes and display in error hint.

**Solution:**
- In `executeInstruction()`, wrap opcode lookup in try-catch:
  ```javascript
  function executeInstruction() {
    const [opcode, ...operands] = parseInstruction(lines[pc]);
    const instruction = instructions[opcode];
    
    if (!instruction) {
      status = 'error';
      currentError = {
        line: pc,
        opcode: opcode,
        message: `Unsupported opcode "${opcode}".`,
        hint: `Supported opcodes: ${Object.keys(instructions).join(', ')}`
      };
      displayError(currentError);
      highlightErrorLine(pc);
      return; // Don't increment PC, don't continue
    }
    
    // Execute normally if no error
    instruction.execute(operands);
    pc++;
  }
  ```
- Update Run button handler to check `status === 'error'` and break early.

---

## Test 8: Parse Error — Malformed Hex Literal

**Program:**
```asm
MVI A, ZZH
HLT
```

**Expected Behavior:**
- Run (or Step) triggers error: `line 1 · MVI — Could not parse literal "ZZH".`
- Hint: `Use 0AH (hex), 0x0A, or plain decimal like 10.`

**Problems Identified:**
1. **Parse Timing**: If parsing happens during file load, errors won't appear until Run/Step
   - **Resolution**: Parse on-demand during execution, not upfront. (Or parse on load and cache, re-validate on execute.)

2. **Literal Format Validation**: Must detect `ZZH` as invalid hex
   - **Resolution**: Regex: `/^([0-9A-Fa-f]+)[Hh]$|^0x([0-9A-Fa-f]+)$|^(\d+)$/` to match hex, 0x-style, or decimal.

3. **Error Message Specificity**: Error says "ZZH" not recognized, not "Z is invalid"
   - **Resolution**: Attempt to parse, catch exception, report the literal as-is.

**Solution:**
- Create a `parseLiteral(str)` function:
  ```javascript
  function parseLiteral(literal) {
    // Try hex with H suffix (e.g., 0AH)
    let match = literal.match(/^([0-9A-Fa-f]+)[Hh]$/);
    if (match) return parseInt(match[1], 16);
    
    // Try 0x style (e.g., 0x0A)
    match = literal.match(/^0x([0-9A-Fa-f]+)$/i);
    if (match) return parseInt(match[1], 16);
    
    // Try plain decimal
    match = literal.match(/^(\d+)$/);
    if (match) return parseInt(match[1], 10);
    
    throw new Error(`Could not parse literal "${literal}".`);
  }
  ```
- Wrap MVI operand parsing with try-catch:
  ```javascript
  const instructions = {
    MVI: {
      parse: (operands) => {
        if (operands.length < 2) throw new Error("MVI needs a destination register and a value.");
        const [reg, literal] = operands;
        try {
          const value = parseLiteral(literal);
          return { reg, value };
        } catch (e) {
          throw new Error(`MVI — ${e.message} Hint: Use 0AH (hex), 0x0A, or plain decimal like 10.`);
        }
      }
    }
  };
  ```

---

## Test 9: Parse Error — Missing Operand

**Program:**
```asm
MVI
HLT
```

**Expected Behavior:**
- Step triggers error: `line 1 · MVI — MVI needs a destination register …`
- Hint: `Try: MVI A, 0AH`.

**Problems Identified:**
1. **Operand Count Validation**: MVI requires 2 operands; line 1 has 0
   - **Resolution**: Check operand count before processing.

2. **Error Message Clarity**: Should explicitly say "destination register" and "value"
   - **Resolution**: Use exact phrasing in error.

**Solution:**
- In MVI instruction handler:
  ```javascript
  const instructions = {
    MVI: {
      parse: (operands) => {
        if (operands.length < 2) {
          throw new Error("MVI needs a destination register and a value. Try: MVI A, 0AH");
        }
        // ... rest of parsing
      }
    }
  };
  ```

---

## Test 10: MOV Register Transfer

**Program:**
```asm
MVI A, 7FH
MOV B, A
MOV C, B
MOV D, C
HLT
```

**Expected Behavior:**
- `A = B = C = D = 0x7F`, `E = H = L = 0x00`

**Problems Identified:**
1. **MOV Semantics**: MOV copies the source to the destination. Syntax is `MOV dest, src`.
   - If implemented as `MOV src, dest` (reverse), results will be wrong.
   - **Resolution**: Verify operand order: `MOV B, A` means B ← A.

2. **Register State**: E, H, L should remain 0 (or their init values)
   - **Resolution**: Ensure registers not touched by any instruction stay unchanged.

**Solution:**
- Implement MOV:
  ```javascript
  const instructions = {
    MOV: {
      parse: (operands) => {
        if (operands.length < 2) throw new Error("MOV needs destination and source registers.");
        return { dest: operands[0], src: operands[1] };
      },
      execute: (parsed) => {
        registers[parsed.dest] = registers[parsed.src];
      }
    }
  };
  ```
- Verify MVI A, 7FH correctly sets A to 0x7F (test case 8/12 should validate this).

---

## Test 11: 8-bit Wrap on INR and DCR

**Program:**
```asm
MVI A, FFH
INR A
MVI B, 00H
DCR B
HLT
```

**Expected Behavior:**
- `A = 0x00` (wrapped from 0xFF + 1)
- `B = 0xFF` (wrapped from 0x00 - 1)

**Problems Identified:**
1. **Modulo 256 Arithmetic**: Without explicit `& 0xFF` masking, JavaScript arithmetic may overflow to larger values
   - **Resolution**: Apply `& 0xFF` or `% 256` after every register write.

2. **Negative Number Representation**: DCR B subtracts 1 from 0, which in JavaScript gives -1, not 0xFF
   - **Resolution**: Use `(value - 1 + 256) % 256` or `(value - 1) & 0xFF`.

**Solution:**
- Create a `setRegister(name, value)` helper that always masks:
  ```javascript
  function setRegister(name, value) {
    registers[name] = value & 0xFF;
  }
  ```
- Update all instructions (INR, DCR, ADD, SUB, etc.) to use `setRegister()` instead of direct assignment:
  ```javascript
  const instructions = {
    INR: {
      parse: (operands) => ({ reg: operands[0] }),
      execute: (parsed) => {
        setRegister(parsed.reg, registers[parsed.reg] + 1);
      }
    },
    DCR: {
      parse: (operands) => ({ reg: operands[0] }),
      execute: (parsed) => {
        setRegister(parsed.reg, registers[parsed.reg] - 1);
      }
    }
  };
  ```

---

## Test 12: Decimal and 0x Literal Acceptance

**Program:**
```asm
MVI A, 10
MVI B, 0x0A
ADD B
HLT
```

**Expected Behavior:**
- `A = 0x14` (decimal 10 + hex 0x0A = 20 = 0x14)
- No parse errors

**Problems Identified:**
1. **Multiple Literal Formats**: Literals can be hex-with-H (0AH), hex-with-0x (0x0A), or plain decimal (10)
   - **Resolution**: Ensure `parseLiteral()` from test 8 handles all three formats correctly.

2. **Decimal Interpretation**: "10" as plain decimal = 10₁₀, not 16₁₀
   - **Resolution**: Only interpret as hex if H suffix or 0x prefix present; otherwise decimal.

**Solution:**
- Use `parseLiteral()` from test 8 (already handles all three formats).
- Verify with manual calculation: 10 + 0x0A = 10 + 10 = 20 = 0x14. ✓

---

## Test 13: SUB with Wrap (Borrow)

**Program:**
```asm
MVI A, 05H
MVI B, 0AH
SUB B
HLT
```

**Expected Behavior:**
- `A = 0xFB` (5 - 10 mod 256 = -5 mod 256 = 251 = 0xFB)

**Problems Identified:**
1. **Subtraction Underflow**: 5 - 10 = -5 in JavaScript; must wrap to 0xFB (251)
   - **Resolution**: Use `(A - B + 256) % 256` or `(A - B) & 0xFF` (with signed arithmetic).
   - Note: `(5 - 10) & 0xFF` = `(-5) & 0xFF`. In JavaScript, bitwise AND converts to 32-bit signed, so need care.
   - Safer: `((A - B) % 256 + 256) % 256` to ensure positive result.

2. **SUB Implementation**: Must be implemented (test 7 only checks for missing opcodes)
   - **Resolution**: Implement SUB instruction.

**Solution:**
- Implement SUB with proper modulo wrapping:
  ```javascript
  const instructions = {
    SUB: {
      parse: (operands) => ({ reg: operands[0] }),
      execute: (parsed) => {
        const result = (registers['A'] - registers[parsed.reg] + 256) % 256;
        setRegister('A', result);
      }
    }
  };
  ```
- Test: MVI A, 05H → A = 5. MVI B, 0AH → B = 10. SUB B → A = (5 - 10 + 256) % 256 = 251 = 0xFB. ✓

---

## Test 14: Comment-Only and Blank Lines Are No-ops

**Program:**
```asm
; this is a comment

MVI A, 42H
; another comment
HLT
```

**Expected Behavior:**
- Stepping through, comment + blank lines advance PC silently (no register change, no errors)
- Only MVI A, 42H changes A

**Problems Identified:**
1. **Line Parsing**: If comments are not stripped during parsing, opcode lookup will fail
   - **Resolution**: Strip comments before opcode extraction. Handle `;` as comment delimiter.

2. **Blank Line Handling**: If blank lines are treated as instructions, they'll cause parse errors
   - **Resolution**: Skip blank lines during parsing; treat as no-op and increment PC.

3. **PC Increment for No-ops**: Should comment/blank lines increment PC?
   - In real assembly, comments/blanks don't consume memory; they don't affect PC.
   - But in this simulator, if the ROM view shows 5 lines, does PC reach 5 or less?
   - **Resolution**: Clarify design: either (a) don't count comments/blanks in line view, or (b) treat them as no-ops that consume 1 PC slot each.
   - Likely intent: display all lines, but comments/blanks consume no memory, so PC only advances for real instructions.

**Solution:**
- Option A (preferred): Comments/blanks don't consume memory slots
  ```javascript
  function parseProgram(source) {
    const lines = source.split('\n');
    const instructions = [];
    for (const line of lines) {
      const trimmed = line.split(';')[0].trim(); // Remove comments
      if (trimmed.length === 0) continue; // Skip blank lines
      instructions.push(trimmed);
    }
    return instructions;
  }
  ```
  Then display original source with line numbers for reference, but PC indexing uses the instruction array.

- Option B: Comments/blanks are no-ops that advance PC
  ```javascript
  function parseProgram(source) {
    return source.split('\n').map(line => line.split(';')[0].trim());
  }
  
  function executeInstruction() {
    const instruction = lines[pc];
    if (instruction.length === 0) {
      pc++; // Skip blank, advance PC
      return;
    }
    // ... normal execution
  }
  ```

Recommend **Option A** for clarity: comments/blanks are metadata, not instructions.

---

## Test 15: Easter-egg Trigger — Two Consecutive Errors

**Program:**
```asm
JMP 0000H
JMP 0001H
HLT
```

**Expected Behavior:**
- First Step: clean error on line 1, no quip
- Second Step: error on line 1 still (since run aborts), and italic aside `· <quip>` appears
- Click Clear, then Step on a valid program: quip does not re-appear immediately
- Alternative: After Reset on a valid program and Step once successfully: consecutive counter resets; single error doesn't show quip (unless 60s elapsed)

**Problems Identified:**
1. **Consecutive Error Tracking**: Need a counter for consecutive errors
   - **Resolution**: Implement `consecutiveErrorCount` and increment on error, reset on success.

2. **Quip Display Logic**: Quip appears after 2+ consecutive errors
   - **Resolution**: Check `consecutiveErrorCount >= 2` before showing quip.

3. **60-second Cooldown**: Last quip timestamp must be tracked; quip reappears if 60s+ elapsed
   - **Resolution**: Track `lastQuipTime` and check `(Date.now() - lastQuipTime) > 60000`.

4. **Clear Button**: User clicks "Clear" to reset error state
   - **Resolution**: Reset `consecutiveErrorCount = 0`, hide error display, reset status to 'ready'.

5. **Quip Content**: What is the actual quip? Not specified; needs a quip message
   - **Resolution**: Create a list of quips and pick randomly or rotate through them.

**Solution:**
```javascript
let consecutiveErrorCount = 0;
let lastQuipTime = 0;
const quips = [
  "Consider reading the docs?",
  "Rome wasn't built in a day.",
  "Help yourself to some documentation.",
  // ... more quips
];

function displayError(error) {
  consecutiveErrorCount++;
  status = 'error';
  showErrorMessage(error);
  highlightErrorLine(error.line);
  
  const showsQuip = consecutiveErrorCount >= 2 && (Date.now() - lastQuipTime) > 60000;
  if (showsQuip) {
    const quip = quips[Math.floor(Math.random() * quips.length)];
    showQuipAside(quip);
    lastQuipTime = Date.now();
  }
}

function recordSuccess() {
  consecutiveErrorCount = 0;
}

function clearErrors() {
  consecutiveErrorCount = 0;
  status = 'ready';
  hideErrorMessage();
  hideQuipAside();
}
```

---

## Test 16: Easter-egg Cooldown — Single Error Stays Quiet

**Program:**
```asm
MVI A, ZZH
HLT
```

**Expected Behavior:**
- Step once: error shown without an aside (only 1 error, cooldown not yet 60s after last quip)
- Wait 60s after last quip, trigger single error again: aside reappears (proving the 60s rule)

**Problems Identified:**
1. **Same as Test 15**: Consecutive error and cooldown logic
   - If Test 15 logic is implemented, this is a consequence of it
   - **Resolution**: Test 15 implementation should satisfy this.

2. **Testing Cooldown**: Manual 60s wait is impractical for automated tests
   - **Resolution**: Add a testing mode to bypass cooldown, or mock time (use `jest.useFakeTimers()` or similar).

**Solution:**
- Implement the same logic as Test 15
- For testing: provide a function to manually reset `lastQuipTime`:
  ```javascript
  function _testResetQuipCooldown() {
    lastQuipTime = 0;
  }
  ```
  Then the test can call this instead of waiting 60s.

---

## Test 17: Speed Slider

**Program:** (Long program with 8 INR instructions)

**Expected Behavior:**
- Run at Slow (≈500ms/instr), Pause, change to Fast (≈80ms/instr), Run again
- Interval rate changes immediately
- No double-stepping
- No leftover timers
- Final `A = 0x08`

**Problems Identified:**
1. **Timer Management**: If changing speed while running, old timer must be cancelled
   - **Resolution**: Clear any pending setTimeout/setInterval before starting a new run loop.

2. **Interval Calculation**: Speed is a slider; must map to actual delay values
   - **Resolution**: Map slider value (e.g., 0–100) to delay (e.g., 600ms–50ms): `delay = 650 - (speed * 6)`.

3. **Run Loop Restart**: Pausing and resuming must not skip or repeat instructions
   - **Resolution**: Pause at the top of each cycle, not mid-cycle.

4. **Final State Verification**: A = 0x08 after 8 INR calls (0 + 8 = 8)
   - **Resolution**: Ensure INR is correctly implemented (already verified in test 11).

**Solution:**
- Implement speed slider mapping:
  ```javascript
  function speedToDelay(speed) {
    // speed: 0–100, maps to 600ms–50ms
    return 650 - (speed * 6);
  }
  ```
- Implement clean pause/resume:
  ```javascript
  let currentRunTimer = null;
  
  async function run() {
    if (currentRunTimer) clearTimeout(currentRunTimer);
    
    while (!isHalted) {
      if (isPaused) break;
      
      executeInstruction();
      updateUI();
      
      const delay = speedToDelay(currentSpeed);
      await new Promise(resolve => {
        currentRunTimer = setTimeout(resolve, delay);
      });
    }
    
    currentRunTimer = null;
  }
  
  function pause() {
    isPaused = true;
  }
  
  function updateSpeed(newSpeed) {
    currentSpeed = newSpeed; // Changes take effect on next cycle
  }
  ```

---

## Test 18: Read-only Textarea While Running

**Program:** (Long program from test 17)

**Expected Behavior:**
- Run at Slow
- Try to type into editor
- Edits are blocked
- Title reads `program.asm · readonly (running)`
- Hint appears: `Pause to edit.`
- Pause → editing works again

**Problems Identified:**
1. **Textarea Disabled State**: Textarea must be disabled during Run
   - **Resolution**: Set `textarea.disabled = true` when Run starts, `textarea.disabled = false` when Run stops.

2. **Title Text Update**: Title must reflect state
   - **Resolution**: Update title on Run/Stop/Pause.

3. **Hint Visibility**: Hint appears when textarea is disabled but user tries to type
   - **Resolution**: Show hint on `textarea.click` or `textarea.focus` when disabled.

**Solution:**
```javascript
function runProgram() {
  textarea.disabled = true;
  updateTitle('readonly (running)');
  showHint('Pause to edit.');
  
  // ... run loop
}

function pauseProgram() {
  textarea.disabled = false;
  updateTitle('editable');
  hideHint();
}

function updateTitle(state) {
  const title = `program.asm ${state ? '· ' + state : ''}`;
  document.querySelector('.editor-title').textContent = title;
}
```

---

## Test 19: Empty Program

**Program:** (empty/blank textarea)

**Expected Behavior:**
- Rom view shows `(empty program)`
- Step + Run buttons disabled
- No errors
- No crash

**Problems Identified:**
1. **Empty Program Handling**: If parsing assumes at least one line, it may crash
   - **Resolution**: Check line count before executing.

2. **Button Disable Logic**: Buttons must check `lines.length === 0` or similar
   - **Resolution**: Add guards in Step/Run handlers.

3. **Rom View Display**: Must show placeholder text `(empty program)`
   - **Resolution**: Check length and display placeholder if empty.

**Solution:**
```javascript
function step() {
  if (lines.length === 0) {
    status = 'empty';
    return; // No action
  }
  // ... normal step
}

async function run() {
  if (lines.length === 0) {
    status = 'empty';
    return; // No action
  }
  // ... normal run
}

function updateUI() {
  if (lines.length === 0) {
    romView.textContent = '(empty program)';
    stepButton.disabled = true;
    runButton.disabled = true;
  } else {
    romView.innerHTML = lines.map((line, i) => `<div>${line}</div>`).join('');
    stepButton.disabled = isHalted || status === 'error';
    runButton.disabled = isHalted || status === 'error';
  }
}
```

---

## Test 20: Stale-closure Regression Check

**Program:**
```asm
MVI A, 01H
MVI A, 02H
MVI A, 03H
HLT
```

**Expected Behavior:**
- Step three times very quickly (within ~300ms)
- Final `A = 0x03`, `PC = 0x0003`
- Only one phase animation visible at a time
- No skipped lines
- No out-of-order register writes

**Problems Identified:**
1. **Closure Capture**: If the phase animation closure captures old PC/registers, subsequent steps use stale values
   - **Resolution**: Always read PC/registers from refs (outer scope), not from closure arguments.

2. **Phase Animation Queueing**: If phase animations queue up, they may execute out of order or concurrently
   - **Resolution**: Ensure each Step waits for the previous phase animation to complete before proceeding.

3. **Concurrent Executions**: If Step is clicked while phase animation is running, two executions may interleave
   - **Resolution**: Add `isAnimating` guard to disable Step during animation.

**Solution:**
```javascript
let isAnimating = false;

function step() {
  if (isAnimating) return; // Guard against rapid clicks
  
  isAnimating = true;
  stepButton.disabled = true;
  
  // Read current state from outer scope, NOT from closure
  const startPC = pc;
  const startA = registers.A;
  
  // Execute instruction (modifies pc, registers)
  executeInstruction();
  
  // Animate phases, reading state synchronously
  animatePhases().then(() => {
    // Phase animation complete; PC and registers are already updated
    console.assert(pc === startPC + 1); // Verify PC advanced by 1
    updateUI();
    
    isAnimating = false;
    stepButton.disabled = isHalted || status === 'error';
  });
}

async function animatePhases() {
  for (const phase of ['fetch', 'decode', 'execute', 'idle']) {
    updatePhaseChip(phase);
    await delay(100);
  }
}
```

---

## Summary of Critical Issues

| Test | Priority | Issue | Solution |
|------|----------|-------|----------|
| 1 | High | PC expectation mismatch | Clarify post-execute PC state |
| 2 | High | HLT halt semantics | Set isHalted flag after incrementing PC |
| 3 | High | Phase animation blocking | Queue phases, disable Step during animation |
| 4 | Medium | Determinism check | Share same executeInstruction() between Run and Step |
| 5 | High | Stale closures on pause | Always read state from refs, not closures |
| 6 | High | Reset incompleteness | Implement comprehensive resetState() |
| 7 | High | Opcode validation & error format | Validate on execute, use exact error format |
| 8 | High | Literal parsing | Implement parseLiteral() supporting H, 0x, decimal |
| 9 | Medium | Operand validation | Check operand count before parsing |
| 10 | Medium | MOV implementation | Implement MOV dest ← src |
| 11 | Critical | 8-bit wrapping | Use setRegister() with & 0xFF masking |
| 12 | Low | Multi-format literals | Test parseLiteral() from test 8 |
| 13 | High | SUB underflow | Implement SUB with (A - B + 256) % 256 |
| 14 | High | Comment/blank handling | Strip comments, skip blanks during parsing |
| 15 | Low | Easter-egg quip logic | Implement consecutive error counter and 60s cooldown |
| 16 | Low | Cooldown test | Same as test 15 |
| 17 | High | Speed slider & timer cleanup | Clear timers, map speed to delay |
| 18 | High | Textarea readonly state | Disable textarea, update title during Run |
| 19 | Medium | Empty program handling | Guard parseProgram() and UI updates |
| 20 | High | Stale closure regression | Use isAnimating guard and read state from refs |

---

## Recommended Implementation Order

1. **Phase 1 (Core State Management):**
   - Test 6: Implement resetState()
   - Test 11: Implement setRegister() with 0xFF masking
   - Test 2: Implement HLT opcode

2. **Phase 2 (Instruction Execution):**
   - Test 8/12: Implement parseLiteral()
   - Test 1: Implement MVI, ADD
   - Test 13: Implement SUB
   - Test 11: Implement INR, DCR
   - Test 10: Implement MOV

3. **Phase 3 (Error Handling):**
   - Test 7: Implement opcode validation
   - Test 9: Implement operand count validation
   - Test 14: Implement comment/blank line handling

4. **Phase 4 (UI & Animation):**
   - Test 3: Implement phase chip animation
   - Test 5: Implement pause/resume logic
   - Test 17: Implement speed slider
   - Test 18: Implement textarea readonly state
   - Test 20: Implement isAnimating guard

5. **Phase 5 (Polish):**
   - Test 4: Verify Run/Step determinism
   - Test 15/16: Implement easter-egg quips
   - Test 19: Handle empty programs

---

## Conclusion

All 20 tests are comprehensive and well-designed to catch major bugs. The most critical issues are:
- **8-bit wrapping** (test 11)
- **Error validation and messaging** (tests 7, 8, 9)
- **Phase animation and closure safety** (tests 3, 20)
- **State reset and pause/resume** (tests 5, 6)

Once these are addressed, the remaining tests should pass quickly.
