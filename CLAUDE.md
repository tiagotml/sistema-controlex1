# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sistema de Controle X1 is a marketing and sales management system for tracking daily metrics from Facebook Ads campaigns. It calculates ROI, CPL, CPA, and other business metrics, providing dashboards, monthly views, and historical data with interactive charts.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173 or next available port)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Database Setup

The application requires two Supabase tables. Execute these SQL files in order:

1. **`supabase-setup.sql`** - Creates `lancamentos` table (daily launches/entries)
2. **`supabase-prolabore.sql`** - Creates `prolabore` table (monthly withdrawals)

Environment variables required in `.env`:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous/public key

## Architecture

### Data Flow

1. **User Input** → `DailyForm.jsx` → Supabase `lancamentos` table
2. **Data Retrieval** → `App.jsx` loads from Supabase → passes to child components
3. **Filtering** → `DateFilter.jsx` filters data by period → `App.jsx` applies filter → components receive filtered data
4. **Calculations** → All metrics calculated in `src/utils/calculations.js` using pure functions
5. **Pró-Labore** → Managed separately in `ProLaboreManager.jsx`, stored in `prolabore` table, integrated into monthly calculations

### State Management

- **No external state library** - Uses React useState/useEffect
- `App.jsx` is the main state container holding:
  - `lancamentos` - all entries from database
  - `lancamentosFiltrados` - filtered subset based on date range
  - `filtroAtual` - current filter configuration
  - `userId` - current user ID for pró-labore queries
- Child components are mostly presentational, receiving data via props
- Components that modify data (`DailyForm`, `HistoryTable`, `ProLaboreManager`) call `onUpdate` callbacks to trigger data refresh

### Component Hierarchy

```
App.jsx (main container)
├── DateFilter.jsx (period filtering)
├── Dashboard.jsx (overview with charts)
│   └── Uses Recharts: AreaChart, BarChart, PieChart
├── DailyForm.jsx (create new entries)
├── HistoryTable.jsx (view/edit/delete entries)
├── MonthlyView.jsx (monthly aggregation with pró-labore integration)
│   └── Loads prolabore data independently via useEffect
└── ProLaboreManager.jsx (manage monthly withdrawals)
```

### Key Calculations (src/utils/calculations.js)

**ROI is calculated as a multiplier, NOT percentage:**
- `calcularROI(valorVendas, gastoAds)` returns `valorVendas / gastoAds`
- Example: R$100 invested → R$200 sales = 2.0x ROI
- Display format: `formatarMultiplicador()` adds "x" suffix

**Other metrics:**
- CPL = Gasto Ads / Qtd Leads
- CPA = Gasto Ads / Qtd Vendas
- Ticket Médio = Valor Vendas / Qtd Vendas
- Lucro = Valor Vendas - Gasto Ads

**Aggregation functions:**
- `calcularMetricasDiarias()` - single entry metrics
- `calcularMetricasTotais()` - sum across multiple entries
- `calcularResumoMensal()` - groups by month using `agruparPorMes()`

### Date Filtering System

Filters are applied at the `App.jsx` level:

1. `DateFilter` component emits filter object: `{ tipo, inicio, fim }`
2. `App.jsx` stores in `filtroAtual` state
3. `useEffect` watches `[lancamentos, filtroAtual]` and calls `aplicarFiltro()`
4. `aplicarFiltro()` updates `lancamentosFiltrados`
5. All view components receive `lancamentosFiltrados` instead of `lancamentos`

Filter types: `'todos'`, `'hoje'`, `'7dias'`, `'15dias'`, `'30dias'`, `'personalizado'`

### Pró-Labore Integration

Monthly withdrawals are stored separately but integrated into calculations:

1. `ProLaboreManager` - CRUD interface for monthly values (format: "2025-01")
2. `MonthlyView` - fetches prolabore data via `useEffect` when `userId` changes
3. Stores as object map: `{ "2025-01": 5000.00, "2025-02": 6000.00 }`
4. For each month row, looks up: `prolabores[mes.mes] || 0`
5. Calculates: Lucro Líquido = Lucro Bruto - Pró-Labore do Mês

### Chart Library (Recharts)

Used in `Dashboard.jsx` and `MonthlyView.jsx`:

- **AreaChart** - evolution over time (faturamento, gasto, lucro)
- **BarChart** - comparisons (ROI per month, revenue vs spend)
- **LineChart** - trends (profit, ROI)
- **PieChart** - distribution (profit vs ad spend)

All charts use `ResponsiveContainer` and custom tooltips with `formatarMoeda()` or `formatarMultiplicador()`.

### Styling Patterns

- Tailwind CSS with utility classes
- Gradient backgrounds: `bg-gradient-to-r from-blue-500 to-blue-600`
- Cards: `rounded-xl shadow-lg` with hover effects
- Badges/Pills: `inline-flex items-center px-3 py-1 rounded-full`
- Color coding:
  - Green: positive values (profit, revenue)
  - Red: costs, negative values
  - Blue: neutral metrics
  - Purple/Indigo: counts (leads, sales)

### Fake Data Mode

If Supabase connection fails, app falls back to `dadosFake` array in `App.jsx`. Yellow banner displays "Modo Demonstração". This allows development without database setup.

## Important Patterns to Follow

### When Adding New Metrics

1. Add calculation function to `src/utils/calculations.js`
2. Add to `calcularMetricasDiarias()` or `calcularMetricasTotais()` as appropriate
3. Update component display logic
4. Maintain consistent formatting (use `formatarMoeda`, `formatarNumero`, `formatarMultiplicador`)

### When Adding New Components

1. Place in `src/components/`
2. Use `.jsx` extension
3. Import icons from `lucide-react`
4. Follow existing prop patterns (receive data, emit callbacks)
5. Add to `App.jsx` tabs array if it's a main view

### When Modifying Database Schema

1. Create new `.sql` file in project root
2. Document in this file's "Database Setup" section
3. Update TypeScript-style JSDoc comments if adding fields
4. Regenerate fake data if needed

### Date Handling

- Database stores as DATE type (YYYY-MM-DD)
- Always append 'T00:00:00' when creating Date objects: `new Date(data + 'T00:00:00')`
- This prevents timezone conversion issues
- Format display with: `new Date(...).toLocaleDateString('pt-BR')`

### Supabase Patterns

```javascript
// Query all
const { data, error } = await supabase
  .from('lancamentos')
  .select('*')
  .order('data', { ascending: false })

// Insert
const { error } = await supabase
  .from('lancamentos')
  .insert([{ data, gasto_ads, valor_vendas, qtd_leads, qtd_vendas }])

// Update
const { error } = await supabase
  .from('lancamentos')
  .update({ field: value })
  .eq('id', id)

// Delete
const { error } = await supabase
  .from('lancamentos')
  .delete()
  .eq('id', id)
```

Always handle errors and call `onUpdate()` callback to refresh data in parent component.

## Automation: AI Agents & MCP Tools

**IMPORTANT:** Claude Code should AUTOMATICALLY determine which specialized agent or MCP tool to use based on the task type, WITHOUT waiting for explicit user instruction.

### AI Agents (Use Task Tool)

**Backend-Architect Agent** (`subagent_type: "backend-architect"`)
- **When to use automatically:**
  - Modifying Supabase queries or database operations
  - Implementing new API endpoints or data fetching logic
  - Adding business logic calculations (ROI, CPL, CPA, etc.)
  - Optimizing database performance or query efficiency
  - Creating new SQL migrations or modifying schema
  - Adding server-side validation or data processing

**Frontend-Specialist Agent** (`subagent_type: "frontend-specialist"`)
- **When to use automatically:**
  - Creating new UI components or modifying existing ones
  - Implementing new charts or data visualizations (Recharts)
  - Styling changes with Tailwind CSS
  - Adding new forms or input controls
  - Improving responsive design or layout
  - Adding animations, transitions, or visual effects
  - Modifying dashboard cards, badges, or UI elements

**Code-Reviewer Agent** (`subagent_type: "code-reviewer"`)
- **When to use automatically:**
  - IMMEDIATELY after completing ANY significant code changes
  - After adding a new feature or component
  - After fixing a bug
  - After refactoring code
  - Before committing changes to git
  - User explicitly requests code review

**Explore Agent** (`subagent_type: "Explore"`)
- **When to use automatically:**
  - User asks "where is..." or "how does... work"
  - Need to understand codebase structure before making changes
  - Looking for patterns across multiple files
  - Investigating how a feature is implemented
  - Finding all occurrences of a pattern (not a specific file)

### MCP Tools (Supabase)

**IMPORTANT:** Always prefer MCP tools over manual SQL or API calls when available.

**Supabase MCP Tools - Use AUTOMATICALLY for:**
- Database operations (list tables, execute SQL, migrations)
- Getting project configuration (URL, keys)
- Checking logs or diagnostics
- Any Supabase-related task

**Example automatic workflows:**

```
User: "Add a new field to track conversion rate"
→ Use backend-architect agent (database schema change)
→ After implementation, use code-reviewer agent
→ Commit changes with git

User: "The dashboard cards look cluttered"
→ Use frontend-specialist agent (UI/styling task)
→ After implementation, use code-reviewer agent

User: "Where is the ROI calculation happening?"
→ Use Explore agent (codebase investigation)

User: "Check if the lancamentos table exists"
→ Use Supabase MCP tools directly (if available)

User: "Fix the bug in the monthly view"
→ First investigate with Explore agent (if needed)
→ Then use backend-architect or frontend-specialist based on the bug type
→ Then use code-reviewer agent after fix
```

### Decision Tree for Agent Selection

1. **Is it a UI/styling task?** → frontend-specialist
2. **Is it a database/API/business logic task?** → backend-architect
3. **Is it a "where/how does X work" question?** → Explore
4. **Did I just finish writing code?** → code-reviewer
5. **Is it a Supabase operation?** → MCP tools first, backend-architect if complex

### Rules

- **ALWAYS use specialized agents** - Don't do complex tasks directly
- **ALWAYS review code after implementation** - Use code-reviewer agent
- **PREFER MCP tools** - Use them instead of manual operations when available
- **DON'T ask user which agent to use** - Decide automatically based on task type
- **DO explain which agent you're using** - Brief mention like "Using backend-architect agent to implement this feature"
