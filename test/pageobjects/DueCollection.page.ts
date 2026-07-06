import { driver } from '@wdio/globals';
import { selectors } from '../../selectors/appSelectors.ts';
import { BasePage } from './base.page.ts';
import { byText, byType, byValueKey } from 'appium-flutter-finder';

class DueCollectionPage extends BasePage {
    private readonly dueCollectionDashboardTile = selectors.dueCollection;
    private readonly dueCollectionBottomBtn = selectors.dueCollectionBtn;
    private readonly allDuesTab = selectors.allDues;
    private readonly searchDueField = selectors.searchDue;
    private readonly modeBankTransfer = selectors.bankTransfer;
    private readonly modeDigitalPayment = selectors.digitalPayment;
    private readonly uploadDocBtn = selectors.uploadDocument;
    private readonly generateQrBtn = selectors.generateQR;
    private readonly otherAmountSwitch = selectors.otherAmountSwitch;
    private readonly otherAmountField = selectors.otherAmountField;
    private readonly walletSwitch = selectors.walletSwitch;
    private readonly cameraOption = selectors.camera;
    private readonly galleryOption = selectors.gallery;

    private readonly depositAmountTile = selectors.depositAmountText;
    private readonly submitBtn = selectors.submitButton;
    private readonly closeIcon = selectors.closeIcon;

    async clickDueCollectionInDashboard() {
        await this.tapElement(this.dueCollectionDashboardTile, 1000);
    }

    async clickDueCollectionBottom() {
        await this.tapElement(this.dueCollectionBottomBtn, 1000);
    }

    async clickAllTab() {
        await this.tapElement(this.allDuesTab, 500);
    }

    async searchDueID(dueId: string) {
        await this.enterText(this.searchDueField, dueId);
    }

    async clickParticularDueID(dueId: string) {
        
        const completeButton = byText('Complete');
        try {
            await this.waitForDisplayed(completeButton, 10000);
        } catch (error) {
            throw new Error(
                `Due ID ${dueId} was not found or has no collectable due card in the search results.`
            );
        }
        await this.tapElement(completeButton, 1000);
    }

    async clickConfirmOne() {
        await this.tapElement(selectors.confirm1, 1000);
    }

    async selectModeOfPayment(mode: 'cash' | 'digital' | 'bank') {
        await this.waitForDisplayed(byText('Mode of Payment'), 10000);
        if (mode === 'digital') {
            await this.tapElement(this.modeDigitalPayment, 500);
        } else if (mode === 'bank') {
            await this.tapElement(this.modeBankTransfer, 500);
        }
    }
    private async swipeUp() {
    await driver.switchContext('NATIVE_APP');

    try {
        await driver.execute('mobile: scrollGesture', {
            left: 100,
            top: 100,
            width: 800,
            height: 1600,
            direction: 'down',
            percent: 0.8
        });
    } finally {
        await driver.switchContext('FLUTTER');
    }
}


    async clickOtherAmountAndFill(amount: string) {
        await this.tapElement(this.otherAmountSwitch, 1000);
        await this.waitForLoadingToFinish();
        await driver.pause(1000);

        try {
            await driver.execute('flutter:scrollIntoView', this.otherAmountField, { alignment: 0.5 });
        } catch (e) { /* fall back to a native swipe */
            await this.swipeUp();
        }
        await driver.pause(800);

        await driver.switchContext('NATIVE_APP');
        try {
            const field = driver.$('//android.widget.EditText');
            await field.waitForDisplayed({ timeout: 10000 });
            await field.click();
        } finally {
            await driver.switchContext('FLUTTER');
        }
        await driver.pause(600);
        await driver.execute('flutter:enterText', amount);
        await driver.pause(600);
        await driver.switchContext('NATIVE_APP');
        try { await driver.hideKeyboard(); } catch (e) { /* hidden */ }
        await driver.switchContext('FLUTTER');
        await driver.pause(500);
    }
    async clickUseWallet() {
        
        await this.tapElement(this.walletSwitch, 2000);
        await this.waitForLoadingToFinish();
    }

    
    private async tapNativeByLabel(label: string, waitAfter = 1500) {
        await this.tapNativeByAnyLabel([label], waitAfter);
    }

    
    private async tapNativeByAnyLabel(labels: string[], waitAfter = 1500, timeout = 15000) {
        await driver.switchContext('NATIVE_APP');
        try {
            let target: any = null;
            await driver.waitUntil(async () => {
                for (const l of labels) {
                    const el = driver.$(`~${l}`);
                    if (await el.isExisting()) { target = el; return true; }
                }
                return false;
            }, { timeout, interval: 500, timeoutMsg: `none of [${labels.join(', ')}] appeared` });
            await target.click();
        } finally {
            await driver.switchContext('FLUTTER');
        }
        await driver.pause(waitAfter);
    }

    private async tapNativeByLabelIfPresent(label: string, timeout = 6000, waitAfter = 1500) {
        try {
            await this.tapNativeByAnyLabel([label], waitAfter, timeout);
            return true;
        } catch (e) {
            return false;
        }
    }

    async clickConfirmTwo() {
        await this.tapNativeByLabel('CONFIRM', 2500);
    }

    async clickConfirmPaymentDetails() {
        
        await this.tapNativeByAnyLabel(['CONFIRM  PAYMENT', 'CONFIRM PARTIAL PAYMENT'], 2000);
    }

    async clickGenerateQR() {
        await this.tapElement(this.generateQrBtn, 1000);
    }


    
    private async confirmCropTick() {
        let tapped = false;
        for (let attempt = 0; attempt < 12 && !tapped; attempt++) {
            await driver.pause(1000);
            if ((await driver.getContext()) !== 'NATIVE_APP') {
                await driver.switchContext('NATIVE_APP');
                continue; // re-check the context on the next iteration before querying
            }
            try {
                const tick = driver.$('~Crop');
                if (await tick.isDisplayed()) {
                    await tick.click();
                    tapped = true;
                }
            } catch (e) { /* crop page not ready yet */ }
        }
        await driver.switchContext('FLUTTER');
        if (!tapped) {
            throw new Error('Crop confirm (tick mark "Crop") never appeared.');
        }
    }

    async uploadDocumentViaCamera() {
        await this.tapElement(this.uploadDocBtn, 800);   
        await this.tapElement(this.cameraOption, 3000);  

       
        await this.waitForDisplayed(byValueKey('captureButton'), 15000);
        await driver.execute('flutter:clickElement', byValueKey('captureButton'), { timeout: 15000 });

       
        await this.confirmCropTick();
        await this.waitForDisplayed(byText('Mode of Payment'), 15000);
    }

    async uploadDocumentViaGallery() {
        await this.tapElement(this.uploadDocBtn, 800);
        await this.tapElement(this.galleryOption, 3000);

       
        await driver.switchContext('NATIVE_APP');
        try {
            const firstPhoto = driver.$('android=new UiSelector().descriptionStartsWith("Photo taken")');
            await firstPhoto.waitForDisplayed({ timeout: 15000 });
            await firstPhoto.click();
        } finally {
            await driver.switchContext('FLUTTER');
        }

        await this.confirmCropTick();
    }

         

    async clickProceedOnAccountantScreen() {
        
        await this.tapNativeByLabelIfPresent('PROCEED', 6000, 1500);
    }

    async clickDepositAmountOption() {
        await this.swipeUp();
        await driver.pause(500);
        await this.tapElement(this.depositAmountTile, 1000);
    }

    async enterDepositAmount(amount: string) {
        
        await this.enterText(byType('TextField'), amount);
    }

    async uploadDepositDocument() {
        await this.uploadDocumentViaGallery();
    }

    async clickDepositSubmit() {
        await this.tapElement(this.submitBtn, 3000);
    }

    async verifyPaymentSuccess() {
        const backOnDashboard = await this.waitForDisplayed(byText('Welcome Back!'), 15000);
        expect(backOnDashboard).toBe(true);
    }

    async confirmWalletPayment() {

        await this.tapNativeByLabel('CONFIRM', 2500);
        await this.waitForLoadingToFinish();
        await this.clickConfirmPaymentDetails();

        
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                await this.waitForDisplayed(this.closeIcon, 3000);
            } catch (e) {
                break; 
            }
            await driver.execute('flutter:clickElement', this.closeIcon, { timeout: 15000 });
            await driver.pause(500);
        }

        const backOnDashboard = await this.waitForDisplayed(byText('Welcome Back!'), 15000);
        expect(backOnDashboard).toBe(true);
    }
}

export default new DueCollectionPage();
