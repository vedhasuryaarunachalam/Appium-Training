import LoginPage from '../pageobjects/Login.page.ts';
import { testData } from './testData.ts';

describe('Login Test', () => {
    it('Verify whether user can able to launch the app', async () => {
        await LoginPage.enterUsername(testData.username);
        await LoginPage.enterPassword(testData.password);
        await LoginPage.tapCheckbox();
        await LoginPage.clickLogin();
        await LoginPage.verifyLoggedIn();
    });
});
