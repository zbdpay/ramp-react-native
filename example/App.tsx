import React, { useState, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  TextInput,
  Switch,
} from 'react-native';
import { ZBDRamp, initRampSession, QuoteCurrencyEnum, BaseCurrencyEnum } from '../src/index';
import type { ZBDRampRef, RampError, RampLog } from '../src/index';

interface FormData {
  apiKey: string;
  email: string;
  destination: string;
  quoteCurrency: string;
  baseCurrency: string;
  webhookUrl: string;
  referenceId: string;
}

const App = () => {
  const [sessionToken, setSessionToken] = useState('');
  const [showRamp, setShowRamp] = useState(false);
  const [debugMode, setDebugMode] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    apiKey: '',
    email: '',
    destination: '',
    quoteCurrency: 'USD',
    baseCurrency: 'BTC',
    webhookUrl: 'https://webhook.site/79f9c0fa-8cfa-4762-9c28-e94290e8c2e1',
    referenceId: ''
  });
  const rampRef = useRef<ZBDRampRef>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]); // Keep last 20 logs
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const createSessionToken = async () => {
    const { apiKey, email, destination, quoteCurrency, baseCurrency, webhookUrl, referenceId } = formData;

    if (!apiKey || !email || !destination) {
      Alert.alert('Error', 'Please fill in API Key, Email, and Destination fields');
      return;
    }

    setIsLoading(true);
    addLog('Creating session token...');

    try {
      const response = await initRampSession({
        apikey: apiKey,
        email,
        destination,
        quote_currency: quoteCurrency as QuoteCurrencyEnum,
        base_currency: baseCurrency as BaseCurrencyEnum,
        webhook_url: webhookUrl,
        reference_id: referenceId || undefined,
        metadata: {
          created_from: 'ramp-react-native-example',
        },
      });

      addLog(`Session created: ${JSON.stringify(response)}`);

      if (response.success && response.data.session_token) {
        setSessionToken(response.data.session_token);
        addLog(`Session token received: ${response.data.session_token.substring(0, 20)}...`);
        setShowRamp(true);
      } else {
        throw new Error(response.error || 'No session token found in API response');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`ERROR: ${errorMessage}`);
      Alert.alert('Session Creation Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = (data: any) => {
    addLog(`SUCCESS: ${JSON.stringify(data)}`);
    Alert.alert('Payment Successful! 🎉', JSON.stringify(data, null, 2));
  };

  const handleError = (error: RampError) => {
    addLog(`ERROR: ${error.code} - ${error.message}`);
    Alert.alert('Payment Error', `${error.code}: ${error.message}`);
  };

  const handleStepChange = (step: string) => {
    addLog(`STEP: ${step}`);
  };

  const handleLog = (log: RampLog) => {
    if (debugMode) {
      addLog(`${log.level.toUpperCase()}: ${log.message}`);
    }
  };

  const handleReady = () => {
    addLog('WIDGET: Ready');
  };

  const handleClose = () => {
    addLog('WIDGET: Closed by user');
    setShowRamp(false);
  };

  const startPayment = () => {
    if (sessionToken.trim()) {
      // If we already have a session token, use it directly
      addLog(`Starting payment with existing session token`);
      setShowRamp(true);
    } else {
      // Create a new session token
      createSessionToken();
    }
  };

  const closePayment = () => {
    addLog('Closing payment widget');
    setShowRamp(false);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (showRamp) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={closePayment}>
            <Text style={styles.closeButtonText}>← Close</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>ZBD Ramp</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.rampContainer}>
          <ZBDRamp
            ref={rampRef}
            sessionToken={sessionToken}
            onSuccess={handleSuccess}
            onError={handleError}
            onStepChange={handleStepChange}
            onLog={handleLog}
            onReady={handleReady}
            onClose={handleClose}
            style={styles.webview}
            webViewProps={{
              onLoadStart: () => addLog('WEBVIEW: Load started'),
              onLoadEnd: () => addLog('WEBVIEW: Load ended'),
              onError: (error) => addLog(`WEBVIEW ERROR: ${JSON.stringify(error)}`),
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>ZBD Ramp React Native</Text>
          <Text style={styles.subtitle}>Example Application</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Configuration</Text>
          
          <Text style={styles.label}>API Key:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter your ZBD API key..."
            value={formData.apiKey}
            onChangeText={(value) => handleInputChange('apiKey', value)}
            autoCapitalize="none"
            secureTextEntry={true}
          />
          
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="user@example.com"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Text style={styles.label}>Destination:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Lightning address or username"
            value={formData.destination}
            onChangeText={(value) => handleInputChange('destination', value)}
            autoCapitalize="none"
          />
          
          <Text style={styles.label}>Webhook URL:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="https://your-webhook-url.com"
            value={formData.webhookUrl}
            onChangeText={(value) => handleInputChange('webhookUrl', value)}
            autoCapitalize="none"
            keyboardType="url"
          />
          
          <Text style={styles.label}>Reference ID (optional):</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Optional reference ID"
            value={formData.referenceId}
            onChangeText={(value) => handleInputChange('referenceId', value)}
            autoCapitalize="none"
          />
          
          {sessionToken ? (
            <>
              <Text style={styles.label}>Current Session Token:</Text>
              <TextInput
                style={[styles.textInput, styles.sessionTokenInput]}
                value={`${sessionToken.substring(0, 20)}...`}
                editable={false}
                multiline={true}
              />
            </>
          ) : null}

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Debug Logging:</Text>
            <Switch
              value={debugMode}
              onValueChange={setDebugMode}
              trackColor={{ false: '#767577', true: '#ff6b35' }}
              thumbColor={debugMode ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isLoading && styles.disabledButton]}
            onPress={startPayment}
            disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? 'Creating Session...' : sessionToken ? 'Start Payment' : 'Create Session & Start Payment'}
            </Text>
          </TouchableOpacity>
          
          {sessionToken ? (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => setSessionToken('')}>
              <Text style={styles.secondaryButtonText}>Clear Session</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.logsHeader}>
            <Text style={styles.sectionTitle}>Debug Logs</Text>
            <TouchableOpacity style={styles.clearButton} onPress={clearLogs}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.logsContainer}>
            {logs.length === 0 ? (
              <Text style={styles.noLogsText}>No logs yet...</Text>
            ) : (
              logs.map((log, index) => (
                <Text key={index} style={styles.logText}>
                  {log}
                </Text>
              ))
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#ff6b35',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 60,
  },
  rampContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webview: {
    flex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#ff6b35',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    marginTop: 12,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  sessionTokenInput: {
    backgroundColor: '#f0f0f0',
    color: '#666666',
  },
  logsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
  },
  clearButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  logsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    maxHeight: 200,
  },
  noLogsText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  logText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});

export default App;