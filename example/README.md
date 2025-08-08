# ZBD Ramp React Native Example

This is a complete React Native example app demonstrating how to integrate the `@zbdpay/ramp-react-native` package for Bitcoin Lightning Network payments.

## Features

- **Session Token Configuration**: Enter your session token to test payments
- **Environment Selection**: Switch between Production, X1, X2, and Voltorb sandbox environments  
- **Debug Logging**: Real-time logging of widget events and WebView interactions
- **Full Widget Integration**: Complete payment flow with success/error handling
- **Responsive UI**: Clean, modern interface with proper React Native styling

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **iOS Setup** (if testing on iOS):
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android Setup** (if testing on Android):
   - Make sure Android SDK and emulator are set up
   - The project includes pre-configured Android files

4. **Get Session Token**:
   
   Create a session token using the ZBD API:
   ```bash
   curl -X POST https://api.zbdpay.com/v1/ramp-widget \
     -H "apikey: YOUR_ZBD_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "user@example.com",
       "destination": "lightning-address-or-username",
       "quote_currency": "USD", 
       "base_currency": "BTC",
       "webhook_url": "https://your-webhook-url.com"
     }'
   ```

## Running the App

### iOS
```bash
npm run ios
```

### Android
```bash
npm run android
```

### Start Metro Bundler
```bash
npm start
```

## Usage

1. **Enter Session Token**: Paste your session token from the ZBD API
2. **Select Environment**: Choose between production or sandbox environments
3. **Enable Debug Logging**: Toggle to see detailed logs of widget interactions
4. **Start Payment**: Tap to open the ZBD Ramp widget
5. **Complete Payment**: Follow the payment flow in the widget
6. **View Results**: Success/error results will be displayed with alerts and logged

## Code Structure

- `App.tsx` - Main application component with:
  - Session token input and environment selection
  - ZBDRamp widget integration
  - Comprehensive event handling (success, error, logging)
  - Debug logging interface
  - Responsive UI design

## Key Features Demonstrated

### Widget Integration
```tsx
<ZBDRamp
  sessionToken={sessionToken}
  environment={environment}
  onSuccess={handleSuccess}
  onError={handleError}
  onStepChange={handleStepChange}
  onLog={handleLog}
  onReady={handleReady}
  onClose={handleClose}
  style={styles.webview}
/>
```

### Event Handling
- **onSuccess**: Payment completion with transaction data
- **onError**: Error handling with detailed error codes
- **onStepChange**: User navigation tracking
- **onLog**: Debug logging for development
- **onReady**: Widget load completion
- **onClose**: User-initiated widget closure

### Environment Management
- Production: `EnvironmentEnum.Production`
- Sandbox X1: `EnvironmentEnum.X1`
- Sandbox X2: `EnvironmentEnum.X2`
- Sandbox Voltorb: `EnvironmentEnum.Voltorb`

## Debugging

The example includes comprehensive logging to help with development:

- WebView load events
- Widget lifecycle events
- Payment flow steps
- Error conditions
- Success responses

Enable "Debug Logging" in the app to see real-time events in the logs section.

## Project Dependencies

- **@zbdpay/ramp-react-native**: ZBD Ramp widget integration
- **react-native-webview**: Required for widget rendering
- **react-native**: React Native framework

## Notes

- This example uses local dependency `"@zbdpay/ramp-react-native": "../"` for development
- For production apps, install from npm: `npm install @zbdpay/ramp-react-native`
- Session tokens are temporary and need to be generated for each payment session
- Always test in sandbox environments before using production