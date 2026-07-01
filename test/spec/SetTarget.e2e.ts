import LoginPage from '../pageobjects/Login.page.ts';
import SetTargetPage from '../pageobjects/SetTarget.page.ts';
import { testData } from './testData.ts';

describe('Set target to CRO Test', () => {
    it('Verify set target to CRO', async () => {
        await LoginPage.login(testData.username2, testData.password);
        await SetTargetPage.openMenu();
        await SetTargetPage.clickSetTargetInMenu();
        await SetTargetPage.fillTargetDetails();
        await SetTargetPage.clickSetTargetButton();
    });
});
