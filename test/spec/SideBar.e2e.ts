import LoginPage from '../pageobjects/Login.page.ts';
import SideBarPage from '../pageobjects/SideBar.page.ts';
import { testData } from './testData.ts';

describe('Side bar Test', () => {
    it('Verify side bar menu opens and closes', async () => {
        await LoginPage.login(testData.username, testData.password);
        await SideBarPage.openMenu();
        await SideBarPage.verifyMenuOpened();
        await SideBarPage.closeMenu();
    });
});
