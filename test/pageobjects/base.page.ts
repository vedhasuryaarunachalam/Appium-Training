import { driver } from '@wdio/globals';
import { byValueKey} from 'appium-flutter-finder'; 

export class BasePage {
    /**
     * Wait for an element to be displayed in Flutter.
     * @param selector Flutter element finder locator.
     * @param timeout milliseconds timeout (default 10000).
     */
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

    /**
     * Tap on a Flutter element, wait for it to be displayed first.
     * @param selector Flutter element finder locator.
     * @param waitAfterTap Optional pause time after tap in milliseconds to ensure transitions complete (default 0).
     */
    async tapElement(selector: any, waitAfterTap = 300) {
    await this.waitForDisplayed(selector);

    await driver.execute('flutter:clickElement', selector, {
        timeout: 15000,
    });

    await driver.pause(waitAfterTap);

    return true;
}

    /**
     * @param selector Flutter element finder locator.
     * @param value Text to enter.
     */
    async enterText(selector: any, value: string) {
    try {
        await this.waitForDisplayed(selector);

        await driver.execute('flutter:clickElement', selector, { timeout: 15000 });

        // Wait until Flutter settles
        await driver.pause(1000);

        // Verify the field is still available
        await this.waitForDisplayed(selector);

        await driver.execute('flutter:enterText', value);

        await driver.pause(300);

        return true;
    } catch (err: any) {
        console.warn(
            `enterText failed for selector: ${JSON.stringify(selector)}. Error: ${err.message}`
        );
        throw err;
    }
}
}
