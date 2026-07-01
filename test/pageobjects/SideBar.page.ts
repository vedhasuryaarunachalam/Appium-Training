import { selectors } from '../../selectors/appSelectors.ts';
import { BasePage } from './base.page.ts';

class SideBarPage extends BasePage {
    private readonly menuIcon = selectors.menuIcon;
    private readonly myProfileText = selectors.myprofileText;
    private readonly dashboardText = selectors.dashboardText;
    private readonly customersText = selectors.customersText;
    private readonly loansText = selectors.loansText;
    private readonly signOutText = selectors.signOut;

    async openMenu() {
        await this.tapElement(this.menuIcon, 500);
    }

    async verifyMenuOpened() {
        const profileVisible = await this.waitForDisplayed(this.myProfileText, 5000);
        const dashboardVisible = await this.waitForDisplayed(this.dashboardText, 5000);
        const customersVisible = await this.waitForDisplayed(this.customersText, 5000);
        const loansVisible = await this.waitForDisplayed(this.loansText, 5000);
        const signOutVisible = await this.waitForDisplayed(this.signOutText, 5000);

        expect(profileVisible).toBe(true);
        expect(dashboardVisible).toBe(true);
        expect(customersVisible).toBe(true);
        expect(loansVisible).toBe(true);
        expect(signOutVisible).toBe(true);
    }

    async closeMenu() {
        await this.tapElement(this.dashboardText, 1000);
    }
}

export default new SideBarPage();
