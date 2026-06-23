---
name: software-development-workflow-framework
description: "Framework pengembangan perangkat lunak lengkap untuk tim ClawGator. Brainstorming, planning, eksekusi sistematis, TDD, debugging, code review, dan git worktrees. Trigger otomatis sebelum memulai proyek atau perubahan kode."
category: "Development"
author: community
version: "1.0.0"
icon: code
---

# ClawGator Superpowers

Framework pengembangan perangkat lunak lengkap untuk tim ClawGator. Dibuat berdasarkan obra/superpowers namun disesuaikan khusus untuk kebutuhan ClawGator.

## Kapan Menggunakan

**SELALU gunakan skill ini SEBELUM:**
- Memulai fitur baru atau komponen
- Mengubah perilaku atau fungsi
- Fix bug atau issue
- Perubahan signifikan pada kode
- Membuat perencanaan implementasi

**Lewati untuk:**
- Pertanyaan simpel atau pencarian informasi
- Perintah satu baris
- Melihat konteks proyek (gunakan skill terkait)

## Alur Kerja Lengkap

```
Permintaan Pengembangan
    ↓
┌──────────────────────┐
│  USING SUPERPOWERS   │ ← Skill utama - memandu semua langkah
│  (skill dasar)       │   - Menemukan skill yang relevan
│                      │   - Menentukan prioritas skill
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│   BRAINSTORMING      │ ← Memahami requirement & desain
│  (jika butuh desain) │   - Tanya pertanyaan satu per satu
│                      │   - Usulkan 2-3 pendekatan
│                      │   - Validasi desain incrementally
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│  USING GIT WORKTREES│ ← Setup workspace terisolasi
│  (sebelum coding)    │   - Create branch baru
│                      │   - Setup project
│                      │   - Verify baseline tests
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│   WRITING PLANS      │ ← Buat rencana implementasi
│  (jika multi-task)   │   - Pecah jadi tasks kecil (2-5 min)
│                      │   - Exact file paths & complete code
│                      │   - Include TDD steps
└──────────┬───────────┘
           ↓
    ┌──────┴──────┐
    │             ↓
    │  ┌──────────────────────┐
    │  │ SUBAGENT-DRIVEN DEV  │ ← Eksekusi via subagent (option 1)
    │  │  (sesi ini)          │   - Fresh subagent per task
    │  │                      │   - Review antar task
    │  └──────────┬───────────┘
    │
    │  ┌──────────────────────┐
    │  │   EXECUTING PLANS    │ ← Eksekusi batch (option 2)
    │  │  (sesi terpisah)     │   - Batch execution
    │  │                      │   - Review checkpoints
    │  └──────────┬───────────┘
    │
    ↓  ↓
┌──────────────────────┐
│ TEST-DRIVEN DEVELOPMENT │ ← WAJIB untuk semua coding
│  (selalu aktif)         │   - RED: Tulis test, lihat fail
│                        │   - GREEN: Implement minimal code
│                        │   - REFACTOR: Clean up
└──────────┬─────────────┘
           ↓
┌──────────────────────┐
│ SYSTEMATIC DEBUGGING  │ ← Jika ada bug/issue
│  (jika error muncul)  │   - Phase 1: Investigasi root cause
│                      │   - Phase 2: Analisis pola
│                      │   - Phase 3: Hipotesis & testing
│                      │   - Phase 4: Fix & verify
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│   CODE REVIEW        │ ← Review antar tasks
│  (antara tasks)      │   - Requesting: Review code
│                      │   - Receiving: Apply feedback
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│   VERIFICATION       │ ← Konfirmasi benar-bener fix
│  (sebelum selesai)   │   - Test lagi
│                      │   - Cek regressions
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ FINISHING DEV BRANCH │ ← Selesai branch
│  (setelah semua)     │   - Verify tests
│                      │   - Present options:
│                      │   * Merge ke main
│                      │   * Buat PR
│                      │   * Keep branch
│                      │   * Discard
└──────────────────────┘
```

## Sub-Skills Tersedia

### 🎯 Skills Utama (Process)

| Skill | Kapan Dipakai | Fungsi |
|-------|--------------|--------|
| **using-superpowers** | SELALU di awal conversation | Memandu penggunaan skill |
| **brainstorming** | Sebelum coding | Memahami requirement & desain |
| **writing-plans** | Setelah desain disetujui | Buat rencana implementasi |
| **executing-plans** | Setelah plan siap | Eksekusi plan |
| **finishing-a-development-branch** | Setelah selesai | Wrap up branch |

### 🔨 Skills Eksekusi

| Skill | Kapan Dipakai | Fungsi |
|-------|--------------|--------|
| **subagent-driven-development** | Option 1 eksekusi | Fresh subagent per task |
| **dispatching-parallel-agents** | Paralel tasks | Dispatch multiple agents |

### 🧪 Skills Quality

| Skill | Kapan Dipakai | Fungsi |
|-------|--------------|--------|
| **test-driven-development** | SELALU sebelum coding | RED-GREEN-REFACTOR |
| **systematic-debugging** | Jika ada bug | 4-phase root cause analysis |
| **verification-before-completion** | Sebelum mark selesai | Konfirmasi benar-bener fix |

### 🔧 Skills Git & Review

| Skill | Kapan Dipakai | Fungsi |
|-------|--------------|--------|
| **using-git-worktrees** | Sebelum coding di new branch | Isolated workspace |
| **requesting-code-review** | Antara tasks | Review code terhadap plan |
| **receiving-code-review** | Setelah feedback | Apply review feedback |

### 📝 Skills Meta

| Skill | Kapan Dipakai | Fungsi |
|-------|--------------|--------|
| **writing-skills** | Membuat skill baru | Struktur skill OpenClaw |

## Prinsip Utama

### Iron Laws
1. **NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST** (TDD)
2. **NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST** (Debugging)
3. **If you think there is even a 1% chance a skill might apply, you ABSOLUTELY MUST invoke it**

### TDD Cycle
```
RED → Write failing test → Verify fails
GREEN → Implement minimal code → Verify passes
REFACTOR → Clean up → Stay green
REPEAT → Next test
```

### Debugging Cycle
```
Phase 1: Root Cause Investigation
  - Read errors carefully
  - Reproduce consistently
  - Check recent changes
  - Trace data flow

Phase 2: Pattern Analysis
  - Find working examples
  - Compare against references
  - Identify differences

Phase 3: Hypothesis & Testing
  - Form single hypothesis
  - Test it
  - Learn & iterate

Phase 4: Fix & Verify
  - Implement fix at root cause
  - Verify with original issue
  - Run all tests
```

## Prioritas Skill

Ketika multiple skills mungkin relevan:

1. **Process skills first** (brainstorming, debugging, writing-plans)
2. **Quality skills second** (TDD, systematic-debugging)
3. **Git/Review skills third** (worktrees, code-review)
4. **Execution skills fourth** (executing-plans, subagent-driven)

Contoh:
- "Let's build X" → brainstorming → using-git-worktrees → writing-plans → executing-plans
- "Fix this bug" → systematic-debugging → TDD
- "Add X" → TDD (sederhana, no plan needed)

## Integration dengan OpenClaw

Skill ini terintegrasi penuh dengan OpenClaw:
- ✅ Automatic triggers pada kata kunci: "build", "create", "implement", "fix", "add"
- ✅ Folder `skills/` berisi 14 sub-skills lengkap
- ✅ Sub-skills trigger otomatis berdasarkan konteks
- ✅ `using-superpowers` sebagai entry point
- ✅ Tools: `brainstorm`, `plan_review`, `get_status`
- ✅ OpenClaw Agent integration untuk subagent-driven-development

## Pengembangan ClawGator

Tim ClawGator menggunakan skill ini untuk:
- 🔨 Membangun fitur-fitur OpenClaw
- 🚀 Mengembangkan platform
- 🔧 Bug fixing dan improvement
- 📝 Perencanaan produk
- 💡 Brainstorming ide-ide baru
- 🔍 Debugging sistematis
- ✅ Testing dengan TDD
- 📊 Code review antar tasks

Skill ini memastikan tim ClawGator selalu:
- **Think before they code**
- **Plan before they build**
- **Verify before they ship**
- **Test before production**

## Struktur Folder

```
/home/clawgator-superpowers/
├── SKILL.md                    - Dokumentasi skill utama
├── openclaw.plugin.json        - Konfigurasi plugin
├── package.json                 - Metadata
├── brainstorming.js              - Core brainstorming function
├── index.js                     - Entry point
├── skills/                       - Sub-skills dari obra/superpowers
│   ├── using-superpowers/       - Skill dasar
│   ├── brainstorming/           - Brainstorming & desain
│   ├── writing-plans/           - Rencana implementasi
│   ├── executing-plans/         - Eksekusi plan
│   ├── test-driven-development/ - TDD workflow
│   ├── systematic-debugging/    - 4-phase debugging
│   ├── using-git-worktrees/     - Git worktrees
│   ├── subagent-driven-development/ - Eksekusi via subagent
│   ├── dispatching-parallel-agents/ - Paralel agents
│   ├── requesting-code-review/  - Review code
│   ├── receiving-code-review/   - Terima feedback
│   ├── verification-before-completion/ - Verify fix
│   ├── finishing-a-development-branch/ - Wrap up
│   └── writing-skills/          - Buat skill baru
└── README.md                     - Dokumentasi lengkap
```

## Penggunaan Dasar

### Memulai Proyek Baru

```
Buat fitur [nama fitur]
```

Skill akan otomatis:
1. Mengaktifkan using-superpowers
2. Brainstorming untuk pahami requirement
3. Buat git worktree baru
4. Tulis implementasi plan
5. Eksekusi dengan TDD
6. Test dan verify

### Fix Bug

```
Fix bug: [deskripsi bug]
```

Skill akan otomatis:
1. Mengaktifkan systematic-debugging
2. Investigasi root cause (4 phases)
3. Implement fix dengan TDD
4. Verify fix
5. Run semua tests

---

**Versi:** 1.0.0
**Dibuat untuk:** Tim ClawGator
**Didasarkan:** obra/superpowers (100% workflow, 14 sub-skills)
**Lisensi:** MIT
