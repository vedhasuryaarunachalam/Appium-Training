import LoginPage from '../pageobjects/Login.page.ts';
import NotificationPage from '../pageobjects/Notification.page.ts';
import { testData } from './testData.ts';

describe('Notification Test', () => {
    it('Verify notification screen opens', async () => {
        await LoginPage.login(testData.username, testData.password);
        await NotificationPage.clickNotificationIcon();
        await NotificationPage.verifyNotificationScreenOpened();
    });
});
