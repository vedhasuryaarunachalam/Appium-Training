import LoginPage from '../pageobjects/Login.page.ts';
import DueCollectionPage from '../pageobjects/DueCollection.page.ts';
import { testData } from './testData.ts';

describe('Due Collection Test', () => {
    beforeEach(async () => {
        await LoginPage.login(testData.username, testData.password);
    });

    // Opens the due, confirms the customer-details screen, and lands on the
    // "Due Collections Details" (mode of payment) screen.
    async function navigateToParticularDue(dueId: string) {
        await DueCollectionPage.clickDueCollectionInDashboard();
        await DueCollectionPage.clickDueCollectionBottom();
        await DueCollectionPage.clickAllTab();
        await DueCollectionPage.searchDueID(dueId);
        await DueCollectionPage.clickParticularDueID(dueId);
        await DueCollectionPage.clickConfirmOne();
    }

    it('Verify Due collection - cash with other amount', async () => {
        await navigateToParticularDue(testData.dueId);
        await DueCollectionPage.selectModeOfPayment('cash');
        await DueCollectionPage.clickOtherAmountAndFill('500');
        await DueCollectionPage.clickConfirmTwo();
        await DueCollectionPage.clickConfirmPaymentDetails();
        await DueCollectionPage.verifyPaymentSuccess();
    });

    it('Verify Due collection - cash with Wallet', async () => {
        await navigateToParticularDue(testData.dueId);
        await DueCollectionPage.selectModeOfPayment('cash');
        await DueCollectionPage.clickUseWallet();
        // Wallet payments schedule the installment (auto-pay) rather than completing
        // an immediate collection — confirmWalletPayment taps CONFIRM and asserts the
        // transient installment toast (or completion).
        await DueCollectionPage.confirmWalletPayment();
    });

    it('Verify Due collection - cash with Normal', async () => {
        await navigateToParticularDue(testData.dueId);
        await DueCollectionPage.selectModeOfPayment('cash');
        await DueCollectionPage.clickConfirmTwo();
        await DueCollectionPage.clickConfirmPaymentDetails();
        await DueCollectionPage.clickProceedOnAccountantScreen();
        await DueCollectionPage.verifyPaymentSuccess();
    });

    it('Verify Due Collection Digital With other amount', async () => {
        await navigateToParticularDue(testData.dueId);
        await DueCollectionPage.selectModeOfPayment('digital');
        await DueCollectionPage.clickOtherAmountAndFill('500');
        await DueCollectionPage.clickConfirmTwo();
        await DueCollectionPage.clickConfirmPaymentDetails();
        await DueCollectionPage.verifyPaymentSuccess();
    });

    it('Verify Due Collection Digital With wallet', async () => {
        await navigateToParticularDue(testData.dueId);
        await DueCollectionPage.selectModeOfPayment('digital');
        await DueCollectionPage.clickUseWallet();
        // Wallet schedules the installment (auto-pay) instead of completing.
        await DueCollectionPage.confirmWalletPayment();
    });

    it('Verify Due Collection Digital With normal flow', async () => {
        await navigateToParticularDue(testData.dueId);
        await DueCollectionPage.selectModeOfPayment('digital');
        // Digital uses the same CONFIRM flow as cash (payment URL is sent to the
        // customer), not a "GENERATE QR" button.
        await DueCollectionPage.clickConfirmTwo();
        await DueCollectionPage.clickConfirmPaymentDetails();
        await DueCollectionPage.clickProceedOnAccountantScreen();
        await DueCollectionPage.verifyPaymentSuccess();
    });

    it('Verify Due Collection Bank Transfer With other amount', async () => {
        await navigateToParticularDue(testData.dueId);
        await DueCollectionPage.selectModeOfPayment('bank');
        await DueCollectionPage.uploadDocumentViaCamera();
        await DueCollectionPage.clickOtherAmountAndFill('500');
        await DueCollectionPage.clickConfirmTwo();
        await DueCollectionPage.clickConfirmPaymentDetails();
        await DueCollectionPage.clickProceedOnAccountantScreen();
        await DueCollectionPage.verifyPaymentSuccess();
    });

    it('Verify Due Collection Bank Transfer With wallet', async () => {
        await navigateToParticularDue(testData.dueId);
        await DueCollectionPage.selectModeOfPayment('bank');
        await DueCollectionPage.uploadDocumentViaCamera();
        await DueCollectionPage.clickUseWallet();
        await DueCollectionPage.clickConfirmTwo();
        await DueCollectionPage.clickConfirmPaymentDetails();
        await DueCollectionPage.clickProceedOnAccountantScreen();
        await DueCollectionPage.verifyPaymentSuccess();
    });

    it('Verify Due Collection Bank Transfer With normal flow', async () => {
        await navigateToParticularDue(testData.dueId);
        await DueCollectionPage.selectModeOfPayment('bank');
        await DueCollectionPage.uploadDocumentViaCamera();
        await DueCollectionPage.clickConfirmTwo();
        await DueCollectionPage.clickConfirmPaymentDetails();
        await DueCollectionPage.clickProceedOnAccountantScreen();
        await DueCollectionPage.verifyPaymentSuccess();
    });

    it('Verify Due collection - Deposit amount', async () => {
        await DueCollectionPage.clickDueCollectionInDashboard();
        await DueCollectionPage.clickDepositAmountOption();
        await DueCollectionPage.enterDepositAmount('1000');
        await DueCollectionPage.uploadDepositDocument();
        await DueCollectionPage.clickDepositSubmit();
    });
});
