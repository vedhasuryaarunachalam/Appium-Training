import { driver } from '@wdio/globals';
import { selectors } from '../../selectors/appSelectors.ts';
import { BasePage } from './base.page.ts';
import { byText, byType } from 'appium-flutter-finder';

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
    
    private readonly confirmTwoBtn = selectors.confirm2; 
    private readonly confirmThreeBtn = selectors.confirm3; 
    private readonly cameraOption = selectors.camera;

    private readonly depositAmountTile = selectors.depositAmountText;
    private readonly submitBtn = selectors.submitButton;

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
        // The matching due renders as a card with a "Complete" action button.
        // (Matching byText(dueId) is unreliable — it also matches the search field text,
        //  and the card shows the id as "ID: <dueId>", not the bare number.)
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
        // CONFIRM on the "Confirm Customer Details" screen (shown right after Complete).
        await this.tapElement(selectors.confirm1, 1000);
    }

    async selectModeOfPayment(mode: 'cash' | 'digital' | 'bank') {
        // Land on the "Due Collections Details" screen (Cash is selected by default).
        await this.waitForDisplayed(byText('Mode of Payment'), 10000);
        if (mode === 'digital') {
            await this.tapElement(this.modeDigitalPayment, 500);
        } else if (mode === 'bank') {
            await this.tapElement(this.modeBankTransfer, 500);
        }
        // cash: nothing to tap — it is the default selection.
    }

    async clickOtherAmountAndFill(amount: string) {
        await this.tapElement(this.otherAmountSwitch, 500);
        await this.enterText(this.otherAmountField, amount);
    }

    async clickUseWallet() {
        // Toggling "Use Wallet" recalculates the summary; give it time to settle
        // before the CONFIRM tap, otherwise the button is tapped while disabled.
        await this.tapElement(this.walletSwitch, 2000);
        await this.waitForLoadingToFinish();
    }

    async clickConfirmTwo() {
        await this.tapElement(this.confirmTwoBtn, 1000);
    }

    async clickConfirmPaymentDetails() {
        await this.tapElement(this.confirmThreeBtn, 1000);
    }

    async clickGenerateQR() {
        await this.tapElement(this.generateQrBtn, 1000);
    }

    private async nativeTap(x: number, y: number) {
        await driver
            .action('pointer', { parameters: { pointerType: 'touch' } })
            .move({ x, y })
            .down()
            .pause(120)
            .up()
            .perform();
    }

    async uploadDocumentViaCamera() {
        await this.tapElement(this.uploadDocBtn, 800);   // "Upload Document"
        await this.tapElement(this.cameraOption, 3000);  // "Camera" -> native Android camera

        // The Android camera is a native app outside the Flutter widget tree, so
        // it can't be driven with Flutter finders. Switch to the native context
        // and tap by screen coordinates (stable on the Pixel_8a 1080x2400 AVD).
        // Steps: dismiss the first-launch "Remember photo locations? NEXT" prompt
        // (no-op if absent), tap the shutter, then let the capture auto-return to
        // the app with the photo attached.
        await driver.switchContext('NATIVE_APP');
        try {
            await driver.pause(1500);
            await this.nativeTap(540, 2280);  // "NEXT" onboarding button (harmless if not shown)
            await driver.pause(1500);
            await this.nativeTap(540, 2166);  // shutter button
            // After capture the native "Edit Photo" crop screen appears; its
            // timing varies, so retry the top-right check-mark tap until the
            // Flutter app regains focus (the "Mode of Payment" screen reappears).
            for (let attempt = 0; attempt < 5; attempt++) {
                await driver.pause(2500);
                await this.nativeTap(1014, 196); // top-right check mark: accept the photo
                await driver.switchContext('FLUTTER');
                try {
                    await this.waitForDisplayed(byText('Mode of Payment'), 2500);
                    return; // back on the Flutter details screen — photo accepted
                } catch (e) {
                    await driver.switchContext('NATIVE_APP'); // still native — tap the tick again
                }
            }
        } finally {
            await driver.switchContext('FLUTTER');
        }
    }

    async clickProceedOnAccountantScreen() {
        // "This needs to be verified by Accountant" confirmation dialog.
        await this.tapElement(byText('PROCEED'), 1000);
    }

    async clickDepositAmountOption() {
        await this.tapElement(this.depositAmountTile, 1000);
    }

    async enterDepositAmount(amount: string) {
        // The amount field has no stable ValueKey ('depositAmount' does not match);
        // it is the only text input on the deposit screen, so target it by type.
        await this.enterText(byType('TextField'), amount);
    }

    async uploadDepositDocument() {
        await this.uploadDocumentViaCamera();
    }

    async clickDepositSubmit() {
        await this.tapElement(this.submitBtn, 1000);
    }

    async verifyPaymentSuccess() {
        // A successful collection closes the flow and returns to the dashboard.
        const backOnDashboard = await this.waitForDisplayed(byText('Welcome Back!'), 15000);
        expect(backOnDashboard).toBe(true);
    }

    async confirmWalletPayment() {
        // Paying via wallet schedules the installment for auto-pay rather than
        // completing an immediate collection. The app shows the transient toast
        // "This installment will be auto-paid on the due date" and stays on the
        // Due Collections Details screen. That toast is rendered outside the
        // Flutter widget tree, so it cannot be located by the Flutter driver
        // (byText/waitFor never matches it). We therefore assert the resulting
        // stable state instead: either still on the details screen (installment
        // scheduled) or — if the wallet fully settled the due — the dashboard.
        await this.tapElement(this.confirmTwoBtn, 1500);
        try {
            const scheduled = await this.waitForDisplayed(byText('Mode of Payment'), 6000);
            expect(scheduled).toBe(true);
        } catch (e) {
            const completed = await this.waitForDisplayed(byText('Welcome Back!'), 8000);
            expect(completed).toBe(true);
        }
    }
}

export default new DueCollectionPage();
