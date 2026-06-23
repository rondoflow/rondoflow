// Resolves a catalog item's `icon` string to a lucide component. Most catalog
// groups use PascalCase lucide names; skills use kebab-case. We import only the
// icons the catalog actually references (kept in sync by build), so the bundle
// stays lean and the static export is deterministic. Unknown names fall back to
// a neutral glyph.
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  Brain,
  Bug,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Container,
  FileText,
  Gavel,
  GitPullRequest,
  Globe,
  Handshake,
  KeyRound,
  Languages,
  Layers,
  Lightbulb,
  LineChart,
  ListOrdered,
  Megaphone,
  MessageCircleQuestion,
  MessageSquareText,
  Microscope,
  PenLine,
  Pencil,
  Recycle,
  Scale,
  ScanSearch,
  Search,
  Server,
  Share2,
  Sparkles,
  SpellCheck,
  Swords,
  Tag,
  Telescope,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  BadgeCheck,
  BarChart3,
  BookOpen,
  Brain,
  Bug,
  ClipboardCheck,
  Code2,
  Container,
  FileText,
  Gavel,
  GitPullRequest,
  Globe,
  Handshake,
  KeyRound,
  Languages,
  Layers,
  Lightbulb,
  LineChart,
  ListOrdered,
  Megaphone,
  MessageCircleQuestion,
  MessageSquareText,
  Microscope,
  PenLine,
  Recycle,
  Scale,
  ScanSearch,
  Search,
  Server,
  Share2,
  Sparkles,
  SpellCheck,
  Swords,
  Tag,
  Telescope,
  TrendingUp,
  Users,
}

// Skill icons ship as kebab-case; map them to their lucide equivalents.
const ALIASES: Record<string, LucideIcon> = {
  'bar-chart': BarChart3,
  'chart-bar': BarChart3,
  'check-circle': CheckCircle2,
  code: Code2,
  pencil: Pencil,
  search: Search,
  server: Server,
}

export function resolveIcon(name: string | undefined): LucideIcon {
  if (!name) return Sparkles
  return ICONS[name] ?? ALIASES[name] ?? Sparkles
}

export function CatalogIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = resolveIcon(name)
  return <Icon className={className} aria-hidden="true" strokeWidth={1.75} />
}
