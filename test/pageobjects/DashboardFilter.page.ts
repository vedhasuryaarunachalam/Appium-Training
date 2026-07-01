import { selectors } from '../../selectors/appSelectors.ts';
import { BasePage } from './base.page.ts';
import { byText } from 'appium-flutter-finder';

class DashboardFilterPage extends BasePage {
    private readonly filterIcon = selectors.filterIcon;
    private readonly lastMonth = selectors.lastMonth;
    private readonly lastMonthTargetText = byText('Last Month Target');

    async clickFilterIcon() {
        await this.tapElement(this.filterIcon, 500);
    }

    async selectLastMonth() {
        await this.tapElement(this.lastMonth, 500);
    }

    async applyFilter() {
        await this.clickFilterIcon();
        await this.selectLastMonth();
    }

    async verifyLastMonthFilterApplied() {
        await driver.back(); // Close the modal
        const isFound = await this.waitForDisplayed(this.lastMonthTargetText, 5000);
        expect(isFound).toBe(true);
    }
}

export default new DashboardFilterPage();
