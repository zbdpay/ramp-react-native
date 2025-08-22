import { EnvironmentEnum, WidgetPostMessageEnum, getWidgetUrl } from '@zbdpay/ramp-ts';
import type { PostMessageData, RampError, RampOptions } from '@zbdpay/ramp-ts';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { WebView } from 'react-native-webview';
import type { WebViewMessageEvent, WebViewProps } from 'react-native-webview';

const buildWidgetUrlRN = ({
  baseUrl,
  sessionToken,
  secret,
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

  const widgetUrl = useMemo(() => {
    const baseUrl = getWidgetUrl(rampOptions.environment || EnvironmentEnum.Production);
    return buildWidgetUrlRN({
      baseUrl,
      sessionToken: rampOptions.sessionToken,
      secret: rampOptions.secret,
    });
  }, [rampOptions.sessionToken, rampOptions.environment, rampOptions.secret]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data: PostMessageData = JSON.parse(event.nativeEvent.data);
        const { type, payload } = data;

        switch (type) {
          case WidgetPostMessageEnum.TransactionComplete:
            rampOptions.onSuccess?.(payload);
            break;

          case WidgetPostMessageEnum.Error:
            const error: RampError = {
              code: payload?.code || 'UNKNOWN_ERROR',
              message: payload?.message || 'An error occurred',
              details: payload?.details,
            };
            rampOptions.onError?.(error);
            break;

          case WidgetPostMessageEnum.StepChange:
            rampOptions.onStepChange?.(payload?.step);
            break;

          case WidgetPostMessageEnum.Ready:
            rampOptions.onReady?.();
            break;

          case WidgetPostMessageEnum.KYCStatusChange:
            rampOptions.onLog?.({
              level: 'info',
              message: 'KYC Status Change',
              data: payload,
            });
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
    console.log('Config update:', config);
  }, []);

  const reload = useCallback(() => {
    webViewRef.current?.reload();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      sendMessage,
      updateConfig,
      reload,
    }),
    [sendMessage, updateConfig, reload]
  );

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
      incognito={false}
      {...webViewProps}
    />
  );
});

ZBDRamp.displayName = 'ZBDRamp';

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

export type {
  RampConfig,
  RampCallbacks,
  RampOptions,
  RampError,
  RampLog,
  EnvironmentEnum,
  PostMessageData,
  WidgetPostMessageEnum,
  InitRampSessionConfig,
  InitRampSessionData,
  InitRampSessionResponse,
} from '@zbdpay/ramp-ts';

export { QuoteCurrencyEnum, BaseCurrencyEnum, initRampSession } from '@zbdpay/ramp-ts';
