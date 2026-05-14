import { useFinance } from '../../hooks/useFinance';
import { formatCurrency } from '../../lib/utils';
import { Card } from '../ui/Card';

export function WalletList() {
  const { wallets } = useFinance();

  return (
    <Card hover={false}>
      <p className="text-section-title">Bank Wallets</p>
      <p className="mt-1 text-body-th text-slateText">รายการบัญชีและกระเป๋าเงินที่ใช้คำนวณ Net Worth</p>
      <div className="mt-4 space-y-3">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="flex items-center justify-between rounded-2xl border border-border bg-slate-50 p-3">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: wallet.color }} />
              <div>
                <p className="text-body-ui text-ink">{wallet.name}</p>
                <p className="text-caption-ui">{wallet.type}</p>
              </div>
            </div>
            <p className="font-inter text-[14px] font-bold leading-5 text-ink">{formatCurrency(wallet.balance)}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
