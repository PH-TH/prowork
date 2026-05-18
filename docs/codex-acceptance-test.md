# Backtest Strategy Lab - Codex Acceptance Test Checklist

Use this checklist for final QA against the six reference screenshots:

- `/design-references/performance-tab.png`
- `/design-references/risk-tab.png`
- `/design-references/trade-log-tab.png`
- `/design-references/replay-journal-tab.png`
- `/design-references/strategy-library-tab.png`
- `/design-references/settings-tab.png`

---

## 1) Visual Match Against Six Reference Screenshots

### Global visual quality
- [ ] Light mode is consistent across all tabs.
- [ ] App background is soft gray and cards are white.
- [ ] Borders are subtle and consistent.
- [ ] Card radius, spacing, and shadows match premium SaaS style.
- [ ] Purple accent usage is consistent and intentional.
- [ ] Typography hierarchy is clear (title, subtitle, labels, values).
- [ ] Layout density is data-rich but not crowded.

### Header and navigation
- [ ] Header logo, title, and subtitle are present and aligned.
- [ ] Top tab navigation exists for all six tabs.
- [ ] Active tab highlight/underline matches reference behavior.
- [ ] Right-side icons/avatar/plan area are present and aligned.

### Per-reference visual comparison
- [ ] Performance tab visually matches reference composition.
- [ ] Risk tab visually matches reference composition.
- [ ] Trade Log tab visually matches reference composition.
- [ ] Replay Journal tab visually matches reference composition.
- [ ] Strategy Library tab visually matches reference composition.
- [ ] Settings tab visually matches reference composition.

---

## 2) Font Preservation

- [ ] Existing project font is unchanged.
- [ ] No new font import was added.
- [ ] Global `font-family` was not modified.
- [ ] Tailwind font config was not changed in a conflicting way.
- [ ] New components inherit the existing font automatically.

---

## 3) Data Consistency Across All Tabs

- [ ] All tabs read from one shared source of truth.
- [ ] Strategy metrics are derived from shared trades/runs (not hardcoded per tab).
- [ ] Performance values match Strategy Library for the same filters.
- [ ] Risk values are derived from the same filtered trades.
- [ ] Trade Log selected trade links to Replay Journal selected replay/trade.
- [ ] Settings validation criteria affect status logic (where implemented).
- [ ] No contradictory numbers between KPI cards and charts for same filters.
- [ ] No `NaN`, `undefined`, or broken empty states in calculations.

---

## 4) Performance Tab Acceptance Criteria

- [ ] Filter bar exists (Date Range, Strategy, Symbol, Timeframe, Session, Data Type, Reset).
- [ ] KPI cards are present and calculated correctly.
- [ ] Equity Curve chart renders correctly.
- [ ] Net R by Strategy chart renders correctly.
- [ ] Monthly Performance Heatmap renders correctly.
- [ ] Expectancy by Setup renders correctly.
- [ ] Performance by Session renders correctly.
- [ ] Performance by Symbol panel/table renders correctly.
- [ ] R-Multiple Distribution renders correctly.
- [ ] Win/Loss/Break-even breakdown renders correctly.
- [ ] Performance Insights panel is present and coherent.
- [ ] Color semantics are correct (profit green, loss red, etc.).

---

## 5) Risk Tab Acceptance Criteria

- [ ] Filter bar exists and works.
- [ ] Risk KPI cards are present and computed correctly.
- [ ] Drawdown Curve renders and uses risk color semantics.
- [ ] Equity with Drawdown Zones renders correctly.
- [ ] Worst Drawdown Periods table is present and coherent.
- [ ] Consecutive Losses Analysis is present.
- [ ] Risk by Strategy table is present.
- [ ] Risk by Session table is present.
- [ ] Risk Rules / Stop Conditions panel is present.
- [ ] Risk Insights & Recommendations panel is present.
- [ ] Risk Pressure logic appears coherent with data.

---

## 6) Trade Log Tab Acceptance Criteria

- [ ] Trade Log filter bar exists and works.
- [ ] Quick KPI cards are present and update with filters.
- [ ] Trade table contains required columns.
- [ ] Table sorting/filtering/pagination are usable.
- [ ] Selected row highlight is visible and clear.
- [ ] Trade detail panel updates when selecting a row.
- [ ] Before/after screenshot placeholders or images are shown.
- [ ] Entry reason and exit reason are shown.
- [ ] Rule checklist and MFE/MAE summary are shown.
- [ ] Mistake analysis and lesson learned are shown.
- [ ] Replay action/button is present.

---

## 7) Replay Journal Tab Acceptance Criteria

- [ ] Replay list is present and filterable.
- [ ] Selected replay detail panel is present.
- [ ] Before Entry and After Exit panels are present.
- [ ] Rule Checklist is present and readable.
- [ ] MFE/MAE timeline is present.
- [ ] Decision Review section is present.
- [ ] Notes & lesson section is present.
- [ ] Next Drill recommendations are present.
- [ ] Selected replay links to a real shared trade record.

---

## 8) Strategy Library Tab Acceptance Criteria

- [ ] Header, subtitle, and action buttons are present.
- [ ] Filter row is present and usable.
- [ ] Summary cards are present and coherent.
- [ ] Status distribution donut is present.
- [ ] Strategy table includes required metrics.
- [ ] Selected strategy detail panel is present.
- [ ] Hypothesis, entry/exit/risk rules are shown.
- [ ] Market conditions (best/weak) are shown.
- [ ] Version history is present.
- [ ] Decision history is present.
- [ ] Table metrics match shared derived metrics.

---

## 9) Settings Tab Acceptance Criteria

- [ ] Backtest Assumptions section is present.
- [ ] Execution Cost Settings section is present.
- [ ] Risk Model Settings section is present.
- [ ] Validation Criteria section is present.
- [ ] Replay & Journal Settings section is present.
- [ ] Display Preferences section is present.
- [ ] Export Settings section is present.
- [ ] Reset to Defaults button is present.
- [ ] Save Changes button is present.
- [ ] Form fields and toggles are usable.
- [ ] Save/dirty-state feedback is visible.

---

## 10) Animation QA

- [ ] Tab transitions are smooth and subtle.
- [ ] Card entrance/stagger feels premium, not distracting.
- [ ] KPI number animation is readable and stable.
- [ ] Chart animation is smooth and not noisy.
- [ ] Table row hover/selection transitions are polished.
- [ ] Drawer/modal transitions are smooth.
- [ ] Checklist/toggle interactions animate cleanly.
- [ ] Save state animation (loading/success) is clear.
- [ ] Reduced motion behavior is respected when practical.

---

## 11) Responsive QA

### Desktop
- [ ] Layout alignment and spacing are correct.
- [ ] No overlapping cards/charts/tables.

### Tablet
- [ ] Columns collapse cleanly.
- [ ] Panels remain readable and usable.

### Mobile
- [ ] Tab nav remains usable (scrollable if needed).
- [ ] Cards stack cleanly.
- [ ] Tables scroll horizontally as needed.
- [ ] No major overflow or clipped content.

---

## 12) Technical QA

- [ ] Install dependencies succeeds.
- [ ] Lint passes.
- [ ] Type check passes.
- [ ] Tests pass (if tests exist).
- [ ] Build passes.
- [ ] No runtime console errors in browser.
- [ ] No broken imports or missing modules.
- [ ] No blank/broken charts due to data parsing errors.

---

## 13) Final Acceptance Score

### Scoring rubric
- Visual Match: ____ / 20
- Font Preservation: ____ / 10
- Data Consistency: ____ / 20
- Functional Completeness (6 tabs): ____ / 30
- Animation Quality: ____ / 10
- Responsive + Technical: ____ / 10

**Total Score: ____ / 100**

### Final status
- [ ] Pass (90-100)
- [ ] Partial Pass (75-89)
- [ ] Fail (<75)

### Final recommendation
- [ ] Ready to ship
- [ ] Needs minor polish
- [ ] Needs major revision

