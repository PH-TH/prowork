import { useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import {
  Calculator,
  CalendarClock,
  CalendarDays,
  CircleDot,
  Eye,
  Folder,
  FolderKanban,
  MessageSquareText,
  Package,
  Plus,
  RefreshCw,
  Settings2,
  Tags,
  UserRound,
  Users,
  Workflow,
  X,
} from 'lucide-react';
import { format, parse } from 'date-fns';
import { workTabs } from '../../data/mockWork';
import { ProjectTimeline } from './ProjectTimeline';
import { Button } from '../ui/Button';
import type { PlmStatusRecord } from '../../types/work';

interface WorkTabsProps {
  selectedDate: string;
  onEditTask: (taskId: string) => void;
}

type PlmFieldKey =
  | 'plm'
  | 'status'
  | 'model'
  | 'pic'
  | 'group'
  | 'requestDate'
  | 'registerDate'
  | 'confirmDate'
  | 'channel'
  | 'symptom'
  | 'remark';

type HeaderTone = 'emerald' | 'blue' | 'violet' | 'orange' | 'rose' | 'amber' | 'sky' | 'green' | 'slate' | 'red' | 'teal';
type SummaryKey = 'all' | 'ongoing' | 'confirmed';

type PlmFormState = {
  plm: string;
  symptom: string;
  group: string;
  pic: string;
  status: string;
  model: string;
  requestDate: string;
  registerDate: string;
  confirmDate: string;
  channel: string;
  remark: string;
};

const PLM_STATUS_API_URL = 'http://localhost:3001/api/plm-status';
const PLM_STATUS_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzCx5C5Tb375duuAfTmGwWAzEXsshrxO-_Te49R7nSDf_cI7avKAiJaGixys3mCFba/exec';

const PLM_FIELDS: Array<{ key: PlmFieldKey; label: string; tone: HeaderTone; icon: ReactNode }> = [
  { key: 'plm', label: 'PLM ID', tone: 'emerald', icon: <FolderKanban size={13} /> },
  { key: 'model', label: 'Model', tone: 'violet', icon: <Package size={13} /> },
  { key: 'status', label: 'Status', tone: 'blue', icon: <CircleDot size={13} /> },
  { key: 'pic', label: 'PIC', tone: 'orange', icon: <UserRound size={13} /> },
  { key: 'group', label: 'Group', tone: 'rose', icon: <Users size={13} /> },
  { key: 'requestDate', label: 'Request', tone: 'amber', icon: <CalendarDays size={13} /> },
  { key: 'registerDate', label: 'Register', tone: 'sky', icon: <CalendarDays size={13} /> },
  { key: 'confirmDate', label: 'Confirm', tone: 'green', icon: <CalendarDays size={13} /> },
  { key: 'channel', label: 'Channel', tone: 'slate', icon: <Workflow size={13} /> },
  { key: 'symptom', label: 'Symptom', tone: 'red', icon: <MessageSquareText size={13} /> },
  { key: 'remark', label: 'Remark', tone: 'teal', icon: <MessageSquareText size={13} /> },
];

const DEFAULT_FORM: PlmFormState = {
  plm: '',
  symptom: '',
  group: '',
  pic: '',
  status: 'Ongoing',
  model: '',
  requestDate: '',
  registerDate: '',
  confirmDate: '',
  channel: '',
  remark: '',
};

export function WorkTabs({ selectedDate, onEditTask }: WorkTabsProps) {
  const [active, setActive] = useState('Timeline');
  const icons = [Calculator, Users, Folder, CalendarClock, Package, Users, Workflow, Settings2];

  return (
    <div className="space-y-3">
      {active === 'Timeline'
        ? <ProjectTimeline selectedDate={selectedDate} onEditTask={onEditTask} />
        : active === 'PLM Status'
          ? <PlmStatusPanel />
          : <MockWorkPanel title={active} />}

      <div className="flex gap-2 overflow-x-auto">
        {workTabs.map((tab, index) => {
          const Icon = tab === 'Part Price' ? Tags : icons[index] ?? Folder;
          const selected = active === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActive(tab)}
              className={`flex h-10 min-w-fit items-center gap-2 rounded-xl border px-4 font-data text-[12px] font-medium transition ${
                selected
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-border bg-white text-ink hover:border-primary-soft hover:bg-primary-pale hover:text-primary'
              }`}
            >
              <Icon size={15} />
              {tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlmStatusPanel() {
  const [rows, setRows] = useState<PlmStatusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [sourceLabel, setSourceLabel] = useState('Google Sheet');
  const [fieldOrder, setFieldOrder] = useState<PlmFieldKey[]>(PLM_FIELDS.map((field) => field.key));
  const [visibleFields, setVisibleFields] = useState<PlmFieldKey[]>(PLM_FIELDS.map((field) => field.key));
  const [draggingKey, setDraggingKey] = useState<PlmFieldKey | null>(null);
  const [detailRow, setDetailRow] = useState<PlmStatusRecord | null>(null);
  const [activeSummary, setActiveSummary] = useState<SummaryKey>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [formState, setFormState] = useState<PlmFormState>(DEFAULT_FORM);

  useEffect(() => {
    void fetchPlmStatus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (detailRow) setDetailRow(null);
        if (showColumnManager) setShowColumnManager(false);
        if (isAddOpen && !saving) setIsAddOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detailRow, isAddOpen, saving, showColumnManager]);

  const fetchPlmStatus = async () => {
    setError('');
    setLoading((current) => current && rows.length === 0);
    setRefreshing(rows.length > 0);

    try {
      const attempts = [
        { url: PLM_STATUS_API_URL, source: 'Local API route' },
        { url: PLM_STATUS_APPS_SCRIPT_URL, source: 'Google Apps Script' },
      ];

      let lastError = 'Unable to load PLM Status data.';

      for (const attempt of attempts) {
        try {
          const response = await fetch(attempt.url);
          const payload = await response.json();
          if (!response.ok || !payload?.ok) {
            throw new Error(payload?.error || `Unable to load PLM Status data from ${attempt.source}.`);
          }

          const nextRows = Array.isArray(payload.rows)
            ? payload.rows.map((row: PlmStatusRecord | Record<string, string>) => normalizePlmRow(row))
            : [];

          setRows(nextRows);
          setSourceLabel(attempt.source);
          return;
        } catch (attemptError) {
          lastError = attemptError instanceof Error ? attemptError.message : lastError;
        }
      }

      throw new Error(lastError);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'Unable to load PLM Status data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const dropdownOptions = useMemo(() => ({
    groups: buildOptions(rows.map((row) => row.group), ['Display', '3rd Party', 'Samsung App', 'System', 'Camera', 'Audio']),
    pics: buildOptions(rows.map((row) => row.pic), ['Thithat.c', 'Phitsanu.p', 'Michael Lee', 'Alex Kim']),
    statuses: buildOptions(rows.map((row) => row.status), ['Ongoing', 'Done', 'Pending', 'In Progress', 'Waiting']),
    models: buildOptions(rows.map((row) => row.model), ['SM-F766', 'SM-F966', 'SM-S938', 'SM-A556']),
    channels: buildOptions(rows.map((row) => row.channel), ['Email', 'Line', 'Call', 'Samsung Member', 'Service Center']),
  }), [rows]);

  const visibleRows = getVisibleRows(rows, activeSummary);
  const displayFields = fieldOrder.filter((fieldKey) => visibleFields.includes(fieldKey));
  const hiddenFields = fieldOrder.filter((fieldKey) => !visibleFields.includes(fieldKey));
  const detailFields = fieldOrder;

  const handleFormChange = (key: keyof PlmFormState, value: string) => {
    setFormState((current) => ({ ...current, [key]: value }));
  };

  const resetView = () => {
    setVisibleFields(PLM_FIELDS.map((field) => field.key));
    setFieldOrder(PLM_FIELDS.map((field) => field.key));
  };

  const handleAddPlm = async () => {
    setFormError('');

    if (!formState.plm.trim()) return setFormError('กรุณากรอก PLM ID');
    if (!formState.symptom.trim()) return setFormError('กรุณากรอกอาการของปัญหา');
    if (!formState.group.trim() || !formState.pic.trim() || !formState.status.trim() || !formState.model.trim()) {
      return setFormError('กรุณากรอกข้อมูลหลักให้ครบ เช่น Group, PIC, Status และ Model');
    }

    setSaving(true);

    try {
      const payload = {
        action: 'create',
        data: {
          plm: formState.plm.trim(),
          symptom: formState.symptom.trim(),
          group: formState.group.trim(),
          pic: formState.pic.trim(),
          status: formState.status.trim(),
          model: formState.model.trim(),
          request_date: normalizeDateForSheet(formState.requestDate),
          register_date: normalizeDateForSheet(formState.registerDate),
          confirm_date: normalizeDateForSheet(formState.confirmDate),
          channel: formState.channel.trim(),
          remark: formState.remark.trim(),
        },
      };

      let saved = false;
      let lastError = 'Unable to save PLM record.';

      try {
        const response = await fetch(PLM_STATUS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok || !result?.ok) throw new Error(result?.error || 'Local API save failed.');
        saved = true;
      } catch (apiError) {
        lastError = apiError instanceof Error ? apiError.message : lastError;
      }

      if (!saved) {
        try {
          const response = await fetch(PLM_STATUS_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
          });
          const text = await response.text();
          const result = text ? JSON.parse(text) : { ok: response.ok };
          if (!response.ok || !result?.ok) throw new Error(result?.error || 'Apps Script save failed.');
          saved = true;
        } catch (appsScriptError) {
          lastError = appsScriptError instanceof Error ? appsScriptError.message : lastError;
        }
      }

      if (!saved) throw new Error(lastError);

      setIsAddOpen(false);
      setFormState(DEFAULT_FORM);
      setActiveSummary('all');
      await fetchPlmStatus();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Unable to save PLM record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-card border border-border bg-white p-5 shadow-card">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-data text-[14px] font-bold leading-5 text-ink">PLM Status</p>
          <p className="font-kanit text-[12px] font-normal leading-5 text-slateText">
            ดึงข้อมูลล่าสุดจาก Google Sheet ผ่าน {sourceLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              setFormError('');
              setFormState(DEFAULT_FORM);
              setIsAddOpen(true);
            }}
            icon={<Plus size={15} />}
          >
            Add PLM
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void fetchPlmStatus()}
            icon={<RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="mt-5 rounded-2xl border border-border bg-slate-50 p-6 font-kanit text-[13px] leading-5 text-slateText">กำลังโหลดข้อมูล PLM Status...</div>
      ) : error ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-card-title text-red-700">PLM Status is not ready</p>
          <p className="mt-2 text-caption-ui text-red-700">{error}</p>
          <p className="mt-2 font-kanit text-[12px] leading-5 text-red-700">ตรวจสอบการ Deploy ของ Apps Script หรือเปิด local backend ด้วย `npm run dev:api` หากต้องการใช้ proxy route</p>
        </div>
      ) : (
        <>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <StatCard label="รายการทั้งหมด" value={String(rows.length)} helper="จำนวนรายการทั้งหมดจาก Google Sheet" tone="emerald" active={activeSummary === 'all'} onClick={() => setActiveSummary('all')} />
            <StatCard label="กำลังดำเนินการ" value={String(rows.filter((row) => isOngoingStatus(row.status)).length)} helper="รายการที่ยังอยู่ระหว่างติดตาม" tone="blue" active={activeSummary === 'ongoing'} onClick={() => setActiveSummary('ongoing')} />
            <StatCard label="ยืนยันแล้ว" value={String(rows.filter((row) => Boolean(row.confirmDate)).length)} helper="รายการที่มีวันยืนยันข้อมูลแล้ว" tone="amber" active={activeSummary === 'confirmed'} onClick={() => setActiveSummary('confirmed')} />
          </div>

          <div className="relative mt-5 overflow-hidden rounded-3xl border border-border bg-white shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-slate-50/80 px-4 py-3">
              <div className="min-w-0">
                <p className="font-data text-[13px] font-bold leading-5 text-slate-900">Table View</p>
                <p className="font-kanit text-[12px] leading-5 text-slateText">หัวตารางลากสลับตำแหน่งได้ และจัดการคอลัมน์ผ่านปุ่ม Columns</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-border bg-white px-3 py-1.5 font-data text-[12px] font-semibold text-slate-600">
                  {displayFields.length}/{PLM_FIELDS.length} columns
                </div>
                <button
                  type="button"
                  onClick={() => setShowColumnManager((current) => !current)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-data text-[12px] font-semibold transition ${
                    showColumnManager
                      ? 'border-primary-soft bg-primary-pale text-primary'
                      : 'border-border bg-white text-slate-700 hover:border-primary-soft hover:bg-primary-pale hover:text-primary'
                  }`}
                >
                  <Settings2 size={14} />
                  Columns
                </button>
                <button
                  type="button"
                  onClick={resetView}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 font-data text-[12px] font-semibold text-slate-700 transition hover:border-primary-soft hover:bg-primary-pale hover:text-primary"
                >
                  Reset View
                </button>
              </div>
            </div>

            {showColumnManager ? (
              <div className="absolute right-4 top-[68px] z-20 w-[420px] rounded-2xl border border-border bg-white p-4 shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-data text-[13px] font-bold text-slate-900">Manage Columns</p>
                    <p className="font-kanit text-[12px] leading-5 text-slateText">ซ่อนหรือเพิ่มคอลัมน์ที่ต้องการแสดงในตาราง</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowColumnManager(false)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="mt-4">
                  <p className="mb-2 font-data text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Visible</p>
                  <div className="flex flex-wrap gap-2">
                    {displayFields.map((fieldKey) => {
                      const field = PLM_FIELDS.find((item) => item.key === fieldKey);
                      if (!field) return null;
                      return (
                        <button
                          key={`visible-${field.key}`}
                          type="button"
                          onClick={() => toggleFieldVisibility(field.key, setVisibleFields)}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-slate-50 px-3 py-1.5 font-data text-[12px] font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                        >
                          {field.label}
                          <X size={13} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {hiddenFields.length ? (
                  <div className="mt-4">
                    <p className="mb-2 font-data text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">Hidden</p>
                    <div className="flex flex-wrap gap-2">
                      {hiddenFields.map((fieldKey) => {
                        const field = PLM_FIELDS.find((item) => item.key === fieldKey);
                        if (!field) return null;
                        return (
                          <button
                            key={`hidden-${field.key}`}
                            type="button"
                            onClick={() => toggleFieldVisibility(field.key, setVisibleFields)}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 font-data text-[12px] font-semibold text-slate-700 transition hover:border-primary-soft hover:bg-primary-pale hover:text-primary"
                          >
                            <Eye size={14} />
                            {field.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1200px] table-fixed border-collapse">
                <colgroup>
                  {displayFields.map((fieldKey) => (
                    <col key={`col-${fieldKey}`} style={{ width: getColumnWidth(fieldKey) }} />
                  ))}
                </colgroup>
                <thead className="bg-slate-50/70">
                  <tr className="border-b border-border">
                    {displayFields.map((fieldKey) => {
                      const field = PLM_FIELDS.find((item) => item.key === fieldKey);
                      if (!field) return null;

                      return (
                        <th
                          key={`head-${field.key}`}
                          className="px-4 py-3 text-left align-middle"
                          draggable
                          onDragStart={() => setDraggingKey(field.key)}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={() => {
                            if (!draggingKey || draggingKey === field.key) return;
                            setFieldOrder((current) => reorderFields(current, draggingKey, field.key));
                            setDraggingKey(null);
                          }}
                          onDragEnd={() => setDraggingKey(null)}
                        >
                          <div className="group flex items-center justify-between gap-2">
                            <TableHeaderChip label={field.label} tone={field.tone} icon={field.icon} isDragging={draggingKey === field.key} />
                            <button
                              type="button"
                              onClick={() => toggleFieldVisibility(field.key, setVisibleFields)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                              aria-label={`Hide ${field.label}`}
                              title={`Hide ${field.label}`}
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr
                      key={row.id}
                      className="cursor-pointer border-b border-border/80 transition hover:bg-slate-50"
                      onClick={() => setDetailRow(row)}
                    >
                      {displayFields.map((fieldKey) => (
                        <td key={`${row.id}-${fieldKey}`} className="px-4 py-4 align-top">
                          <RowField fieldKey={fieldKey} row={row} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {isAddOpen ? (
        <div className="fixed inset-0 z-[140] overflow-y-auto bg-slate-950/60 backdrop-blur-[2px]" onClick={() => !saving && setIsAddOpen(false)}>
          <div className="mx-auto flex min-h-full w-full items-center justify-center p-6">
            <div className="relative z-[141] w-full max-w-5xl overflow-hidden rounded-[28px] border border-border bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-border px-6 py-5">
                <div>
                  <p className="font-data text-[22px] font-extrabold leading-7 text-ink">Add PLM Record</p>
                  <p className="font-kanit text-[13px] leading-5 text-slateText">เพิ่มรายการใหม่และบันทึกลง Google Sheet พร้อมอัปเดตในหน้าเดียวกัน</p>
                </div>
                <button type="button" onClick={() => !saving && setIsAddOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-slate-500 transition hover:bg-slate-50">
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
                <div className="grid gap-6 p-6">
                  <div className="grid gap-5 lg:grid-cols-2">
                    <FormInput label="PLM ID" value={formState.plm} onChange={(value) => handleFormChange('plm', value)} placeholder="เช่น P250900-00001" />
                    <FormSelect label="Status" value={formState.status} options={dropdownOptions.statuses} onChange={(value) => handleFormChange('status', value)} />
                    <FormSelect label="Group" value={formState.group} options={dropdownOptions.groups} onChange={(value) => handleFormChange('group', value)} />
                    <FormSelect label="PIC" value={formState.pic} options={dropdownOptions.pics} onChange={(value) => handleFormChange('pic', value)} />
                    <FormSelect label="Model" value={formState.model} options={dropdownOptions.models} onChange={(value) => handleFormChange('model', value)} />
                    <FormSelect label="Channel" value={formState.channel} options={dropdownOptions.channels} onChange={(value) => handleFormChange('channel', value)} allowBlank />
                  </div>

                  <div className="rounded-2xl border border-border bg-slate-50/70 p-4">
                    <p className="font-data text-[13px] font-bold text-slate-700">Dates</p>
                    <div className="mt-4 grid gap-5 lg:grid-cols-3">
                      <FormDate label="Request Date" value={formState.requestDate} onChange={(value) => handleFormChange('requestDate', value)} />
                      <FormDate label="Register Date" value={formState.registerDate} onChange={(value) => handleFormChange('registerDate', value)} />
                      <FormDate label="Confirm Date" value={formState.confirmDate} onChange={(value) => handleFormChange('confirmDate', value)} />
                    </div>
                  </div>

                  <div className="grid gap-5">
                    <FormTextarea label="Symptom" value={formState.symptom} onChange={(value) => handleFormChange('symptom', value)} placeholder="อธิบายอาการหรือปัญหาที่พบ" />
                    <FormTextarea label="Remark" value={formState.remark} onChange={(value) => handleFormChange('remark', value)} placeholder="รายละเอียดเพิ่มเติมหรือแนวทางติดตาม" />
                  </div>
                </div>
              </div>

              <div className="border-t border-border bg-white px-6 py-4">
                {formError ? (
                  <div className="mb-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-kanit text-[13px] leading-5 text-red-700">{formError}</div>
                ) : null}
                <div className="flex items-center justify-end gap-3">
                  <Button variant="secondary" size="sm" onClick={() => setIsAddOpen(false)} disabled={saving}>Cancel</Button>
                  <Button size="sm" onClick={() => void handleAddPlm()} disabled={saving} icon={<Plus size={15} />}>
                    {saving ? 'Saving...' : 'Save PLM'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {detailRow ? (
        <div className="fixed inset-0 z-[300] bg-slate-950/60 backdrop-blur-[3px]" onClick={() => setDetailRow(null)}>
          <div className="absolute inset-3 md:inset-5 lg:inset-6">
            <div
              className="relative isolate flex h-full w-full flex-col overflow-hidden rounded-[30px] border border-border bg-white shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-4 border-b border-border bg-white px-6 py-5">
                <div>
                  <p className="font-data text-[24px] font-extrabold leading-8 text-ink">
                    {detailRow.plm || 'PLM Status Detail'}
                  </p>
                  <p className="font-kanit text-[13px] leading-5 text-slateText">
                    มุมมองเต็มหน้าจอของรายการนี้ พร้อมข้อมูลครบทุกหัวข้อ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailRow(null)}
                  className="rounded-full border border-border px-3 py-1.5 font-data text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/60 p-6">
                <div className="grid gap-4 lg:grid-cols-2">
                  {detailFields.map((fieldKey) => (
                    <FieldCard key={`detail-${detailRow.id}-${fieldKey}`} fieldKey={fieldKey} row={detailRow} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function normalizePlmRow(row: PlmStatusRecord | Record<string, string>): PlmStatusRecord {
  const source = row as Record<string, string>;
  return {
    id: source.id || '',
    plm: source.plm || '',
    symptom: source.symptom || '',
    group: source.group || '',
    pic: source.pic || '',
    status: source.status || '',
    model: source.model || '',
    requestDate: source.requestDate || source.request_date || '',
    registerDate: source.registerDate || source.register_date || '',
    confirmDate: source.confirmDate || source.confirm_date || '',
    channel: source.channel || '',
    remark: source.remark || '',
  };
}

function StatCard({
  label,
  value,
  helper,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: string;
  helper: string;
  tone: 'emerald' | 'blue' | 'amber';
  active: boolean;
  onClick: () => void;
}) {
  const tones = {
    emerald: active ? 'border-emerald-200 bg-emerald-50' : 'border-emerald-100 bg-emerald-50/70',
    blue: active ? 'border-blue-200 bg-blue-50' : 'border-blue-100 bg-blue-50/70',
    amber: active ? 'border-amber-200 bg-amber-50' : 'border-amber-100 bg-amber-50/70',
  } satisfies Record<string, string>;
  const valueTones = {
    emerald: 'text-emerald-700',
    blue: 'text-blue-700',
    amber: 'text-amber-700',
  } satisfies Record<string, string>;

  return (
    <button type="button" onClick={onClick} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${tones[tone]}`}>
      <p className="font-kanit text-[13px] font-medium text-slate-700">{label}</p>
      <p className={`mt-2 font-data text-[30px] font-extrabold leading-9 tracking-[-0.03em] ${valueTones[tone]}`}>{value}</p>
      <p className="mt-1 font-kanit text-[12px] leading-5 text-slate-600">{helper}</p>
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone = status === 'Done' || status === 'Closed'
    ? 'bg-primary-pale text-primary border-primary-soft'
    : status === 'Ongoing' || status === 'In Progress'
      ? 'bg-blue-50 text-blue-700 border-blue-100'
      : status === 'Pending' || status === 'Waiting'
        ? 'bg-orange-50 text-orange-700 border-orange-100'
        : 'bg-slate-100 text-slate-700 border-slate-200';

  return <span className={`inline-flex rounded-full border px-2.5 py-1 font-data text-[12px] font-semibold ${tone}`}>{status || '-'}</span>;
}

function NamePill({ name }: { name: string }) {
  const tones = [
    'bg-blue-50 text-blue-700',
    'bg-violet-50 text-violet-700',
    'bg-orange-50 text-orange-700',
    'bg-teal-50 text-teal-700',
    'bg-fuchsia-50 text-fuchsia-700',
    'bg-rose-50 text-rose-700',
    'bg-cyan-50 text-cyan-700',
    'bg-lime-50 text-lime-700',
  ];
  const index = Math.abs((name || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)) % tones.length;
  return <span className={`inline-flex rounded-full px-2.5 py-1 font-data text-[12px] font-semibold ${tones[index]}`}>{name || '-'}</span>;
}

function TableHeaderChip({ label, tone, icon, isDragging = false }: { label: string; tone: HeaderTone; icon: ReactNode; isDragging?: boolean }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    sky: 'bg-sky-50 text-sky-700 border-sky-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    red: 'bg-red-50 text-red-700 border-red-100',
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
  } satisfies Record<string, string>;

  return <span className={`inline-flex shrink-0 whitespace-nowrap items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-data text-[10px] font-bold tracking-[0.02em] ${tones[tone]} ${isDragging ? 'opacity-60 shadow-sm' : ''}`}>{icon}{label}</span>;
}

function FieldCard({ fieldKey, row }: { fieldKey: PlmFieldKey; row: PlmStatusRecord }) {
  const field = PLM_FIELDS.find((item) => item.key === fieldKey);
  if (!field) return null;

  return (
    <div className="rounded-2xl border border-border bg-slate-50/80 p-4">
      <div className="mb-3">
        <TableHeaderChip label={field.label} tone={field.tone} icon={field.icon} />
      </div>
      <div>{renderFieldValue(fieldKey, row)}</div>
    </div>
  );
}

function RowField({ fieldKey, row }: { fieldKey: PlmFieldKey; row: PlmStatusRecord }) {
  switch (fieldKey) {
    case 'plm':
      return <div className="inline-flex whitespace-nowrap rounded-xl bg-emerald-50 px-3 py-2 font-data text-[15px] font-extrabold leading-5 tracking-[-0.02em] text-emerald-700">{row.plm || '-'}</div>;
    case 'status':
      return <div className="justify-self-start"><StatusPill status={row.status} /></div>;
    case 'model':
      return <p className="whitespace-nowrap font-data text-[15px] font-bold leading-6 text-slate-800">{row.model || '-'}</p>;
    case 'pic':
      return <NamePill name={row.pic} />;
    case 'group':
      return <span className="inline-flex whitespace-nowrap rounded-full bg-rose-50 px-2.5 py-1 font-data text-[12px] font-semibold text-rose-700">{row.group || '-'}</span>;
    case 'requestDate':
      return <p className="whitespace-nowrap font-data text-[14px] font-semibold leading-6 text-slate-800">{formatPlmDate(row.requestDate)}</p>;
    case 'registerDate':
      return <p className="whitespace-nowrap font-data text-[14px] font-semibold leading-6 text-slate-800">{formatPlmDate(row.registerDate)}</p>;
    case 'confirmDate':
      return <p className="whitespace-nowrap font-data text-[14px] font-semibold leading-6 text-slate-800">{formatPlmDate(row.confirmDate)}</p>;
    case 'channel':
      return <span className="inline-flex max-w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 font-data text-[12px] font-semibold text-slate-700">{row.channel || '-'}</span>;
    case 'symptom':
      return <p className="line-clamp-2 font-data text-[14px] font-medium leading-6 text-slate-800">{row.symptom || '-'}</p>;
    case 'remark':
      return <p className="line-clamp-2 font-data text-[14px] font-medium leading-6 text-slate-700">{row.remark || '-'}</p>;
    default:
      return <p className="font-data text-[14px] font-medium leading-6 text-slate-700">-</p>;
  }
}

function FormInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block font-data text-[13px] font-semibold text-slate-700">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-border px-3 font-data text-[14px] font-medium text-ink outline-none transition focus:border-primary-soft focus:ring-2 focus:ring-primary-pale" />
    </label>
  );
}

function FormSelect({
  label,
  value,
  options,
  onChange,
  allowBlank = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  allowBlank?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block font-data text-[13px] font-semibold text-slate-700">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-border px-3 font-data text-[14px] font-medium text-ink outline-none transition focus:border-primary-soft focus:ring-2 focus:ring-primary-pale">
        {allowBlank ? <option value="">Select</option> : null}
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}

function FormDate({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block font-data text-[13px] font-semibold text-slate-700">{label}</span>
      <input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-xl border border-border px-3 font-data text-[14px] font-medium text-ink outline-none transition focus:border-primary-soft focus:ring-2 focus:ring-primary-pale" />
    </label>
  );
}

function FormTextarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block font-data text-[13px] font-semibold text-slate-700">{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} rows={4} className="w-full rounded-xl border border-border px-3 py-3 font-data text-[14px] font-medium text-ink outline-none transition focus:border-primary-soft focus:ring-2 focus:ring-primary-pale" />
    </label>
  );
}

function isOngoingStatus(status: string) {
  return ['ongoing', 'in progress', 'pending', 'waiting'].includes(status.trim().toLowerCase());
}

function getVisibleRows(rows: PlmStatusRecord[], activeSummary: SummaryKey) {
  switch (activeSummary) {
    case 'ongoing':
      return rows.filter((row) => isOngoingStatus(row.status));
    case 'confirmed':
      return rows.filter((row) => Boolean(row.confirmDate));
    default:
      return rows;
  }
}

function renderFieldValue(fieldKey: PlmFieldKey, row: PlmStatusRecord) {
  switch (fieldKey) {
    case 'plm':
      return <div className="inline-flex rounded-xl bg-emerald-50 px-3 py-2 font-data text-[20px] font-extrabold leading-6 tracking-[-0.02em] text-emerald-700">{row.plm || '-'}</div>;
    case 'status':
      return <StatusPill status={row.status} />;
    case 'model':
      return <p className="font-data text-[18px] font-bold leading-6 text-slate-800">{row.model || '-'}</p>;
    case 'pic':
      return <NamePill name={row.pic} />;
    case 'group':
      return <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-1 font-data text-[12px] font-semibold text-rose-700">{row.group || '-'}</span>;
    case 'requestDate':
      return <p className="font-data text-[16px] font-semibold leading-6 text-slate-800">{formatPlmDate(row.requestDate)}</p>;
    case 'registerDate':
      return <p className="font-data text-[16px] font-semibold leading-6 text-slate-800">{formatPlmDate(row.registerDate)}</p>;
    case 'confirmDate':
      return <p className="font-data text-[16px] font-semibold leading-6 text-slate-800">{formatPlmDate(row.confirmDate)}</p>;
    case 'channel':
      return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 font-data text-[12px] font-semibold text-slate-700">{row.channel || '-'}</span>;
    case 'symptom':
      return <p className="font-data text-[15px] font-medium leading-7 text-slate-800">{row.symptom || '-'}</p>;
    case 'remark':
      return <p className="font-data text-[15px] font-medium leading-7 text-slate-700">{row.remark || '-'}</p>;
    default:
      return <p className="font-data text-[15px] font-medium leading-7 text-slate-700">-</p>;
  }
}

function reorderFields(order: PlmFieldKey[], from: PlmFieldKey, to: PlmFieldKey) {
  const next = [...order];
  const fromIndex = next.indexOf(from);
  const toIndex = next.indexOf(to);
  if (fromIndex === -1 || toIndex === -1) return order;
  next.splice(fromIndex, 1);
  next.splice(toIndex, 0, from);
  return next;
}

function getColumnWidth(fieldKey: PlmFieldKey) {
  const widths: Record<PlmFieldKey, string> = {
    plm: '180px',
    model: '150px',
    status: '130px',
    pic: '150px',
    group: '130px',
    requestDate: '170px',
    registerDate: '170px',
    confirmDate: '170px',
    channel: '210px',
    symptom: '260px',
    remark: '220px',
  };
  return widths[fieldKey];
}

function toggleFieldVisibility(fieldKey: PlmFieldKey, setVisibleFields: Dispatch<SetStateAction<PlmFieldKey[]>>) {
  setVisibleFields((current: PlmFieldKey[]) => {
    if (current.includes(fieldKey)) {
      if (current.length === 1) return current;
      return current.filter((key: PlmFieldKey) => key !== fieldKey);
    }
    return [...current, fieldKey];
  });
}

function normalizeDateForSheet(value: string) {
  if (!value) return '';
  try {
    return format(new Date(value), 'dd/MM/yyyy');
  } catch {
    return value;
  }
}

function formatPlmDate(value: string) {
  if (!value) return '-';
  const patterns = ['d/M/yyyy', 'dd/M/yyyy', 'd/MM/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd'];
  for (const pattern of patterns) {
    const parsed = parse(value, pattern, new Date());
    if (!Number.isNaN(parsed.getTime())) return format(parsed, 'dd MMM yyyy');
  }
  return value;
}

function buildOptions(values: string[], defaults: string[]) {
  return Array.from(new Set([...defaults, ...values.filter(Boolean)])).sort((a, b) => a.localeCompare(b));
}

function MockWorkPanel({ title }: { title: string }) {
  const rows = [
    ['Open records', '24', 'Waiting review'],
    ['Ready to sync', '12', 'Clean'],
    ['Need attention', '5', 'Check today'],
  ];

  return (
    <div className="rounded-card border border-border bg-white p-5 shadow-card">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-data text-[14px] font-bold leading-5 text-ink">{title}</p>
          <p className="font-kanit text-[12px] font-normal leading-5 text-slateText">พื้นที่ตัวอย่างสำหรับเชื่อมต่อข้อมูลจริงในอนาคต</p>
        </div>
        <div className="rounded-full border border-primary-soft bg-primary-pale px-3 py-1 font-data text-[12px] font-medium text-primary">Mock module</div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {rows.map(([label, value, status]) => (
          <div key={label} className="rounded-2xl border border-border bg-slate-50 p-4">
            <p className="font-data text-[12px] font-medium text-slateText">{label}</p>
            <p className="mt-2 font-data text-[32px] font-extrabold leading-10 tracking-[-0.03em] text-ink">{value}</p>
            <p className="mt-2 font-data text-[12px] font-medium text-primary">{status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
