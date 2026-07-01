import { selectors } from '../../selectors/appSelectors.ts';
import { BasePage } from './base.page.ts';
import { byText } from 'appium-flutter-finder';

class SetTargetPage extends BasePage {
    private readonly menuIcon = selectors.menuIcon;
    private readonly setTargetMenuOption = selectors.setTarget;
    private readonly croDropdown = selectors.selectCRO;
    private readonly yearDropdown = selectors.selectFinancialYear;
    private readonly monthDropdown = selectors.selectMonth;
    private readonly amountField = selectors.targetAmount;
    private readonly setTargetBtn = byText('Set Target'); 

    async openMenu() {
        await this.tapElement(this.menuIcon, 500);
    }

    async clickSetTargetInMenu() {
        await this.tapElement(this.setTargetMenuOption, 1000); 
    }

    async fillTargetDetails(croName = 'User_c72930 User_f2b878') {
        await this.tapElement(this.croDropdown, 500);
        await this.tapElement(byText(croName), 500);

        await this.tapElement(this.yearDropdown, 500);
        await this.tapElement(byText('2026'), 500);

        await this.tapElement(this.monthDropdown, 500);
        await this.tapElement(byText('July'), 500);

        await this.enterText(this.amountField, '500');
    }
    async clickSetTargetButton() {
        try {
            await this.tapElement(this.setTargetBtn, 1000);
        } catch (e) {
            await this.tapElement(selectors.submitButton, 1000);
        }
    }
}

export default new SetTargetPage();
