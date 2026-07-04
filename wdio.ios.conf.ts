// iOS configuration — runs ONLY test/spec/SideBar.e2e.ts on an iPhone simulator.
//
// Prerequisites (must be provided by you — not installable from this project):
//   1. Full Xcode (from the Mac App Store) + an iOS Simulator runtime.
//      Verify with:  xcrun simctl list devices available | grep iPhone
//   2. The Appium XCUITest driver (the Flutter driver delegates to it on iOS):
//         npx appium driver install xcuitest
//   3. An iOS *simulator* build of the app (a .app bundle) built in debug/profile
//      mode with the Flutter driver extension enabled. Point IOS_APP at it, e.g.
//         IOS_APP=/absolute/path/to/Runner.app npm run test:ios
//
// The SideBar spec itself needs no changes — appium-flutter-driver uses the same
// byValueKey/byText finders on iOS as on Android.

export const config: WebdriverIO.Config = {
    runner: 'local',
    tsConfigPath: './test/tsconfig.json',

    port: 4723,

    // Only the BM Loan Resubmission spec, on its own.
    specs: [
        './test/spec/LoanResubmission.e2e.ts'
    ],
    exclude: [],

    maxInstances: 1,

    capabilities: [{
        platformName: 'iOS',
        'appium:automationName': 'Flutter',
        // "any iPhone simulator" — override via env if you like.
        'appium:deviceName': process.env.IOS_DEVICE || 'iPhone 15',
        'appium:platformVersion': process.env.IOS_VERSION || '26.5',
        // Path to the iOS *simulator* .app build (see prerequisites above).
        'appium:app': process.env.IOS_APP || `${process.cwd()}/app/Runner.app`,
        'appium:autoAcceptAlerts': true,
    }],

    logLevel: 'info',
    bail: 0,
    waitforTimeout: 10000,
    // iOS session creation builds WebDriverAgent on first run (several minutes),
    // so allow a generous timeout for the initial POST /session.
    connectionRetryTimeout: 360000,
    connectionRetryCount: 1,

    services: ['appium'],
    framework: 'mocha',

    reporters: ['spec', ['allure', { outputDir: 'allure-results' }]],

    mochaOpts: {
        ui: 'bdd',
        // The resubmission wizard drives several native camera captures, so the
        // single test needs a generous timeout.
        timeout: 300000
    },

    afterTest: async function (_test, _context, { passed }) {
        if (!passed) {
            await browser.takeScreenshot();
        }
    },
}
