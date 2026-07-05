import { driver } from '@wdio/globals';
import { BasePage } from './base.page.ts';

class LoanResubmissionPage extends BasePage {
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

    async clickNext(times = 1) {
        for (let i = 0; i < times; i++) {
            await this.waitForLoadingToFinish();
            await this.tapNativeByLabelContains('NEXT', 1500);
        }
    }

    async verifyScreenVisible(text: string): Promise<boolean> {
        return this.nativeLabelExists(text, 2);
    }
}

export default new LoanResubmissionPage();
