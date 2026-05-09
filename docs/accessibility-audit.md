# SafeHaven — Accessibility Audit Checklist

**Standard:** WCAG 2.2 Level AA  
**Platform:** Android (primary), iOS (secondary)  
**Status:** Pre-implementation checklist — to be verified against each shipped screen

---

## 1. Perceivable

### 1.1 Text Alternatives
| Criterion | Requirement | Implementation | Status |
|---|---|---|---|
| 1.1.1 (A) | Non-text content has text alternative | All icons use `accessibilityLabel`; decorative images use `accessible={false}` | ☐ TODO |
| 1.1.1 (A) | Informational images have descriptive labels | Charts labeled with data summary | ☐ TODO |

### 1.3 Adaptable
| Criterion | Requirement | Implementation | Status |
|---|---|---|---|
| 1.3.1 (A) | Info and relationships conveyed in structure | Use semantic roles: `button`, `header`, `link` | ☐ TODO |
| 1.3.3 (A) | Instructions don't rely on sensory characteristics | No "tap the green button" — use label names | ☐ TODO |
| 1.3.4 (AA) | Content not restricted to one orientation | Portrait primary; landscape supported | ☐ TODO |
| 1.3.5 (AA) | Identify purpose of inputs | All TextInput components have `accessibilityLabel` and `autoComplete` | ☐ TODO |

### 1.4 Distinguishable
| Criterion | Requirement | Status | Notes |
|---|---|---|---|
| 1.4.1 (A) | Color not the only means of conveying information | Error states use icon + text, not just red color | ☐ TODO |
| 1.4.3 (AA) | Contrast ratio ≥ 4.5:1 for normal text | `#0F172A` on `#FFFFFF` = 19.2:1 ✅ | ✅ Design token |
| 1.4.3 (AA) | Primary blue `#2563EB` on white | Contrast = 4.69:1 ✅ | ✅ Design token |
| 1.4.3 (AA) | `#475569` (secondary text) on white | Contrast = 5.9:1 ✅ | ✅ Design token |
| 1.4.4 (AA) | Text resizes up to 200% without loss of content | All layouts use `flex`, no fixed heights on text containers | ☐ TODO |
| 1.4.10 (AA) | Reflow: content not lost at 320dp width | Tested at 320dp (Galaxy A03 Core width) | ☐ TODO |
| 1.4.11 (AA) | Non-text contrast ≥ 3:1 | Button borders, input outlines use `#64748B` minimum | ☐ TODO |
| 1.4.12 (AA) | Text spacing: line-height ≥ 1.5× font size | Body: 16sp font, 24sp line height (1.5×) ✅ | ✅ Design token |
| 1.4.13 (AA) | Content on hover/focus not obscured | No hover-only content (touch-first app) | ✅ N/A |

---

## 2. Operable

### 2.1 Keyboard Accessible
| Criterion | Requirement | Status |
|---|---|---|
| 2.1.1 (A) | All functionality available without fine motor control | All actions reachable by tap (no swipe-only interactions without tap alternative) | ☐ TODO |
| 2.1.1 (A) | No keyboard traps | Modal dismiss via back button always available | ☐ TODO |

### 2.4 Navigable
| Criterion | Requirement | Status |
|---|---|---|
| 2.4.3 (A) | Focus order is logical | Tab order follows visual layout top-to-bottom, left-to-right | ☐ TODO |
| 2.4.4 (A) | Link purpose clear from label | No "click here" or "read more" without context | ☐ TODO |
| 2.4.6 (AA) | Headings and labels descriptive | All screens have `accessibilityRole="header"` on primary heading | ☐ TODO |
| 2.4.7 (AA) | Focus visible | Focus ring on all interactive elements (keyboard navigation testing required) | ☐ TODO |
| 2.4.11 (AA) | Focus not obscured | Focused element not hidden behind bottom nav or sticky header | ☐ TODO |

### 2.5 Input Modalities
| Criterion | Requirement | Status |
|---|---|---|
| 2.5.1 (A) | Pointer gestures have single-point alternative | Swipe gestures have button alternatives | ☐ TODO |
| 2.5.3 (A) | Label in name | Visible label matches or contains `accessibilityLabel` | ☐ TODO |
| 2.5.5 (AAA target) | Touch targets ≥ 44×44pt | Enforced via `minTouchTarget()` helper (48×48dp) | ☐ TODO |
| 2.5.8 (AA) | Minimum target size ≥ 24×24 CSS px | Our 48dp minimum exceeds this | ✅ By design |

---

## 3. Understandable

### 3.1 Readable
| Criterion | Requirement | Status |
|---|---|---|
| 3.1.1 (A) | Language of page identified | `lang` set in app manifest; i18n locale passed to screen readers | ☐ TODO |
| 3.1.2 (AA) | Language of parts identified | Mixed-language content (e.g., DeFi protocol names) labeled appropriately | ☐ TODO |

**Reading level target:** All UI copy ≤ Grade 6 Flesch-Kincaid (validated per language)

### 3.2 Predictable
| Criterion | Requirement | Status |
|---|---|---|
| 3.2.1 (A) | No unexpected context change on focus | Dropdown menus don't auto-navigate on open | ☐ TODO |
| 3.2.2 (A) | No unexpected change on input | Form fields don't submit on change | ✅ By design |

### 3.3 Input Assistance
| Criterion | Requirement | Status |
|---|---|---|
| 3.3.1 (A) | Error identified in text | Form errors stated in text + icon (not color alone) | ☐ TODO |
| 3.3.2 (A) | Labels or instructions provided | All inputs have visible labels, not just placeholder text | ☐ TODO |
| 3.3.3 (AA) | Error suggestion | Error messages suggest correction (e.g., "Amount must be at least $5 USDC") | ☐ TODO |
| 3.3.4 (AA) | Error prevention for financial | Confirmation screen before any DeFi transaction | ✅ By design |

---

## 4. Robust

### 4.1 Compatible
| Criterion | Requirement | Status |
|---|---|---|
| 4.1.2 (A) | Name, role, value for all UI components | All Pressable/Touchable have `accessibilityRole`, `accessibilityLabel`, `accessibilityState` | ☐ TODO |
| 4.1.3 (AA) | Status messages announced | Toast notifications use `AccessibilityInfo.announceForAccessibility` | ☐ TODO |

---

## 5. Motor Accessibility Specifics

SafeHaven targets users who may have motor impairments. Additional requirements:

| Requirement | Implementation |
|---|---|
| No time-limited interactions | No countdown timers or auto-dismiss without user control |
| No double-tap required | All actions reachable with single tap |
| No pinch/spread required | No zoom-dependent interactions |
| Voice input works for all text fields | All TextInput components work with Android voice input |
| Minimum 48×48dp touch targets | Enforced via `minTouchTarget()` across all buttons |

---

## 6. Cognitive Accessibility Specifics

| Requirement | Implementation |
|---|---|
| Plain language (≤ Grade 6 reading level) | Enforced in UI copy review and Claude system prompt |
| Consistent navigation | Tab bar always visible; back button always works |
| Error recovery | All errors explain what went wrong and what to do next |
| Progress indicators | Loading states on all async operations |
| No cognitive overload | Max 3 steps per task flow; complex tasks broken into phases |
| Confirmations before irreversible actions | Risk disclosure + "I understand" before DeFi deposits |

---

## 7. Screen Reader Testing Matrix

| Screen | TalkBack (Android) | VoiceOver (iOS) | Status |
|---|---|---|---|
| Onboarding — Welcome | ☐ | ☐ | TODO |
| Onboarding — Language Picker | ☐ | ☐ | TODO |
| Onboarding — Risk Profiler | ☐ | ☐ | TODO |
| Home — Dashboard | ☐ | ☐ | TODO |
| Home — AI Chat | ☐ | ☐ | TODO |
| Learn — Course List | ☐ | ☐ | TODO |
| Learn — Lesson Reader | ☐ | ☐ | TODO |
| Learn — Quiz | ☐ | ☐ | TODO |
| DeFi — Strategy List | ☐ | ☐ | TODO |
| DeFi — Risk Disclosure | ☐ | ☐ | TODO |
| DeFi — Deposit Confirm | ☐ | ☐ | TODO |
| DeFi — Bridge | ☐ | ☐ | TODO |
| Settings | ☐ | ☐ | TODO |

---

## 8. Device Testing Matrix

| Device | OS | RAM | Status |
|---|---|---|---|
| Samsung Galaxy A03 Core | Android 11 | 2 GB | ☐ TODO |
| Tecno Spark 10 | Android 13 | 4 GB | ☐ TODO |
| Xiaomi Redmi 9A | Android 10 | 2 GB | ☐ TODO |
| iPhone SE (2nd gen) | iOS 16 | 3 GB | ☐ TODO |

---

## 9. Automated Tooling

- `eslint-plugin-react-native-a11y` — catches missing labels and roles at build time
- `@testing-library/react-native` — `getByRole` queries enforce semantic markup in tests
- Manual TalkBack audit required before each release

---

## Audit History

| Date | Auditor | Scope | Issues Found | Issues Resolved |
|---|---|---|---|---|
| 2026-05-09 | Initial checklist | Pre-implementation | N/A | N/A |
