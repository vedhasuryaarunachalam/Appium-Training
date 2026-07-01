import { selectors } from '../../selectors/appSelectors.ts';
import { BasePage } from './base.page.ts';

class LoginPage extends BasePage {
    private readonly usernameField = selectors.employeeField;
    private readonly passwordField = selectors.passwordField;
    private readonly checkBox = selectors.checkbox;
    private readonly loginButton = selectors.loginButton;
    private readonly menuIcon = selectors.menuIcon;

    async enterUsername(username: string) {
        await this.enterText(this.usernameField, username);
    }

    async enterPassword(password: string) {
        await this.enterText(this.passwordField, password);
    }

    async tapCheckbox() {
        await this.tapElement(this.checkBox);
    }

    async clickLogin() {
        await this.tapElement(this.loginButton, 1000); 
    }
    async login(username: string, password: string) {
        try {
            await this.waitForDisplayed(this.menuIcon, 3000);
            console.log("Already logged in, skipping credentials entering...");
            return;
        } catch (e) {
            console.log("Not logged in, executing login flow...");
        }
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.tapCheckbox();
        await this.clickLogin();
    }


    async verifyLoggedIn() {
        const isFound = await this.waitForDisplayed(this.menuIcon, 10000);
        expect(isFound).toBe(true);
    }
}

export default new LoginPage();
