import { useFinance } from '../../hooks/useFinance';
import { DonutChart } from '../../charts/DonutChart';
import { Card } from '../ui/Card';

export function ExpensesChart() {
  const { expenseBreakdown } = useFinance();

  return (
    <Card hover={false}>
      <p className="text-section-title">Expenses</p>
      <p className="mt-1 text-body-th text-slateText">สัดส่วนค่าใช้จ่ายตามหมวดหมู่ อัปเดตเมื่อบันทึก Expense หรือ Subscription</p>
      <DonutChart data={expenseBreakdown} height={250} />
    </Card>
  );
}
