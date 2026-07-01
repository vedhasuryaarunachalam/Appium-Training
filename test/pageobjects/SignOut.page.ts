import { selectors } from '../../selectors/appSelectors.ts';
import { BasePage } from './base.page.ts';

class SignOutPage extends BasePage {
    private readonly menuIcon = selectors.menuIcon;
    private readonly signOutText = selectors.signOut;
    private readonly employeeField = selectors.employeeField;

    async openMenu() {
        await this.tapElement(this.menuIcon, 500);
    }

    async clickSignOut() {
        await this.tapElement(this.signOutText, 1000); 
    }

    async verifySignedOut() {
        const isFound = await this.waitForDisplayed(this.employeeField, 10000);
        expect(isFound).toBe(true);
    }
}

export default new SignOutPage();
