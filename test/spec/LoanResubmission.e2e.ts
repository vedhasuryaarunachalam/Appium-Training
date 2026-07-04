import LoginPage from '../pageobjects/Login.page.ts';
import LoanResubmissionPage from '../pageobjects/LoanResubmission.page.ts';
import { testData } from './testData.ts';


describe('BM Role - Loan Resubmission', () => {
    it('BM opens a resubmitted loan and enters the update wizard', async () => {
        await LoginPage.login(testData.username2, testData.password);
        await LoginPage.verifyLoggedIn();
        await LoanResubmissionPage.openResubmittedLoans();
        await LoanResubmissionPage.searchLoan(testData.resubmitLoanId);
        await LoanResubmissionPage.openLoanDetails();
        await LoanResubmissionPage.clickUpdateDetails();
        await LoanResubmissionPage.clickBasicEligibilityCheck();
        await LoanResubmissionPage.clickNext(1);
        const reachedCustomerInfo =
            await LoanResubmissionPage.verifyScreenVisible('Customer Information');
        expect(reachedCustomerInfo).toBe(true);
    });
});
