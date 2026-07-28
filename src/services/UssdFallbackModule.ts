import { Linking, Alert, Platform } from 'react-native';

export interface UssdTransferParams {
  amount: number | string;
  accountNumber: string;
  bankCode?: string; // Default Wema 945
  recipientName?: string;
}

/**
 * ⚡ KUDINODE AI - USSD FALLBACK ARCHITECTURE (HITL COMPLIANT)
 *
 * Technical Flow:
 * 1. Low Connectivity Intercept (Timeout > 3000ms or NetInfo offline).
 * 2. Dynamic String Generation: *945*Amount*AccountNumber#
 * 3. URI Encoding Trick: `#` -> `%23` via `encodeURIComponent` to prevent OS dialers from stripping hash.
 * 4. Native OS Handoff via `Linking.openURL("tel:*945*15000*0123456789%23")`
 * 5. Post-Offline SMS Debit Sync & Local State Update.
 */
export class UssdFallbackModule {
  /**
   * Generates executable Wema Bank USSD dialer payload
   * @example
   * buildWemaPayload(15000, "0123456789") -> "tel:*945*15000*0123456789%23"
   */
  static buildWemaPayload(amount: number | string, accountNumber: string): string {
    const rawShortcode = `*945*${amount}*${accountNumber}#`;
    // Crucial URI encoding trick: Replace '#' with '%23'
    const encodedShortcode = rawShortcode.replace(/#/g, encodeURIComponent('#'));
    return `tel:${encodedShortcode}`;
  }

  /**
   * Executes Native OS Handoff to phone's dialer with pre-filled payload
   */
  static async triggerUssdFallback(params: UssdTransferParams, onComplete?: () => void): Promise<boolean> {
    const payload = this.buildWemaPayload(params.amount, params.accountNumber);

    try {
      const canOpen = await Linking.canOpenURL(payload);
      if (canOpen || Platform.OS === 'android') {
        await Linking.openURL(payload);
        if (onComplete) onComplete();
        return true;
      } else {
        Alert.alert('Dialer Error', 'Your device does not support direct phone calls.');
        return false;
      }
    } catch (error) {
      console.warn('USSD Handoff Error:', error);
      // Fallback direct open
      await Linking.openURL(payload);
      if (onComplete) onComplete();
      return true;
    }
  }

  /**
   * Simulates Wema Bank SMS Debit Alert parsing for Post-Offline Sync
   */
  static parseWemaSmsDebitAlert(smsText: string): { amount: number; recipientAcc: string; isDebit: boolean } | null {
    const isDebit = smsText.toLowerCase().includes('debit') || smsText.toLowerCase().includes('dr');
    if (!isDebit) return null;

    const amountMatch = smsText.match(/₦?\s*([\d,]+(\.\d{2})?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

    const accMatch = smsText.match(/\b\d{10}\b/);
    const recipientAcc = accMatch ? accMatch[0] : '';

    return { amount, recipientAcc, isDebit };
  }
}
