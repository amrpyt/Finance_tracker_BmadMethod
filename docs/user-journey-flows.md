# 🎯 User Journey Flows - AI Personal Finance Tracker

| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-09-23 | 1.0 | Initial user journey documentation addressing PM checklist UX gaps | BMad Master |

## Overview

This document provides comprehensive user journey flows for the AI Personal Finance Tracker, addressing the UX requirements identified in the PM checklist validation. It covers primary use cases, decision points, error scenarios, and recovery paths to ensure seamless user experience implementation.

## Primary User Personas

**Primary User**: **Financial Tracker** 
- Wants simple, quick expense logging
- Prefers minimal manual data entry
- Values accuracy and categorization
- Uses mobile/web interface interchangeably

## Core User Journey Flows

---

## 🚀 **Flow 1: Quick Transaction Entry (Text Input)**

### Happy Path - Successful AI Extraction

```mermaid
graph TD
    A[User lands on Dashboard] --> B[Clicks text input field]
    B --> C[Types: "50 EGP lunch at McDonald's"]
    C --> D[Clicks Send/Submit]
    D --> E[System sends to LLM API]
    E --> F[AI extracts: Amount=50, Currency=EGP, Category=Food, Description=lunch at McDonald's]
    F --> G[Confirmation modal appears with extracted data]
    G --> H{User reviews data}
    H --> I[User clicks 'Confirm']
    I --> J[Select account dropdown appears]
    J --> K[User selects 'Cash' account]
    K --> L[Transaction saved to database]
    L --> M[Success notification shown]
    M --> N[Dashboard updates with new transaction]
    N --> O[User sees updated balance]
```

### Decision Points & User Actions:
1. **Text Input Decision**: User chooses text over voice/image
2. **Confirmation Review**: User validates AI extraction accuracy
3. **Account Selection**: User assigns transaction to specific account
4. **Final Confirmation**: User commits transaction to database

### Key UX Requirements:
- ✅ Input field prominently displayed on dashboard
- ✅ Real-time typing feedback (character count, formatting hints)
- ✅ Loading indicator during AI processing
- ✅ Clear confirmation modal with editable fields
- ✅ Account selection with visual balance indicators

---

## 🎤 **Flow 2: Voice Transaction Entry**

### Happy Path - Voice to Transaction

```mermaid
graph TD
    A[User lands on Dashboard] --> B[Clicks microphone icon]
    B --> C[Recording permission requested]
    C --> D[User grants permission]
    D --> E[Recording interface appears with waveform]
    E --> F[User speaks: 'I spent twenty five dollars on groceries at Walmart']
    F --> G[User clicks stop recording]
    G --> H[Audio sent to STT API]
    H --> I[STT returns: 'I spent twenty five dollars on groceries at Walmart']
    I --> J[Text sent to LLM API]
    J --> K[AI extracts: Amount=25, Currency=USD, Category=Groceries, Description=groceries at Walmart]
    K --> L[Same confirmation flow as text input]
```

### Voice-Specific UX Requirements:
- ✅ Clear recording permissions flow
- ✅ Visual recording feedback (waveform, timer)
- ✅ Ability to re-record if transcription is wrong
- ✅ Audio playback option for verification
- ✅ Fallback to text input if voice fails

---

## 📸 **Flow 3: Receipt Image Upload**

### Happy Path - Image to Transaction

```mermaid
graph TD
    A[User lands on Dashboard] --> B[Clicks camera/upload icon]
    B --> C{Device capabilities}
    C --> D[Camera interface] 
    C --> E[File upload dialog]
    D --> F[User takes receipt photo]
    E --> F[User selects receipt image]
    F --> G[Image preview with crop/rotate options]
    G --> H[User confirms image quality]
    H --> I[Image sent to OCR API]
    I --> J[OCR extracts text from receipt]
    J --> K[Extracted text sent to LLM API]
    K --> L[AI extracts structured transaction data]
    L --> M[Confirmation modal with all receipt items]
    M --> N{Multiple items detected?}
    N --> O[User selects which items to import]
    N --> P[Single transaction flow]
    O --> Q[Multiple transactions created]
```

### Image-Specific UX Requirements:
- ✅ Camera permissions and fallback options
- ✅ Image quality guidance (lighting, angle, focus)
- ✅ Crop/rotate tools for receipt optimization
- ✅ Multiple transaction handling from single receipt
- ✅ Receipt text preview before AI processing

---

## ⚠️ **Error Scenarios & Recovery Paths**

### AI Extraction Failures - Recovery Flows

#### **Scenario 1: Low Confidence AI Extraction**

```mermaid
graph TD
    A[AI confidence < 70%] --> B[Warning modal appears]
    B --> C['AI extraction uncertain - please review carefully']
    C --> D[Highlighted uncertain fields in red]
    D --> E{User action}
    E --> F[User corrects fields manually]
    E --> G[User clicks 'Re-process with AI']
    E --> H[User switches to manual entry]
    F --> I[Manual correction flow]
    G --> J[Re-send to LLM with additional context]
    H --> K[Full manual transaction form]
```

#### **Scenario 2: Complete AI Service Failure**

```mermaid
graph TD
    A[AI API unavailable] --> B[Error notification appears]
    B --> C['AI service temporarily unavailable']
    C --> D[Automatic fallback to manual entry]
    D --> E[Pre-filled form with original input]
    E --> F[User completes transaction manually]
    F --> G[Option to 'Retry AI processing later']
```

#### **Scenario 3: Ambiguous Input Detection**

```mermaid
graph TD
    A[AI detects multiple possible interpretations] --> B[Disambiguation modal]
    B --> C[Show 2-3 possible interpretations]
    C --> D{User selection}
    D --> E[User picks interpretation A]
    D --> F[User picks interpretation B]
    D --> G[User chooses 'None - I'll enter manually']
    E --> H[Proceed with selected interpretation]
    F --> H
    G --> I[Manual entry form]
```

### Error Recovery UX Requirements:
- ✅ Clear error messaging with actionable next steps
- ✅ Preserve user input during errors (no data loss)
- ✅ Multiple recovery options (retry, manual, modify)
- ✅ Learn from user corrections to improve AI accuracy
- ✅ Offline mode for manual entry when services unavailable

---

## 🏦 **Flow 4: Account Management Journey**

### Account Selection During Transaction

```mermaid
graph TD
    A[Transaction confirmation modal] --> B[Account dropdown appears]
    B --> C{Accounts available?}
    C --> D[Show existing accounts with balances]
    C --> E[Show 'Create first account' prompt]
    D --> F{User action}
    F --> G[Select existing account]
    F --> H[Click 'Add new account']
    E --> H
    G --> I[Transaction assigned to account]
    H --> J[Quick account creation modal]
    J --> K[Enter account name and type]
    K --> L[Account created and selected]
    I --> M[Transaction saved]
    L --> M
```

### Account Management UX Requirements:
- ✅ Account balances visible during selection
- ✅ Quick account creation without leaving transaction flow
- ✅ Account type icons and color coding
- ✅ Default account suggestion based on transaction category
- ✅ Recent account priority in dropdown

---

## 🔄 **Flow 5: Transaction Correction & Editing**

### Post-Transaction Correction Flow

```mermaid
graph TD
    A[User notices incorrect transaction] --> B[Clicks on transaction in dashboard/list]
    B --> C[Transaction detail modal opens]
    C --> D{Edit or delete?}
    D --> E[Click 'Edit transaction']
    D --> F[Click 'Delete transaction']
    E --> G[Editable form with current values]
    G --> H[User makes corrections]
    H --> I[Clicks 'Save changes']
    I --> J[Validation and confirmation]
    J --> K[Transaction updated]
    K --> L[Balance recalculated]
    F --> M[Delete confirmation modal]
    M --> N['This will permanently delete the transaction']
    N --> O{User confirms?}
    O --> P[Transaction deleted]
    O --> Q[Cancel - return to detail view]
```

### Correction Flow UX Requirements:
- ✅ Easy access to edit any transaction
- ✅ Clear change highlighting and confirmation
- ✅ Automatic balance recalculation
- ✅ Change history/audit trail (future enhancement)
- ✅ Bulk edit capabilities for similar transactions

---

## 📊 **Flow 6: Dashboard Overview & Navigation**

### Dashboard Landing Experience

```mermaid
graph TD
    A[User logs in] --> B[Dashboard loads]
    B --> C[Total balance card displays]
    C --> D[Individual account cards show]
    D --> E[Recent transactions list appears]
    E --> F[Quick action buttons visible]
    F --> G{User intent}
    G --> H[Add transaction - text input]
    G --> I[Add transaction - voice input]
    G --> J[Add transaction - image upload]
    G --> K[View all transactions]
    G --> L[Manage accounts]
    G --> M[View analytics/charts]
```

### Dashboard UX Requirements:
- ✅ Clear financial overview at first glance
- ✅ Quick access to all input methods
- ✅ Recent activity for immediate context
- ✅ Progressive disclosure of advanced features
- ✅ Responsive design for mobile/desktop usage

---

## 🌍 **Flow 7: Multi-Language Support**

### Language Selection & Content Flow

```mermaid
graph TD
    A[User accesses app] --> B{Language preference set?}
    B --> C[Use saved preference]
    B --> D[Language selection screen]
    D --> E[User selects Arabic/English]
    E --> F[Interface updates immediately]
    F --> G[All content reflects language choice]
    G --> H{Voice input selected?}
    H --> I[STT API uses selected language]
    H --> J[Continue with other inputs]
    I --> K[AI processing considers language context]
```

### Multi-Language UX Requirements:
- ✅ Seamless language switching without data loss
- ✅ RTL/LTR layout adaptation for Arabic
- ✅ Currency and number format localization
- ✅ Voice recognition language matching
- ✅ Mixed language transaction support

---

## 🎯 **Critical Decision Points Summary**

### User Decision Matrix

| Decision Point | Options | Default Behavior | Recovery Actions |
|---|---|---|---|
| **Input Method** | Text, Voice, Image | Text (most prominent) | Switch methods anytime |
| **AI Confidence** | Accept, Modify, Manual | Auto-accept if >90% | Review mode if <90% |
| **Account Selection** | Existing, Create New | Most recent account | Quick creation modal |
| **Error Handling** | Retry, Manual, Skip | Auto-retry once | Clear error messaging |
| **Language Context** | Arabic, English, Mixed | User's browser locale | Manual override available |

---

## 📋 **Implementation Priority**

### Phase 1 - MVP (Current Epic 2-4 Scope)
- ✅ Text input transaction flow
- ✅ Basic error handling and manual fallback
- ✅ Account selection during transaction
- ✅ Transaction confirmation and editing

### Phase 2 - AI Enhancement (Epic 3)
- ✅ Voice input flow with STT integration
- ✅ Image upload flow with OCR processing
- ✅ AI confidence handling and disambiguation
- ✅ Multi-modal input switching

### Phase 3 - Advanced UX (Future Enhancements)
- 🔄 Bulk transaction operations
- 🔄 Smart categorization learning
- 🔄 Offline mode and sync
- 🔄 Advanced analytics navigation

---

## 🔍 **UX Validation Checklist**

### Must-Have UX Elements:
- [ ] Clear visual feedback for all user actions
- [ ] Loading states for all async operations
- [ ] Error messages with actionable next steps
- [ ] Consistent navigation patterns across flows
- [ ] Mobile-first responsive design
- [ ] Accessibility compliance (WCAG 2.1)
- [ ] Performance optimization for AI processing delays

### Success Metrics:
- **Task Completion Rate**: >95% for primary transaction flows
- **Error Recovery Rate**: >90% of users successfully recover from AI failures
- **Time to Transaction**: <30 seconds from input to saved transaction
- **User Satisfaction**: >4.5/5 rating for ease of use

---

## 📝 **Next Steps for Implementation**

1. **Create wireframes** for each critical decision point identified
2. **Design confirmation modals** with proper field validation
3. **Implement progressive error handling** with clear recovery paths
4. **Build responsive components** supporting all identified flows
5. **Test multi-language support** with actual Arabic/English content

---

**Document Status**: ✅ **COMPLETE** - Addresses PM Checklist UX requirements gap  
**Integration**: Ready for architecture phase and Epic 2-4 implementation  
**Review**: Periodic updates based on user testing feedback
