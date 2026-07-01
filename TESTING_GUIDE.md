# Test Framework Guide — `pageobjects/` and `spec/`

A line-by-line explanation of how this WebdriverIO + Appium + Flutter test suite is
built, what each piece of syntax actually does, and **why** it is written that way.

---

## Table of contents

1. [The big picture — how a test runs](#1-the-big-picture)
2. [The tech stack in one paragraph](#2-the-tech-stack)
3. [`selectors/appSelectors.ts` — how we find widgets](#3-selectors)
4. [`base.page.ts` — the shared engine (explained in full)](#4-basepagets)
   - [Why a base class at all?](#41-why-a-base-class)
   - [The `import` line](#42-the-import)
   - [JSDoc and `@param` — what it is and why we use it](#43-jsdoc-and-param)
   - [`waitForDisplayed`](#44-waitfordisplayed)
   - [`tapElement`](#45-tapelement)
   - [`enterText`](#46-entertext)
   - [`waitForLoadingToFinish`](#47-waitforloadingtofinish)
5. [The page objects — the pattern](#5-the-page-objects)
   - [Anatomy of a page object (`Login.page.ts`)](#51-anatomy)
   - [Why `export default new LoginPage()`](#52-singleton)
   - [A complex page object (`DueCollection.page.ts`)](#53-duecollection)
6. [The spec files — the actual tests](#6-the-spec-files)
7. [`testData.ts` and environment variables](#7-testdata)
8. [`Utils/utils.ts`](#8-utils)
9. [TypeScript / JavaScript syntax cheat-sheet](#9-syntax-cheatsheet)

---

<a name="1-the-big-picture"></a>
## 1. The big picture — how a test runs

The suite uses the **Page Object Model (POM)** — a design pattern that splits the code
into three layers:

```
 spec/*.e2e.ts        →  WHAT to test   (the test steps, in business language)
 pageobjects/*.page.ts →  HOW to do it   (tap this, type that, wait for this screen)
 selectors/            →  WHERE things are (the widget locators)
 base.page.ts          →  the shared low-level engine every page object reuses
```

**Why split it up?** If a screen changes (say the login button moves or gets a new id),
you fix **one** line in **one** page object instead of editing every test that logs in.
The specs stay readable ("enter username, tap login") and never touch raw Appium calls.

A single test flows top-to-bottom through the layers:

```
Login.e2e.ts                     "Verify user can launch the app"
  └─ LoginPage.enterUsername()   (a page-object method)
       └─ this.enterText(...)    (inherited from BasePage)
            └─ driver.execute('flutter:enterText', ...)   (the real Appium command)
                 └─ Appium → Flutter driver → the app on the emulator
```

---

<a name="2-the-tech-stack"></a>
## 2. The tech stack in one paragraph

- **WebdriverIO (`wdio`)** — the test runner. It reads `wdio.conf.ts`, starts Appium,
  spawns a worker per spec file, and exposes the global `driver`/`browser` object.
- **Appium** — the automation server that talks to the device/emulator.
- **appium-flutter-driver** — an Appium driver specialised for **Flutter** apps. Instead
  of finding native Android views, it talks to the Flutter engine and finds **widgets**.
- **appium-flutter-finder** — the helper that builds Flutter locators (`byValueKey`,
  `byText`, `byType`).
- **Mocha** — the test framework that gives us `describe()`, `it()`, `beforeEach()`.
- **expect-webdriverio** — the assertion library that gives us `expect(x).toBe(y)`.

---

<a name="3-selectors"></a>
## 3. `selectors/appSelectors.ts` — how we find widgets

Everything on screen must be **located** before we can tap or type into it. This file is
one big object of locators so they live in a single place:

```ts
import { byValueKey, byText } from 'appium-flutter-finder';

export const selectors = {
    employeeField: byValueKey('employeeIdField'),
    loginButton:   byValueKey('loginButton'),
    bankTransfer:  byText('Bank Transfer'),
    // ...
};
```

There are three finder types, and choosing the right one matters:

| Finder | What it matches | When to use it |
|--------|-----------------|----------------|
| `byValueKey('x')` | A widget the developers tagged with `Key('x')` in the Flutter code | **Best choice** — stable, unique, survives text/label changes |
| `byText('CONFIRM')` | A widget whose **full** visible text is exactly `CONFIRM` | When there is no key; must match the **entire** string (see gotcha below) |
| `byType('TextField')` | The first widget of that Flutter class | Last resort — when there's no key and no unique text (we use it for the deposit amount field) |

> **`byText` gotcha we hit in this project:** `byText('1736550')` matched the *search box
> text*, not the due card, because the card actually renders `ID: 1736550`. And
> `byText('User_c72930')` failed because the dropdown row's full text was
> `User_c72930 User_f2b878`. `byText` is exact-and-whole-string — not "contains".

`export const selectors = {...}` makes this object importable elsewhere with
`import { selectors } from '.../appSelectors.ts'`.

---

<a name="4-basepagets"></a>
## 4. `base.page.ts` — the shared engine (explained in full)

This is the most important file to understand. Here it is with every part explained.

```ts
import { driver } from '@wdio/globals';
import { byValueKey } from 'appium-flutter-finder';

export class BasePage {
    async waitForDisplayed(selector: any, timeout = 10000) {
        try {
            await driver.execute('flutter:waitFor', selector, timeout);
            return true;
        } catch (err: any) {
            console.warn(`waitForDisplayed failed for selector: ${JSON.stringify(selector)}. Error: ${err.message}`);
            throw err;
        }
    }

    async waitForLoadingToFinish() {
        try {
            await driver.execute('flutter:waitForAbsent', byValueKey('loadingIndicator'), 10000);
        } catch (e) { /* no loader present, fine */ }
    }

    async tapElement(selector: any, waitAfterTap = 0) {
        try {
            await this.waitForDisplayed(selector);
            await driver.execute('flutter:clickElement', selector, { timeout: 15000 });
            if (waitAfterTap > 0) {
                await driver.pause(waitAfterTap);
            }
            return true;
        } catch (err: any) {
            console.warn(`tapElement failed for selector: ${JSON.stringify(selector)}. Error: ${err.message}`);
            throw err;
        }
    }

    async enterText(selector: any, value: string) {
        try {
            await this.waitForDisplayed(selector);
            await driver.execute('flutter:clickElement', selector, { timeout: 5000 });
            await driver.pause(500); // Wait for focus/keyboard to appear
            await driver.execute('flutter:enterText', value);
            return true;
        } catch (err: any) {
            console.warn(`enterText failed for selector: ${JSON.stringify(selector)}. Error: ${err.message}`);
            throw err;
        }
    }
}
```

<a name="41-why-a-base-class"></a>
### 4.1 Why a base class at all?

Every screen needs the same three basic actions: **wait for something**, **tap
something**, **type into something**. Rather than copy that Appium plumbing into every
page object, we write it **once** in `BasePage`. Each page object then says
`class LoginPage extends BasePage`, which means *"LoginPage inherits every method of
BasePage"*. Inside a page object, `this.tapElement(...)` calls the shared implementation.

This is the **DRY** principle (Don't Repeat Yourself). If we ever need to change how a tap
works (e.g. add a retry), we change it in one place and every screen benefits.

<a name="42-the-import"></a>
### 4.2 The `import` line

```ts
import { driver } from '@wdio/globals';
```

`driver` is the WebdriverIO **session object** — your remote control for the app. Every
`driver.execute(...)` call sends a command over the wire to Appium. `@wdio/globals`
provides it (and its TypeScript types) so the editor knows `driver.execute` exists.

> This exact import is why the earlier "`Property 'execute' does not exist on type
> 'Browser'`" error appeared in `Utils/utils.ts` — that file was outside the `tsconfig`
> `include`, so these types weren't applied there.

<a name="43-jsdoc-and-param"></a>
### 4.3 JSDoc and `@param` — what it is and why we use it

Above the methods you'll see comment blocks like:

```ts
/**
 * Tap on a Flutter element, wait for it to be displayed first.
 * @param selector Flutter element finder locator.
 * @param waitAfterTap Optional pause time after tap in milliseconds (default 0).
 */
async tapElement(selector: any, waitAfterTap = 0) { ... }
```

**What it is:** This is **JSDoc** — a standard comment format that starts with `/**` (two
stars). Tools understand it; a plain `//` comment is just text.

**What `@param` does:** `@param <name> <description>` documents **one function
parameter**. The format is deliberate:

```
@param  waitAfterTap  Optional pause time after tap in milliseconds (default 0).
        └─ the name     └─ what it means / units / default
```

**Why we use it (the real payoff):**

1. **Editor tooltips (IntelliSense).** When you hover over `tapElement(` or type its `(`,
   VS Code shows the description of each argument. So a teammate writing
   `tapElement(selectors.loginButton, ???)` instantly sees *"waitAfterTap: pause in
   milliseconds"* — they don't have to open `base.page.ts` to guess what the second
   number means.
2. **It documents intent that types can't.** TypeScript already tells you `waitAfterTap`
   is a `number`. JSDoc tells you it's **milliseconds** and defaults to 0 — information
   the type alone can't convey.
3. **Zero runtime cost.** Comments are stripped at run time; they exist purely to help the
   human reading/using the code.

You'll also see `@param {object} config ...` with a `{type}` in braces in `wdio.conf.ts`.
The braces are the JSDoc way of stating the type in plain JavaScript files that don't have
TypeScript annotations. In our `.ts` page objects the type is already in the signature
(`selector: any`), so we omit the braces and keep just the description.

<a name="44-waitfordisplayed"></a>
### 4.4 `waitForDisplayed(selector, timeout = 10000)`

```ts
await driver.execute('flutter:waitFor', selector, timeout);
```

- `driver.execute('flutter:waitFor', ...)` runs a **custom Flutter-driver command**. The
  first argument is the command name (a string starting with `flutter:`), the rest are its
  arguments. `flutter:waitFor` blocks until the widget matched by `selector` appears, or
  throws after `timeout` ms.
- `timeout = 10000` is a **default parameter** — if the caller doesn't pass a timeout, it
  uses 10000 ms (10 s). So `waitForDisplayed(x)` waits 10 s; `waitForDisplayed(x, 3000)`
  waits 3 s.
- `async` / `await`: talking to a device takes time, so these calls are **asynchronous**.
  `async` marks the function as returning a `Promise`; `await` pauses until that Promise
  resolves before moving to the next line. Without `await`, the code would fire the
  command and race ahead before the app responded.
- The `try { ... } catch (err) { console.warn(...); throw err; }` pattern **logs a helpful
  message and then re-throws**. Re-throwing is important: it lets the test still **fail**
  (a swallowed error would make a broken test look like it passed), while the log tells you
  *which selector* failed.

<a name="45-tapelement"></a>
### 4.5 `tapElement(selector, waitAfterTap = 0)`

The single most-used action. It does three things in order:

1. `await this.waitForDisplayed(selector);` — never tap something that isn't on screen yet.
2. `await driver.execute('flutter:clickElement', selector, { timeout: 15000 });` — the
   actual tap. `{ timeout: 15000 }` is an options object telling the driver to allow up to
   15 s for the click.
3. `if (waitAfterTap > 0) await driver.pause(waitAfterTap);` — an **optional settle
   pause** after tapping. Many taps trigger a screen transition or an animation; pausing
   lets the next screen render before the next action runs. That's why calls look like
   `this.tapElement(this.loginButton, 1000)` — *tap, then wait 1 s*.

<a name="46-entertext"></a>
### 4.6 `enterText(selector, value)`

Typing into a Flutter field is a 3-step dance:

```ts
await this.waitForDisplayed(selector);                       // 1. field exists
await driver.execute('flutter:clickElement', selector, {timeout: 5000}); // 2. focus it
await driver.pause(500);                                     // 3. let keyboard/focus settle
await driver.execute('flutter:enterText', value);           //    type into the focused field
```

Note `flutter:enterText` types into whatever field is **currently focused** — that's why
step 2 (clicking the field to focus it) must happen first.

<a name="47-waitforloadingtofinish"></a>
### 4.7 `waitForLoadingToFinish()`

```ts
try {
    await driver.execute('flutter:waitForAbsent', byValueKey('loadingIndicator'), 10000);
} catch (e) { /* no loader present, fine */ }
```

`flutter:waitForAbsent` is the opposite of `waitFor` — it blocks until a widget
**disappears**. Here it waits for a spinner (`loadingIndicator`) to vanish. The empty
`catch` **deliberately swallows** the error: if there was never a spinner, that's fine, not
a failure. (Contrast with 4.4, where we re-throw — the difference in intent is the whole
point.)

---

<a name="5-the-page-objects"></a>
## 5. The page objects — the pattern

<a name="51-anatomy"></a>
### 5.1 Anatomy of a page object (`Login.page.ts`)

```ts
import { selectors } from '../../selectors/appSelectors.ts';
import { BasePage } from './base.page.ts';

class LoginPage extends BasePage {
    private readonly usernameField = selectors.employeeField;
    private readonly passwordField = selectors.passwordField;
    private readonly loginButton   = selectors.loginButton;
    private readonly menuIcon      = selectors.menuIcon;

    async enterUsername(username: string) {
        await this.enterText(this.usernameField, username);
    }

    async login(username: string, password: string) {
        try {
            await this.waitForDisplayed(this.menuIcon, 3000);
            console.log("Already logged in, skipping...");
            return;                       // already logged in — bail out early
        } catch (e) {
            console.log("Not logged in, executing login flow...");
        }
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.tapCheckbox();
        await this.clickLogin();
    }
}

export default new LoginPage();
```

Piece by piece:

- **`class LoginPage extends BasePage`** — LoginPage *is a* BasePage plus login-specific
  methods. `extends` gives it `enterText`, `tapElement`, `waitForDisplayed` for free.
- **`private readonly usernameField = selectors.employeeField;`**
  - `private` — this field can only be used **inside** this class (a test can't reach in
    and grab `LoginPage.usernameField`). It keeps the locator an internal detail.
  - `readonly` — it's assigned once and can never be reassigned. Locators are constants, so
    this prevents accidental mutation.
  - Naming the selector here (`usernameField`) gives it a **meaningful name** local to this
    screen, instead of repeating `selectors.employeeField` everywhere.
- **`async enterUsername(username: string)`** — a small, business-named wrapper. The spec
  reads `LoginPage.enterUsername(...)`, which is far clearer than a raw `enterText` call.
  `username: string` is a **typed parameter** — TypeScript will error if you pass a number.
- **`this.`** — refers to the current instance. `this.enterText(...)` calls the inherited
  BasePage method; `this.usernameField` reads this screen's locator.
- **The `login()` "already logged in?" guard** — it first waits 3 s for the post-login
  `menuIcon`. If it's there, we're already in, so it `return`s early and skips typing
  credentials. If not, the `catch` runs and it performs the full login. This makes the
  method **idempotent** — safe to call whether or not you're already logged in (handy in
  `beforeEach`).

<a name="52-singleton"></a>
### 5.2 Why `export default new LoginPage()`

```ts
export default new LoginPage();
```

We export an **already-created instance**, not the class. So specs write:

```ts
import LoginPage from '../pageobjects/Login.page.ts';
await LoginPage.login(...);          // use it directly — no `new` needed
```

This is the **singleton pattern**: one shared LoginPage object across the whole test run.
Page objects hold no per-test state (just locators), so a single shared instance is simpler
than making every test do `const loginPage = new LoginPage()`.

<a name="53-duecollection"></a>
### 5.3 A complex page object (`DueCollection.page.ts`)

Most methods follow the simple wrapper pattern above. Three parts are worth calling out
because they solve real problems:

**(a) Choosing a robust locator.** `clickParticularDueID` taps the card's **`Complete`**
button rather than `byText(dueId)`, because the bare id also matched the search-box text:

```ts
async clickParticularDueID(dueId: string) {
    const completeButton = byText('Complete');
    try {
        await this.waitForDisplayed(completeButton, 10000);  // proves a due card rendered
    } catch (error) {
        throw new Error(`Due ID ${dueId} was not found ...`); // clearer failure message
    }
    await this.tapElement(completeButton, 1000);
}
```

**(b) Verifying an outcome that isn't a normal screen.** Paying by wallet shows a transient
toast (*"This installment will be auto-paid on the due date"*) that the Flutter driver
**cannot see** (it's rendered outside the widget tree). So we assert the **stable resulting
state** instead — we're still on the details screen (or the dashboard if it completed):

```ts
async confirmWalletPayment() {
    await this.tapElement(this.confirmTwoBtn, 1500);
    try {
        expect(await this.waitForDisplayed(byText('Mode of Payment'), 6000)).toBe(true);
    } catch (e) {
        expect(await this.waitForDisplayed(byText('Welcome Back!'), 8000)).toBe(true);
    }
}
```

**(c) Driving the NATIVE camera (context switching).** Bank-transfer uploads a photo via
the **native Android camera**, which the Flutter driver can't touch. We temporarily switch
Appium's *context* from `FLUTTER` to `NATIVE_APP`, tap by screen coordinates, then switch
back:

```ts
private async nativeTap(x: number, y: number) {
    await driver.action('pointer', { parameters: { pointerType: 'touch' } })
        .move({ x, y }).down().pause(120).up().perform();   // a W3C touch tap at (x,y)
}

async uploadDocumentViaCamera() {
    await this.tapElement(this.uploadDocBtn, 800);   // "Upload Document" (Flutter)
    await this.tapElement(this.cameraOption, 3000);  // "Camera" -> native camera opens

    await driver.switchContext('NATIVE_APP');        // leave Flutter, drive native UI
    try {
        await driver.pause(1500);
        await this.nativeTap(540, 2280);  // dismiss first-run "NEXT" (no-op if absent)
        await driver.pause(1500);
        await this.nativeTap(540, 2166);  // shutter
        for (let attempt = 0; attempt < 5; attempt++) {   // retry the crop-screen ✓
            await driver.pause(2500);
            await this.nativeTap(1014, 196);              // top-right check mark
            await driver.switchContext('FLUTTER');
            try {
                await this.waitForDisplayed(byText('Mode of Payment'), 2500);
                return;                                    // back on the app — done
            } catch (e) {
                await driver.switchContext('NATIVE_APP');  // still native — tap ✓ again
            }
        }
    } finally {
        await driver.switchContext('FLUTTER');   // ALWAYS return to Flutter, even on error
    }
}
```

Key ideas here:
- **`switchContext`** — an Appium session can have multiple *contexts*. `FLUTTER` sees
  Flutter widgets; `NATIVE_APP` sees the native Android layer (needed for the OS camera).
- **Coordinate taps** — the native camera's shutter/checkmark aren't in any queryable tree,
  so we tap fixed `(x, y)` pixels (stable on the `Pixel_8a` 1080×2400 AVD).
- **The retry loop** — the crop screen appears after a variable delay, so we tap the ✓ and
  check whether the Flutter screen came back; if not, tap again.
- **`try ... finally`** — `finally` runs **no matter what** (success, failure, or early
  `return`), guaranteeing we never leave the session stuck in the native context.

---

<a name="6-the-spec-files"></a>
## 6. The spec files — the actual tests

Specs describe **what** to verify, in plain steps. Example (`SideBar.e2e.ts` shape):

```ts
import LoginPage from '../pageobjects/Login.page.ts';
import DueCollectionPage from '../pageobjects/DueCollection.page.ts';
import { testData } from './testData.ts';

describe('Due Collection Test', () => {          // a test SUITE (a group of tests)

    beforeEach(async () => {                     // runs before EVERY `it` below
        await LoginPage.login(testData.username, testData.password);
    });

    it('Verify Due collection - cash with Normal', async () => {   // ONE test case
        await navigateToParticularDue(testData.dueId);
        await DueCollectionPage.selectModeOfPayment('cash');
        await DueCollectionPage.clickConfirmTwo();
        await DueCollectionPage.clickConfirmPaymentDetails();
        await DueCollectionPage.clickProceedOnAccountantScreen();
        await DueCollectionPage.verifyPaymentSuccess();          // the assertion lives here
    });
});
```

What each Mocha keyword does:

| Keyword | Meaning |
|---------|---------|
| `describe('name', () => {...})` | Groups related tests into a **suite**. Pure organisation + nicer reports. |
| `it('should ...', async () => {...})` | **One test case.** The string is what shows up as ✓/✖ in the report. |
| `beforeEach(async () => {...})` | A **hook** that runs before *each* `it` in the suite. We log in here so every test starts logged in. (`before` runs once; `beforeEach` runs every time.) |
| `async () => {...}` | An **async arrow function** — the test body. `async` lets us `await` inside it. |

Other things to notice:

- **The spec never touches Appium directly.** It only calls page-object methods. That's the
  POM payoff — specs read like a manual test script.
- **Assertions** (`expect(...).toBe(true)`) usually live *inside* the page object's
  `verify...` methods, so the spec stays declarative. `expect` comes from
  `expect-webdriverio`; `.toBe(true)` fails the test if the value isn't exactly `true`.
- **`await` on every line** — each step must finish before the next begins. Forgetting an
  `await` is the #1 source of flaky Appium tests.
- **Local helper functions** — `navigateToParticularDue(dueId)` is defined once inside the
  `describe` and reused by every due test, so the multi-step navigation isn't copy-pasted.

---

<a name="7-testdata"></a>
## 7. `testData.ts` and environment variables

```ts
export const testData = {
    username: 'TCRO1',
    password: 'Password@123',
    dueId: process.env.DUE_ID || '1736550',
    loanId: 'L202512AA0157'
};
```

- Centralising test inputs means changing a username happens in **one** place.
- **`process.env.DUE_ID || '1736550'`** reads the `DUE_ID` **environment variable** if it's
  set, otherwise falls back to `'1736550'`. `||` is "use the left value unless it's empty".
  This is why you can run `DUE_ID=1518790 npm test` to override the due without editing code
  — handy because each collectable due can only be used once.

---

<a name="8-utils"></a>
## 8. `Utils/utils.ts`

Standalone helper functions (`sendKeys`, `click`) that do the same work (`flutter:waitFor`
→ `flutter:clickElement` → `flutter:enterText`) as `BasePage`, but as plain functions
rather than class methods. They're an alternative style; the page objects use `BasePage`. Their
only dependency is `@wdio/globals` (for `driver`), which is why "installing dependencies for
utils.ts" needed nothing new — it was really a `tsconfig` `include` fix.

---

<a name="9-syntax-cheatsheet"></a>
## 9. TypeScript / JavaScript syntax cheat-sheet

Quick reference for the syntax you keep seeing:

| Syntax | Meaning |
|--------|---------|
| `async function` / `async () =>` | Function that runs asynchronously and returns a `Promise`. |
| `await x()` | Pause here until the Promise from `x()` resolves, then continue. |
| `class A extends B` | `A` inherits all methods/fields of `B` (inheritance). |
| `this.method()` | Call a method on the current object (including inherited ones). |
| `private readonly f = ...` | A field only usable inside the class, assignable only once. |
| `param: string` | A **typed** parameter — TypeScript enforces the type. |
| `timeout = 10000` | A **default value** used when the caller omits the argument. |
| `try { } catch (e) { } finally { }` | Run code; on error jump to `catch`; `finally` always runs. |
| `throw err` | Raise an error (fails the test). Re-throwing after logging keeps failures honest. |
| `` `text ${x}` `` | **Template literal** — a string with `${...}` values interpolated. |
| `a || b` | Value `a`, unless it's falsy (empty/undefined), then `b`. |
| `import { x } from 'y'` | Bring the named export `x` from module `y`. |
| `export default new A()` | Export a single ready-made instance (singleton) as the default. |
| `{ timeout: 15000 }` | An **object literal** passed as options to a function. |
| `/** ... @param name desc */` | **JSDoc** — structured documentation; powers editor tooltips. |

---

### One-line mental model

> **Specs** say *what* to test → they call **page objects** that say *how* → page objects
> reuse **BasePage** for the low-level *wait/tap/type* → which send `flutter:` commands
> through **`driver`** to Appium → to the app. Locators live in **selectors**, inputs in
> **testData**, and JSDoc/`@param` exist purely to make the code self-explanatory in your
> editor.
