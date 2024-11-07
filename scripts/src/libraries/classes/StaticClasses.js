
export class MoneyFormatter {
  static formatMoney(amount) {
      const units = ['k', 'M', 'B', 'T', 'P', 'E'];
      let unitIndex = -1;

      while (amount >= 1000 && unitIndex < units.length - 1) {
          amount /= 1000;
          unitIndex++;
      }

      if (unitIndex === -1) {
          return amount.toString();
      } else {
          return amount.toFixed(1) + units[unitIndex];
      }
  }
}
