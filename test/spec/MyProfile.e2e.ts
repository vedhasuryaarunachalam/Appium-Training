// MyProfile.e2e.ts
import LoginPage from '../pageobjects/Login.page.ts';
import MyProfilePage from '../pageobjects/MyProfile.page.ts';
import { testData } from './testData.ts';

describe('My Profile section Test', () => {
    it('Verify hamburger menu and My Profile section', async () => {
        await LoginPage.login(testData.username, testData.password);
        await MyProfilePage.openMenu();
        await MyProfilePage.clickMyProfile();
        await MyProfilePage.goBackToDashboard();
    });
});