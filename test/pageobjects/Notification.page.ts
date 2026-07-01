import { selectors } from '../../selectors/appSelectors.ts';
import { BasePage } from './base.page.ts';
import { byText } from 'appium-flutter-finder';

class NotificationPage extends BasePage {
    private readonly notificationIcon = selectors.notificationIcon;
    private readonly notificationsHeader = byText('Notifications');

    async clickNotificationIcon() {
        await this.tapElement(this.notificationIcon, 1000); 
    }

    async verifyNotificationScreenOpened() {
        const isFound = await this.waitForDisplayed(this.notificationsHeader, 5000);
        expect(isFound).toBe(true);
    }
}

export default new NotificationPage();
