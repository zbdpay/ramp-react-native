# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.5] - 2025-09-18
### Chore
- Improve error response

## [1.0.4] - 2025-09-11
### Updated
- Using latest ramp-ts with access token authentication support for `initRampSession` and `refreshAccessToken` method for token refresh functionality

## [1.0.3] - 2025-09-05
### Chore
- upgrade ramp-ts

## [1.0.2] - 2025-08-18
### Added
- permissions setup for ios

## [1.0.1] - 2025-08-18
### Added
- permissions setup for android

### Chore
- use WidgetPostMessageEnum


## [1.0.0] - 2024-08-08

### Added
- Initial release
- React Native wrapper component using WebView
- `ZBDRamp` component with ref API
- `useZBDRamp` hook for programmatic usage
- Cross-platform support (iOS and Android)
- PostMessage communication with WebView
- Full TypeScript support
- WebView props customization
