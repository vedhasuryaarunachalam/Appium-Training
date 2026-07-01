import LoginPage from '../pageobjects/Login.page.ts';
import SignOutPage from '../pageobjects/SignOut.page.ts';
import { testData } from './testData.ts';

describe('Sign Out Test', () => {
    it('Verify whether user can able to sign out', async () => {
        await LoginPage.login(testData.username, testData.password);
        await SignOutPage.openMenu();
        await SignOutPage.clickSignOut();
        await SignOutPage.verifySignedOut();
    });
});
