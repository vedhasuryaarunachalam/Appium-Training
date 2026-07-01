import LoginPage from '../pageobjects/Login.page.ts';
import DashboardFilterPage from '../pageobjects/DashboardFilter.page.ts';
import { testData } from './testData.ts';

describe('Dash Board Filter Test', () => {
    it('Verify dashboard filter with last month option', async () => {
        await LoginPage.login(testData.username, testData.password);
        await DashboardFilterPage.applyFilter();
        await DashboardFilterPage.verifyLastMonthFilterApplied();
    });
});
