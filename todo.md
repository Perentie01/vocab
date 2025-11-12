# Vocabulary PWA - Project TODO

## Core Features
- [x] IndexedDB setup and database schema
- [x] Vocabulary entry form (Chinese/English input)
- [x] Vocabulary list display with search/filter
- [x] Translation integration (API or library)
- [x] Text-to-speech implementation (English, Chinese, Chinese slow)
- [x] Entry edit and delete functionality
- [x] PWA manifest and service worker setup
- [x] Offline functionality with service worker

## UI/UX
- [ ] Home page layout
- [ ] Navigation structure
- [ ] Form validation and error handling
- [ ] Audio player UI for text-to-speech
- [ ] Responsive design for mobile/tablet/desktop
- [ ] Empty state handling

## GitHub Actions & Deployment
- [x] Create GitHub Actions workflow (deploy.yml)
- [x] Configure BASE_PATH for GitHub Pages
- [ ] Test deployment pipeline

## Polish & Testing
- [x] Fix IndexedDB connection closing error
- [ ] Test IndexedDB operations
- [ ] Test text-to-speech across browsers
- [ ] Test PWA installation
- [ ] Cross-browser compatibility check
- [ ] Performance optimization

## Bug Fixes
- [x] Fix pnpm lockfile configuration mismatch in GitHub Actions
- [x] Redesign translation UI with separate language buttons
- [x] Add reverse direction button for translation
- [x] Simplify form to accept pasted text with edit preview

## Theming & Branding
- [x] Update app title to "Vox"
- [x] Create rusty red color theme with complementary colors
- [x] Generate Vox logo and app icons
- [x] Apply theme to UI components
