import { driver } from '@wdio/globals';
import { selectors } from '../../selectors/appSelectors.ts';
import { BasePage } from './base.page.ts';


class LoanResubmissionPage extends BasePage {
    private readonly captureButton = selectors.captureButton;
    private readonly skipCamera = process.env.RUN_CAMERA !== 'true';
    private async nativeLabelExists(text: string, maxScrolls = 4): Promise<boolean> {
        const xpath =
            `//*[contains(@label,"${text}") or contains(@name,"${text}") or contains(@value,"${text}")]`;
        await driver.switchContext('NATIVE_APP');
        try {
            let el = driver.$(xpath);
            for (let i = 0; i <= maxScrolls; i++) {
                if ((await el.isExisting()) && (await el.isDisplayed())) return true;
                if (i < maxScrolls) {
                    await this.nativeSwipeUp();
                    await driver.pause(500);
                    el = driver.$(xpath);
                }
            }
            return false;
        } finally {
            await driver.switchContext('FLUTTER');
        }
    }
    private async dumpNativeSource(tag: string) {
        await driver.switchContext('NATIVE_APP');
        try {
            const src = await driver.getPageSource();
            console.log(`\n===== ${tag} START =====\n${src}\n===== ${tag} END =====\n`);
        } finally {
            await driver.switchContext('FLUTTER');
        }
    }
    private async nativeSwipeUp() {
        await driver
            .action('pointer', { parameters: { pointerType: 'touch' } })
            .move({ x: 200, y: 650 })
            .down()
            .pause(100)
            .move({ duration: 500, x: 200, y: 300 })
            .up()
            .perform();
    }
    private async tapNativeByLabelContains(text: string, waitAfter = 1500, timeout = 15000) {
        const xpath =
            `//*[contains(@label,"${text}") or contains(@name,"${text}") or contains(@value,"${text}")]`;
        await driver.switchContext('NATIVE_APP');
        try {
            let el = driver.$(xpath);
            for (let i = 0; i < 6; i++) {
                if ((await el.isExisting()) && (await el.isDisplayed())) break;
                await this.nativeSwipeUp();
                await driver.pause(700);
                el = driver.$(xpath);
            }
            await el.waitForDisplayed({ timeout });
            await el.click();
        } finally {
            await driver.switchContext('FLUTTER');
        }
        await driver.pause(waitAfter);
    }
    private async enterNativeText(labelContains: string, value: string, waitAfter = 1500) {
        await driver.switchContext('NATIVE_APP');
        try {
            const field = driver.$(
                `//XCUIElementTypeTextField[contains(@label,"${labelContains}") or ` +
                `contains(@value,"${labelContains}") or contains(@name,"${labelContains}")]`
            );
            await field.waitForDisplayed({ timeout: 15000 });
            await field.click();
        } finally {
            await driver.switchContext('FLUTTER');
        }
        await driver.pause(600);
        await driver.execute('flutter:enterText', value);
        await driver.pause(waitAfter);
    }
    async openResubmittedLoans() {
        await this.tapNativeByLabelContains('ReSubmitted', 2000);
    }

    async searchLoan(loanId: string) {
        await this.enterNativeText('Search Loan', loanId, 2000);
    }

    async openLoanDetails() {
        await this.tapNativeByLabelContains('LOAN DETAILS', 2000);
    }

    async clickUpdateDetails() {
        await this.tapNativeByLabelContains('UPDATE DETAILS', 2000);
    }

    async clickBasicEligibilityCheck() {
        await this.tapNativeByLabelContains('Basic eligibility check', 2000);
    }

    async verifyScreenVisible(text: string): Promise<boolean> {
        return this.nativeLabelExists(text, 2);
    }

    async clickNext(times = 1) {
        for (let i = 0; i < times; i++) {
            await this.waitForLoadingToFinish();
            await this.tapNativeByLabelContains('NEXT', 1500);
        }
    }
    async advanceToSubmit(maxSteps = 30): Promise<boolean> {
        for (let i = 0; i < maxSteps; i++) {
            await this.waitForLoadingToFinish();
            if (await this.nativeLabelExists('SUBMIT', 2)) {
                console.log(`advanceToSubmit: reached SUBMIT after ${i} NEXT taps`);
                return true;
            }
            if (!(await this.nativeLabelExists('NEXT'))) {
                console.log(`advanceToSubmit: no NEXT and no SUBMIT at step ${i} — dumping screen`);
                await this.dumpNativeSource(`STUCK AT STEP ${i}`);
                return false;
            }
            console.log(`advanceToSubmit: step ${i} -> tapping NEXT`);
            await this.tapNativeByLabelContains('NEXT', 1500);
        }
        return this.nativeLabelExists('SUBMIT', 2);
    }
    private async confirmCropTick() {
        const labels = ['Crop', 'Done', 'Choose', '✓', 'OK'];
        await driver.switchContext('NATIVE_APP');
        try {
            let tapped = false;
            await driver.waitUntil(async () => {
                for (const l of labels) {
                    const el = driver.$(`~${l}`);
                    if (await el.isExisting()) { await el.click(); tapped = true; return true; }
                }
                return false;
            }, { timeout: 15000, interval: 500, timeoutMsg: 'crop confirm control never appeared' });
            if (!tapped) throw new Error('crop confirm control never appeared');
        } finally {
            await driver.switchContext('FLUTTER');
        }
        await driver.pause(1500);
    }
    private async tapShutter() {
        try {
            await this.waitForDisplayed(this.captureButton, 8000);
            await driver.execute('flutter:clickElement', this.captureButton, { timeout: 15000 });
        } catch (e) {
            await this.tapNativeByLabelContains('Capture', 1000);
        }
        await driver.pause(1000);
    }
    async retakeAndCapture() {
        if (this.skipCamera) {
            console.log('retakeAndCapture: skipped (no camera on simulator); existing photo is kept');
            return;
        }
        await this.tapNativeByLabelContains('RETAKE', 1000);
        await this.tapNativeByLabelContains('Camera', 3000);
        await this.tapShutter();
        await this.confirmCropTick();
    }
    async captureBranchManagerPicture() {
        if (this.skipCamera) {
            console.log('captureBranchManagerPicture: skipped (no camera on simulator)');
            return;
        }
        await this.tapNativeByLabelContains('Capture', 1500);
        await this.tapNativeByLabelContains('Camera', 3000);
        await this.tapShutter();
        await this.confirmCropTick();
    }
    async addGstDocument(documentNumber: string) {
        if (this.skipCamera) {
            console.log('addGstDocument: skipped (front/back images need a camera not present on simulator)');
            return;
        }
        await this.tapNativeByLabelContains('ADD DOCUMENT', 1200);
        await this.tapNativeByLabelContains('Select Document', 1000);
        await this.tapNativeByLabelContains('GST', 1000);
        await this.enterNativeText('Document Number', documentNumber);
        await this.captureViaTile('Front');
        await this.captureViaTile('Back');
        await this.tapNativeByLabelContains('ADD', 1500);
    }
    private async captureViaTile(tileLabelContains: string) {
        await this.tapNativeByLabelContains(tileLabelContains, 1000);
        await this.tapNativeByLabelContains('Camera', 3000);
        await this.tapShutter();
        await this.confirmCropTick();
    }
    async submit() {
        await this.tapNativeByLabelContains('SUBMIT', 1500);
    }

    async confirm() {
        await this.tapNativeByLabelContains('CONFIRM', 2000);
    }
}

export default new LoanResubmissionPage();
