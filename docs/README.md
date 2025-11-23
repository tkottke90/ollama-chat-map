# AI Mind Map Documentation

This directory contains design documents and technical specifications for the AI Mind Map application.

## Documents

### [mind-map-architecture.md](./mind-map-architecture.md)
**Comprehensive architecture design document**

This is the primary design document that outlines the complete architecture for the mind map application. It includes:

- **Core Requirements**: The fundamental goals and user needs
- **System Architecture**: Backend and frontend structure
- **Initialization Flow**: How the application starts up
- **Feature Specifications**: Detailed specs for each feature
  - Hybrid saving system (manual + auto-save)
  - Default mind maps and tutorial system
  - Auto-incremented file naming
  - Error handling and recovery
- **Implementation Phases**: Step-by-step implementation plan
- **Technical Details**: Code structure, functions, and data flow

**Status**: ✅ Approved for Implementation  
**Version**: 1.0  
**Last Updated**: 2024-01-15

---

## Quick Reference

### Key Design Principles

1. **Single Source of Truth**: Backend owns data, frontend displays it
2. **Eager Loading**: Load data during initialization, not on-demand
3. **No Race Conditions**: Eliminate timing issues with clear data flow
4. **Graceful Degradation**: Always fall back to working state
5. **Explicit Persistence**: Save operations are intentional

### Implementation Priority

1. ⭐ **Phase 1**: Core Architecture (HIGHEST PRIORITY)
2. ⭐ **Phase 2**: File Naming (HIGH PRIORITY)
3. ⭐ **Phase 3**: Hybrid Saving (HIGH PRIORITY)
4. 🔵 **Phase 4**: Tutorial System (MEDIUM PRIORITY)
5. 🔵 **Phase 5**: Error Handling (MEDIUM PRIORITY)
6. ⏳ **Phase 6**: LLM Repair (FUTURE)

### Architecture Overview

```
Backend (Rust/Tauri)
  ├─ MindMapManager: Always holds ONE active mind map
  ├─ Eager loading during initialization
  └─ Handles all persistence logic
       ↓
  Tauri Commands
       ↓
Frontend (React/TypeScript)
  ├─ Fetches data from backend on mount
  ├─ Displays mind map
  └─ Sends updates back to backend
```

### Key Features

- **Always Open Mind Map**: Application never has null/undefined state
- **Session Persistence**: Automatically reloads last opened mind map
- **Smart Fallbacks**: Tutorial for new users, empty map for errors
- **Hybrid Saving**: Manual save button + auto-save after 3 seconds
- **Auto File Naming**: `untitled.json`, `untitled_2.json`, etc.
- **Error Recovery**: User-friendly notifications with recovery options
- **Future: LLM Repair**: AI-powered repair of corrupted files

---

## For Developers

### Before Starting Implementation

1. Read [mind-map-architecture.md](./mind-map-architecture.md) completely
2. Understand the initialization flow
3. Review the current system issues (documented in the architecture doc)
4. Follow the implementation phases in order

### During Implementation

1. Implement one phase at a time
2. Test thoroughly after each phase
3. Update this documentation if design changes
4. Keep the architecture document as source of truth

### Testing Checklist

Each phase has specific testing requirements. Key scenarios to test:

- [ ] First-time user (no saved files)
- [ ] Returning user (has saved file)
- [ ] Missing file (state points to non-existent file)
- [ ] Corrupted file (invalid JSON)
- [ ] Multiple new files (naming conflicts)
- [ ] Rename operations
- [ ] Manual save
- [ ] Auto-save
- [ ] Error notifications

---

## Contributing

When making changes to the architecture:

1. Update [mind-map-architecture.md](./mind-map-architecture.md)
2. Increment version number
3. Update "Last Updated" date
4. Document breaking changes
5. Update this README if needed

---

## Questions?

If you have questions about the architecture or implementation:

1. Check the architecture document first
2. Review the technical details section
3. Look at the data flow diagrams
4. Check the glossary for terminology

---

**Last Updated**: 2025-11-21 
**Maintained By**: Development Team

