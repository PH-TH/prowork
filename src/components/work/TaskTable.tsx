import { formatDateLabel } from '../../lib/date';
import { useWork } from '../../hooks/useWork';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';

export function TaskTable() {
  const { tasks, projects, members } = useWork();

  return (
    <Card hover={false}>
      <div className="mb-4">
        <p className="text-section-title">Task Table</p>
        <p className="text-page-subtitle">Linked to projects, owners, and operation tabs.</p>
      </div>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[980px] text-left">
          <thead className="uppercase">
            <tr className="border-b border-border">
              <th className="py-3">Task</th>
              <th className="py-3">Project</th>
              <th className="py-3">Tab</th>
              <th className="py-3">Priority</th>
              <th className="py-3">Status</th>
              <th className="py-3">Due</th>
              <th className="py-3">Owner</th>
              <th className="py-3">Progress</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const project = projects.find((item) => item.id === task.projectId);
              const member = members.find((item) => item.id === task.assigneeId);
              return (
                <tr key={task.id} className="border-b border-border transition hover:bg-slate-50">
                  <td className="max-w-[220px] py-4 pr-4">
                    <p className="text-body-ui text-ink">{task.title}</p>
                    <p className="mt-1 truncate text-caption-ui">{task.remark}</p>
                  </td>
                  <td className="py-4 text-slateText">{project?.name}</td>
                  <td className="py-4 text-slateText">{task.tabType}</td>
                  <td className="py-4"><Badge tone={task.priority === 'Critical' ? 'red' : task.priority === 'High' ? 'orange' : 'blue'}>{task.priority}</Badge></td>
                  <td className="py-4"><Badge tone={task.status === 'Done' ? 'green' : task.status === 'Overdue' || task.status === 'Blocked' ? 'red' : 'blue'}>{task.status}</Badge></td>
                  <td className="py-4 text-slateText">{formatDateLabel(task.dueDate, 'MMM d')}</td>
                  <td className="py-4 text-slateText">{member?.name}</td>
                  <td className="w-36 py-4"><ProgressBar value={task.progress} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 lg:hidden">
        {tasks.map((task) => {
          const project = projects.find((item) => item.id === task.projectId);
          return (
            <div key={task.id} className="rounded-2xl border border-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-body-ui text-ink">{task.title}</p>
                  <p className="text-caption-ui">{project?.name} • {task.tabType}</p>
                </div>
                <Badge tone={task.status === 'Done' ? 'green' : 'orange'}>{task.status}</Badge>
              </div>
              <div className="mt-3"><ProgressBar value={task.progress} showLabel /></div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
