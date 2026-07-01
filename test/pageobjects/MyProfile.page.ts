// MyProfile.page.ts
import { selectors } from '../../selectors/appSelectors.ts';
import { BasePage } from './base.page.ts';

class MyProfilePage extends BasePage {
    private readonly menuIcon = selectors.menuIcon;
    private readonly myProfileText = selectors.myprofileText;
    private readonly profileBackButton = selectors.profileBackButton;
    private readonly dashboardText = selectors.dashboardText;

    async openMenu() {
        await this.tapElement(this.menuIcon, 500);
    }

    async clickMyProfile() {
        await this.waitForDisplayed(this.myProfileText, 20000);
        await this.tapElement(this.myProfileText, 1000);
    }

    async isProfilePageDisplayed(): Promise<boolean> {
        await this.waitForDisplayed(this.profileBackButton, 20000);
        return true;
    }

    async goBackToDashboard() {
        await this.tapElement(this.profileBackButton, 1000);
        await this.waitForDisplayed(this.dashboardText, 20000);
    }
}

export default new MyProfilePage();