import { driver } from '@wdio/globals';

async function waitForFlutter(selector: any, retries = 3) {
    for (let i = 1; i <= retries; i++) {
        try {
            if ((await driver.getContext()) !== 'FLUTTER') {
                await driver.switchContext('FLUTTER');
            }

            await driver.execute('flutter:waitFor', selector, 10000);
            return;
        } catch (err) {
            console.log(`waitFor retry ${i}/${retries}`);

            if (i === retries) {
                throw err;
            }

            await driver.pause(2000);
        }
    }
}

export async function click(selector: any) {
    await waitForFlutter(selector);

    await driver.execute('flutter:clickElement', selector, {
        timeout: 5000,
    });

    return true;
}

export async function sendKeys(selector: any, value: string) {
    await waitForFlutter(selector);

    await driver.execute('flutter:clickElement', selector, {
        timeout: 5000,
    });

    await driver.pause(500);

    await driver.execute('flutter:enterText', value);

    return true;
}