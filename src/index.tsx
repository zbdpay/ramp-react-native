import { EnvironmentEnum, getWidgetUrl } from '@zbdpay/ramp-ts';
import type { PostMessageData, RampError, RampLog, RampOptions } from '@zbdpay/ramp-ts';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent, WebViewProps } from 'react-native-webview';

// React Native compatible URL building function
const buildWidgetUrlRN = ({ 
  baseUrl, 
  sessionToken, 
  secret 
}: { 
  baseUrl: string; 
  sessionToken: string; 
  secret?: string; 
}): string => {
  const separator = baseUrl.includes('?') ? '&' : '?';
  let url = `${baseUrl}${separator}session_token=${encodeURIComponent(sessionToken)}`;
  
  if (secret) {
    url += `&secret=${encodeURIComponent(secret)}`;
  }
  
  return url;
};

export interface ZBDRampProps extends RampOptions {
  style?: WebViewProps['style'];
  webViewProps?: Omit<WebViewProps, 'source' | 'onMessage' | 'style'>;
  secret?: string;
}

export interface ZBDRampRef {
  sendMessage: (message: PostMessageData) => void;
  updateConfig: (config: Partial<RampOptions>) => void;
  reload: () => void;
}

export const ZBDRamp = forwardRef<ZBDRampRef, ZBDRampProps>(({ style, webViewProps, ...rampOptions }, ref) => {
  const webViewRef = useRef<WebView>(null);

  const validateOptions = useCallback(() => {
    if (!rampOptions.sessionToken) {
      throw new Error('sessionToken is required');
    }
  }, [rampOptions.sessionToken]);

  useEffect(() => {
    validateOptions();
  }, [validateOptions]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data: PostMessageData = JSON.parse(event.nativeEvent.data);
        const { type, payload } = data;

        switch (type) {
          case 'WIDGET_SUCCESS':
            rampOptions.onSuccess?.(payload);
            break;

          case 'WIDGET_ERROR':
            const error: RampError = {
              code: payload?.code || 'UNKNOWN_ERROR',
              message: payload?.message || 'An error occurred',
              details: payload?.details,
            };
            rampOptions.onError?.(error);
            break;

          case 'WIDGET_STEP_CHANGE':
            rampOptions.onStepChange?.(payload?.step);
            break;

          case 'WIDGET_LOG':
            const log: RampLog = {
              level: payload?.level || 'info',
              message: payload?.message || '',
              data: payload?.data,
            };
            rampOptions.onLog?.(log);
            break;

          case 'WIDGET_READY':
            rampOptions.onReady?.();
            break;

          case 'WIDGET_CLOSE':
            rampOptions.onClose?.();
            break;

          default:
            console.debug('Unknown message type from widget:', type);
        }
      } catch (error) {
        console.warn('Failed to parse message from widget:', error);
      }
    },
    [rampOptions]
  );

  const sendMessage = useCallback((message: PostMessageData) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  }, []);

  const updateConfig = useCallback((config: Partial<RampOptions>) => {
    // Configuration updates can be handled here if needed
    console.log('Config update:', config);
  }, []);

  const reload = useCallback(() => {
    webViewRef.current?.reload();
  }, []);

  // Expose methods via ref
  useImperativeHandle(
    ref,
    () => ({
      sendMessage,
      updateConfig,
      reload,
    }),
    [sendMessage, updateConfig, reload]
  );

  // Build widget URL
  const baseUrl = getWidgetUrl(rampOptions.environment || EnvironmentEnum.Production);
  const widgetUrl = buildWidgetUrlRN({
    baseUrl,
    sessionToken: rampOptions.sessionToken,
    secret: rampOptions.secret,
  });
  
  console.log('ZBD Ramp Debug:', {
    baseUrl,
    sessionToken: rampOptions.sessionToken?.substring(0, 20) + '...',
    widgetUrl,
    environment: rampOptions.environment,
    hasSecret: !!rampOptions.secret,
  });

  // Handle WebView load
  const handleLoadEnd = useCallback(() => {
    console.log('ZBD Ramp WebView: Load ended successfully');
  }, []);

  const handleLoadStart = useCallback(() => {
    console.log('ZBD Ramp WebView: Load started');
  }, []);

  const handleError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('ZBD Ramp WebView Error:', nativeEvent);
  }, []);

  const handleHttpError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('ZBD Ramp WebView HTTP Error:', nativeEvent);
  }, []);

  const handleRenderError = useCallback((syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('ZBD Ramp WebView Render Error:', nativeEvent);
  }, []);

  const handleShouldStartLoadWithRequest = useCallback((request: any) => {
    console.log('ZBD Ramp WebView: Should start load with request:', request.url);
    return true;
  }, []);

  return (
    <WebView
      ref={webViewRef}
      source={{ uri: widgetUrl }}
      onMessage={handleMessage}
      onLoadStart={handleLoadStart}
      onLoadEnd={handleLoadEnd}
      onError={handleError}
      onHttpError={handleHttpError}
      onRenderProcessGone={handleRenderError}
      onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
      style={style}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
      startInLoadingState={true}
      mixedContentMode="compatibility"
      {...webViewProps}
    />
  );
});

ZBDRamp.displayName = 'ZBDRamp';

// Hook for programmatic usage
export const useZBDRamp = (_options: ZBDRampProps) => {
  const rampRef = useRef<ZBDRampRef>(null);

  const sendMessage = useCallback((message: PostMessageData) => {
    rampRef.current?.sendMessage(message);
  }, []);

  const updateConfig = useCallback((config: Partial<RampOptions>) => {
    rampRef.current?.updateConfig(config);
  }, []);

  const reload = useCallback(() => {
    rampRef.current?.reload();
  }, []);

  return {
    rampRef,
    sendMessage,
    updateConfig,
    reload,
  };
};

// Re-export types from core package
export type {
  RampConfig,
  RampCallbacks,
  RampOptions,
  RampError,
  RampLog,
  EnvironmentEnum,
  PostMessageData,
} from '@zbdpay/ramp-ts';
