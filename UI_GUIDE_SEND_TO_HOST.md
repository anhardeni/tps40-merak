# UI Guide: Send to Host with Format Selection

## Location
**Page:** Document Detail (`/documents/{id}`)
**Position:** Top-right corner, after Preview/Download buttons

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Kembali   Document TPSO251031000001                                      │
│              [Disetujui] Dibuat 27 Oct 2025 14:30                           │
│                                                                              │
│  [Edit] [Submit] [Preview XML] [Download XML] [Preview JSON] [Download JSON]│
│                                                                              │
│  │ [Format XML ▼]  [Send to Host]                                          │
│  └─ Format selector  └─ Transmission button                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Format Selector (Select Dropdown)
```
┌─────────────────┐
│ Format XML   ▼  │
└─────────────────┘
```

**Opened State:**
```
┌─────────────────┐
│ Format XML   ▼  │
├─────────────────┤
│ Format XML      │ ← Selected
│ Format JSON     │
└─────────────────┘
```

**Props:**
- Width: 110px
- Default: "xml"
- Options: "Format XML", "Format JSON"
- onChange: Updates state immediately

### 2. Send to Host Button

**Normal State:**
```
┌──────────────────────┐
│ ↑ Send to Host       │ ← Blue background
└──────────────────────┘
```

**Loading State:**
```
┌──────────────────────┐
│ ↑ Mengirim...        │ ← Disabled, blue background
└──────────────────────┘
```

**Props:**
- Color: `bg-blue-600 hover:bg-blue-700`
- Icon: Upload (lucide-react)
- Disabled: When `isSending === true`
- onClick: Triggers `handleSendToHost()`

### 3. Confirmation Dialog

When button is clicked:
```
┌─────────────────────────────────────────────┐
│  Kirim dokumen ke host dalam format JSON?   │
│                                              │
│            [Cancel]    [OK]                  │
└─────────────────────────────────────────────┘
```

## Visibility Rules

### Show Send to Host Section When:
✅ Document status is `approved`
✅ User has `admin` role OR `export.json` permission

### Hide Send to Host Section When:
❌ Document status is `draft`, `submitted`, or `rejected`
❌ User doesn't have required permissions

## User Flow

### Scenario 1: Send as JSON
1. User navigates to approved document detail page
2. User sees "Send to Host" section (after JSON buttons)
3. User clicks dropdown → Selects **"Format JSON"**
4. User clicks **"Send to Host"** button
5. Confirmation dialog appears: "Kirim dokumen ke host dalam format JSON?"
6. User clicks **OK**
7. Button changes to "Mengirim..." (disabled)
8. Request sent to `/api/export/documents/{id}/send-to-host` with `format: "json"`
9. On success: Document reloads, button returns to normal
10. On error: Button returns to normal, error logged to console

### Scenario 2: Send as XML (Default)
1. User navigates to approved document detail page
2. User sees "Send to Host" section with **"Format XML"** pre-selected
3. User clicks **"Send to Host"** button directly (no format change)
4. Confirmation dialog appears: "Kirim dokumen ke host dalam format XML?"
5. User clicks **OK**
6. (Same flow as JSON from step 7 onwards)

## Button Positioning

### Full Action Bar Layout:
```
[Edit] [Submit]          ← Only for draft documents
[Preview XML] [Download XML] [Preview JSON] [Download JSON]  ← Always visible (with permissions)
│ [Format Selector] [Send to Host]                           ← Only for approved documents
```

**Visual Separator:**
- Vertical border line (`border-l`) between download buttons and send section
- Padding left (`pl-2`) for spacing
- Margin left (`ml-2`) for visual separation

## Code Structure

### Component State
```tsx
const [transmissionFormat, setTransmissionFormat] = useState<'xml' | 'json'>('xml')
const [isSending, setIsSending] = useState(false)
```

### Event Handler
```tsx
const handleSendToHost = () => {
  // 1. Show confirmation
  if (confirm(`Kirim dokumen ke host dalam format ${transmissionFormat.toUpperCase()}?`)) {
    
    // 2. Set loading state
    setIsSending(true)
    
    // 3. Make POST request
    router.post(`/api/export/documents/${document.id}/send-to-host`, {
      format: transmissionFormat  // "xml" or "json"
    }, {
      // 4. Handle success
      onSuccess: () => {
        setIsSending(false)
        router.reload({ only: ['document'] })
      },
      
      // 5. Handle error
      onError: (errors) => {
        setIsSending(false)
        console.error('Send to host error:', errors)
      }
    })
  }
}
```

## Styling Details

### Format Selector
- **Width:** `w-[110px]` (fixed width for consistency)
- **Height:** Standard select height (h-10)
- **Border:** Default select border
- **Background:** White (`bg-white`)

### Send to Host Button
- **Color:** Blue primary (`bg-blue-600`)
- **Hover:** Darker blue (`hover:bg-blue-700`)
- **Padding:** Standard button padding
- **Icon Size:** `w-4 h-4` (16px)
- **Icon Margin:** `mr-2` (spacing between icon and text)

### Container
- **Layout:** Flexbox (`flex items-center gap-2`)
- **Gap:** 0.5rem (8px) between dropdown and button
- **Border:** Left border (`border-l`) for separation
- **Padding:** `pl-2` left padding after border
- **Margin:** `ml-2` left margin before container

## Responsive Behavior

### Desktop (> 768px)
- All buttons visible in single row
- Format selector + button side-by-side

### Mobile (< 768px)
- Buttons may wrap to multiple rows
- Format selector remains 110px width
- Send button adjusts to available space

## Accessibility

### Keyboard Navigation
✅ Tab to format selector → Opens dropdown with arrow keys
✅ Tab to Send button → Press Enter/Space to trigger
✅ Dialog can be confirmed/cancelled with keyboard

### Screen Readers
✅ Select has implicit label from SelectValue
✅ Button has descriptive text ("Send to Host" / "Mengirim...")
✅ Icon is decorative (aria-hidden implied)

### Focus States
✅ Select dropdown shows focus ring
✅ Button shows focus ring
✅ Dialog buttons focusable

## Error Handling

### Client-Side
- Button disabled during transmission (prevents double-click)
- Console.error logs failure details
- Loading state prevents UI confusion

### Server-Side
- Format validation (must be "xml" or "json")
- Document status check (must be "approved")
- Permission check (must have export.json)
- Error responses with descriptive messages

## Integration Points

### API Endpoint
**URL:** `POST /api/export/documents/{id}/send-to-host`

**Request:**
```json
{
  "format": "json"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Document sent to host successfully",
  "data": {...}
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid format. Allowed: xml, json"
}
```

### Backend Service
- **XmlJsonGeneratorService:** Generates content in requested format
- **ExportController:** Validates format, sends to host, logs result

### Database
- **documents.host_response:** Stores transmission metadata including format
- **documents.sent_to_host:** Boolean flag (true after first successful send)

## Testing Checklist

### Functional Tests
- [ ] Format selector shows both options (XML, JSON)
- [ ] Default format is XML
- [ ] Format change updates state immediately
- [ ] Send button triggers confirmation dialog
- [ ] Cancel in dialog does nothing
- [ ] OK in dialog starts transmission
- [ ] Button shows "Mengirim..." during transmission
- [ ] Button is disabled during transmission
- [ ] Success reloads document data
- [ ] Error logs to console and re-enables button

### Permission Tests
- [ ] Section visible for admin users (approved docs)
- [ ] Section visible for users with export.json permission
- [ ] Section hidden for users without permission
- [ ] Section hidden for non-approved documents

### Edge Cases
- [ ] Rapid clicking doesn't send multiple requests
- [ ] Page refresh during transmission doesn't cause issues
- [ ] Network error handled gracefully
- [ ] Invalid format rejected by server
- [ ] Already-sent document can be re-sent

## Benefits Summary

### User Experience
✅ Clear format selection with dropdown
✅ Visual separation from download buttons
✅ Confirmation before transmission
✅ Loading state feedback
✅ Error handling

### Developer Experience
✅ Clean component structure
✅ Type-safe state management
✅ Proper error handling
✅ Console logging for debugging
✅ Inertia.js integration

### Business Value
✅ Modern API compatibility (JSON)
✅ Legacy system support (XML)
✅ User choice flexibility
✅ Audit trail (format tracked)
✅ Permission-based access control
