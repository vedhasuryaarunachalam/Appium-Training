import LoginPage from '../pageobjects/Login.page.ts';
import DueCollectionPage from '../pageobjects/DueCollection.page.ts';
import { testData } from './testData.ts';

describe('Due Collection Test', () => {
    beforeEach(async () => {
        await LoginPage.login(testData.username, testData.password);
    });

    
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
        await DueCollectionPage.clickProceedOnAccountantScreen();
        await DueCollectionPage.verifyPaymentSuccess();
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

    

    it('Verify Due Collection Digital With normal flow', async () => {
        await navigateToParticularDue(testData.dueId);
        await DueCollectionPage.selectModeOfPayment('digital');
        await DueCollectionPage.clickConfirmTwo();
        await DueCollectionPage.clickConfirmPaymentDetails();
        await DueCollectionPage.clickProceedOnAccountantScreen();
        await DueCollectionPage.verifyPaymentSuccess();
    });
    it('Verify Due collection - cash with Wallet', async () => {
        await navigateToParticularDue(testData.dueId);
        await DueCollectionPage.selectModeOfPayment('cash');
        await DueCollectionPage.clickUseWallet();
        await DueCollectionPage.confirmWalletPayment();
    });
    it('Verify Due Collection Digital With wallet', async () => {
        await navigateToParticularDue(testData.dueId);
        await DueCollectionPage.selectModeOfPayment('digital');
        await DueCollectionPage.clickUseWallet();
        await DueCollectionPage.confirmWalletPayment();
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
