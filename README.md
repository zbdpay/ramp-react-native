# @zbdpay/ramp-react-native

React Native wrapper for ZBD Ramp widget that enables Bitcoin Lightning Network payments in React Native applications.

## Features

- ✅ **React Native Optimized**: Built specifically for React Native with WebView
- ✅ **TypeScript Support**: Full type safety with comprehensive TypeScript definitions
- ✅ **Cross-Platform**: Works on iOS and Android
- ✅ **Ref API**: Access to WebView methods and ramp instance
- ✅ **Hook Support**: `useZBDRamp` hook for programmatic usage
- ✅ **Environment Support**: Production and sandbox environments (x1, x2, voltorb)

## Installation

```bash
npm install @zbdpay/ramp-react-native react-native-webview
# or
yarn add @zbdpay/ramp-react-native react-native-webview
```

### iOS Setup

```bash
cd ios && pod install
```

## Quick Start for Development

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd ramp-iframe/ramp-react-native

# Install package dependencies (for the wrapper package)
npm install

# Navigate to example React Native app
cd example

# Install example app dependencies
npm install

# For iOS - install pods
cd ios && pod install && cd ..
```

### 2. Run Example App

The repository includes a complete React Native example app in the `example/` folder:

```bash
# Navigate to example app
cd example

# Install example dependencies
npm install

# For iOS - install pods
cd ios && pod install && cd ..

# Start Metro bundler (in separate terminal)
npm start

# iOS (in another terminal)
npm run ios

# Android (in another terminal)
npm run android
```

The example app provides:
- **Session Token Creation**: Built-in API integration to create session tokens
- **Environment Selection**: Switch between Production, X1, X2, and Voltorb environments
- **Debug Logging**: Real-time logging of widget events and interactions  
- **Full Integration**: Complete ZBDRamp component with all event handlers
- **Error Handling**: Comprehensive error display and logging

### 3. Alternative: Create Your Own App

To integrate ZBD Ramp into your existing React Native app:

```bash
# Install the package
npm install @zbdpay/ramp-react-native react-native-webview

# For iOS - install pods
cd ios && pod install && cd ..
```

Then import and use in your app:

```tsx
import { ZBDRamp, EnvironmentEnum } from '@zbdpay/ramp-react-native';

<ZBDRamp
  sessionToken="your-session-token"
  environment={EnvironmentEnum.Production}
  onSuccess={(data) => console.log('Success:', data)}
  onError={(error) => console.error('Error:', error)}
  style={{ flex: 1 }}
/>
```

## Quick Start

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ZBDRamp, EnvironmentEnum } from '@zbdpay/ramp-react-native';

function App() {
  return (
    <View style={styles.container}>
      <ZBDRamp
        sessionToken="your-session-token"
        environment={EnvironmentEnum.Production}
        onSuccess={(data) => console.log('Success:', data)}
        onError={(error) => console.error('Error:', error)}
        onStepChange={(step) => console.log('Step:', step)}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
```

### Debug and Development

Enable debugging by adding logging callbacks and WebView event handlers:

```tsx
import { EnvironmentEnum } from '@zbdpay/ramp-react-native';

<ZBDRamp
  sessionToken="your-session-token"
  environment={EnvironmentEnum.X1}
  onLog={(log) => {
    console.log(`[${log.level.toUpperCase()}] ${log.message}`, log.data);
  }}
  webViewProps={{
    // Enable debugging
    onLoadStart={() => console.log('WebView load started')}
    onLoadEnd={() => console.log('WebView load ended')}
    onError={(error) => console.error('WebView error:', error)}
  }}
/>
```

## API Reference

### ZBDRamp Component

React Native component that renders the ZBD Ramp widget using WebView.

#### Props

```tsx
interface ZBDRampProps {
  sessionToken: string;                      // Required: Session token from ZBD API
  environment?: EnvironmentEnum;             // Default: EnvironmentEnum.Production
  style?: WebViewProps['style'];            // WebView style
  webViewProps?: Omit<WebViewProps, 'source' | 'onMessage' | 'style'>;  // Additional WebView props
  // Callbacks
  onSuccess?: (data: any) => void;           // Payment successful
  onError?: (error: RampError) => void;      // Error occurred
  onStepChange?: (step: string) => void;     // User navigated to different step
  onLog?: (log: RampLog) => void;           // Debug/info logging
  onReady?: () => void;                      // Widget fully loaded
  onClose?: () => void;                      // User closed widget
}
```

#### Environment Enum

```tsx
enum EnvironmentEnum {
  Production = 'production',
  X1 = 'x1',
  X2 = 'x2', 
  Voltorb = 'voltorb',
}
```

#### Ref API

```tsx
interface ZBDRampRef {
  mount: (container?: HTMLElement | string) => void;
  unmount: () => void;
  destroy: () => void;
}
```

### useZBDRamp Hook

Hook for managing ZBD Ramp instances programmatically.

```tsx
const { rampRef, sendMessage, updateConfig, reload } = useZBDRamp(options);
```

## Examples

### Basic Component

```tsx
import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { ZBDRamp, EnvironmentEnum } from '@zbdpay/ramp-react-native';

function PaymentScreen() {
  const handleSuccess = (data: any) => {
    Alert.alert('Success', 'Payment completed successfully!');
    console.log('Payment data:', data);
  };

  const handleError = (error: any) => {
    Alert.alert('Error', error.message);
    console.error('Payment error:', error);
  };

  return (
    <View style={styles.container}>
      <ZBDRamp
        sessionToken="your-session-token"
        environment={EnvironmentEnum.Production}
        onSuccess={handleSuccess}
        onError={handleError}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
```

### With Ref for Control

```tsx
import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ZBDRamp, EnvironmentEnum } from '@zbdpay/ramp-react-native';
import type { ZBDRampRef } from '@zbdpay/ramp-react-native';

function ControlledPayment() {
  const rampRef = useRef<ZBDRampRef>(null);

  const unmountWidget = () => {
    rampRef.current?.unmount();
  };

  const destroyWidget = () => {
    rampRef.current?.destroy();
  };

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={unmountWidget}>
          <Text style={styles.buttonText}>Unmount</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={destroyWidget}>
          <Text style={styles.buttonText}>Destroy</Text>
        </TouchableOpacity>
      </View>
      
      <ZBDRamp
        ref={rampRef}
        sessionToken="your-session-token"
        environment={EnvironmentEnum.X1}
        onSuccess={(data) => console.log('Success:', data)}
        onError={(error) => console.error('Error:', error)}
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
  },
});
```

### Using the Hook

```tsx
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Modal } from 'react-native';
import { ZBDRamp, useZBDRamp, EnvironmentEnum } from '@zbdpay/ramp-react-native';

function HookExample() {
  const [isVisible, setIsVisible] = useState(false);
  
  const { rampRef, sendMessage, updateConfig, reload } = useZBDRamp({
    sessionToken: 'your-session-token',
    environment: EnvironmentEnum.Production,
    onSuccess: (data) => {
      console.log('Payment successful:', data);
      setIsVisible(false);
    },
    onClose: () => {
      setIsVisible(false);
    },
  });

  const openPayment = () => {
    setIsVisible(true);
  };

  const closePayment = () => {
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.openButton} onPress={openPayment}>
        <Text style={styles.buttonText}>Open Payment</Text>
      </TouchableOpacity>

      <Modal visible={isVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closePayment}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
          
          <ZBDRamp
            ref={rampRef}
            sessionToken="your-session-token"
            environment={EnvironmentEnum.Production}
            onSuccess={(data) => {
              console.log('Success:', data);
              setIsVisible(false);
            }}
            style={styles.webview}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    backgroundColor: '#f8f8f8',
  },
  closeButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  webview: {
    flex: 1,
  },
});
```

### Custom WebView Configuration

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ZBDRamp, EnvironmentEnum } from '@zbdpay/ramp-react-native';

function CustomWebViewRamp() {
  return (
    <View style={styles.container}>
      <ZBDRamp
        sessionToken="your-session-token"
        environment={EnvironmentEnum.Production}
        style={styles.webview}
        webViewProps={{
          bounces: false,
          scrollEnabled: false,
          showsHorizontalScrollIndicator: false,
          showsVerticalScrollIndicator: false,
          allowsBackForwardNavigationGestures: false,
          userAgent: 'MyApp/1.0',
        }}
        onSuccess={(data) => console.log('Success:', data)}
        onError={(error) => console.error('Error:', error)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
```

### Error Handling

```tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ZBDRamp, EnvironmentEnum } from '@zbdpay/ramp-react-native';
import type { RampError } from '@zbdpay/ramp-react-native';

function PaymentWithErrorHandling() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (error: RampError) => {
    setIsLoading(false);
    let errorMessage = 'An unexpected error occurred.';
    
    switch (error.code) {
      case 'INVALID_CONFIG':
        errorMessage = 'Configuration error. Please check your settings.';
        break;
      case 'NETWORK_ERROR':
        errorMessage = 'Network error. Please check your connection.';
        break;
      case 'PAYMENT_FAILED':
        errorMessage = 'Payment failed. Please try again.';
        break;
    }
    
    setError(errorMessage);
    Alert.alert('Payment Error', errorMessage);
  };

  const handleReady = () => {
    setIsLoading(false);
    setError(null);
  };

  const retry = () => {
    setError(null);
    setIsLoading(true);
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text>Loading payment widget...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {!error && (
        <ZBDRamp
          sessionToken="your-session-token"
          environment={EnvironmentEnum.Production}
          onReady={handleReady}
          onError={handleError}
          onSuccess={() => {
            setError(null);
            Alert.alert('Success', 'Payment completed!');
          }}
          style={styles.webview}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webview: {
    flex: 1,
  },
});
```

## TypeScript Support

The package includes comprehensive TypeScript definitions:

```tsx
import type {
  ZBDRampProps,
  ZBDRampRef,
  RampConfig,
  RampCallbacks,
  RampOptions,
  RampError,
  RampLog,
  PostMessageData,
} from '@zbdpay/ramp-react-native';
```

## Related Packages

- **Core**: [`@zbdpay/ramp-ts`](https://www.npmjs.com/package/@zbdpay/ramp-ts) - Core TypeScript/JavaScript package
- **React**: [`@zbdpay/ramp-react`](https://www.npmjs.com/package/@zbdpay/ramp-react)
- **Flutter**: [`zbd_ramp_flutter`](https://pub.dev/packages/zbd_ramp_flutter)

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email dev@zbdpay.com or create an issue on GitHub.