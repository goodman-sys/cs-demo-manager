import type { ReactNode } from 'react';
import React, { createContext, useRef, useState } from 'react';
import { Trans, useLingui } from '@lingui/react/macro';
import type { RendererMessageHandlers } from 'csdm/server/handlers/renderer-handlers-mapping';
import type { IdentifiableClientMessage } from 'csdm/server/identifiable-client-message';
import type { RendererClientMessageName } from 'csdm/server/renderer-client-message-name';
import type { RendererServerMessagePayload, RendererServerMessageName } from 'csdm/server/renderer-server-message-name';
import { SharedServerMessageName } from 'csdm/server/shared-server-message-name';
import { Status } from 'csdm/common/types/status';
import { Loading } from 'csdm/ui/bootstrap/loading';
import { LoadingError } from 'csdm/ui/bootstrap/loading-error';
import { useRegisterWebSocketListeners } from 'csdm/ui/bootstrap/use-register-web-socket-listeners';

type Listener<MessageName extends RendererServerMessageName = RendererServerMessageName> = (
  payload: RendererServerMessagePayload[MessageName],
) => void;

type ReplyHandler = {
  resolve: Listener;
  reject: (error: unknown) => void;
};

type SendableMessagePayload<MessageName extends RendererClientMessageName> = Parameters<
  RendererMessageHandlers[MessageName]
>[0];

type SendableMessage<MessageName extends RendererClientMessageName = RendererClientMessageName> = {
  name: MessageName;
} & (SendableMessagePayload<MessageName> extends void
  ? object
  : {
      payload: SendableMessagePayload<MessageName>;
    });

function getWebSocketUrl(): string {
  // 开发模式：Vite 开发服务器运行在 5173 端口，后端运行在 3000 端口
  if (window.location.port === '5173') {
    return 'ws://localhost:3000/ws?process=renderer';
  }
  // 生产模式：前后端部署在同一 origin
  return `ws://${window.location.host}/ws?process=renderer`;
}

// Web 版 WebSocket 客户端，与原始 WebSocketClient 接口兼容，
// 但使用适用于 Web 环境的连接 URL。
class WebWebSocketClient {
  private messageQueue: SendableMessage[] = [];
  private listeners = new Map<RendererServerMessageName, Listener[]>();
  private replyHandlers: Map<string, ReplyHandler> = new Map();
  private socket!: WebSocket;
  private isConnected = false;
  private onConnectionSuccess: () => void;
  private onConnectionError: (event: CloseEvent) => void;

  public constructor(onConnectionSuccess: () => void, onConnectionError: (event: CloseEvent) => void) {
    this.onConnectionError = onConnectionError;
    this.onConnectionSuccess = onConnectionSuccess;
    this.connect();
  }

  public on = <MessageName extends RendererServerMessageName>(name: MessageName, listener: Listener<MessageName>) => {
    const listeners = this.listeners.get(name);
    if (listeners === undefined) {
      this.listeners.set(name, [listener as Listener]);
    } else {
      listeners.push(listener as Listener);
    }
  };

  public off = <MessageName extends RendererServerMessageName>(name: MessageName, listener: Listener<MessageName>) => {
    const listeners = this.listeners.get(name);
    if (listeners === undefined) {
      return;
    }

    this.listeners.set(
      name,
      listeners.filter((cb: Listener) => cb !== listener),
    );
  };

  public removeAllEventListeners = (name: RendererServerMessageName): void => {
    this.listeners.set(name, []);
  };

  public send = <MessageName extends RendererClientMessageName>(message: SendableMessage<MessageName>) => {
    return new Promise((resolve: Listener, reject) => {
      const uuid = window.crypto.randomUUID();
      (message as IdentifiableClientMessage<MessageName>).uuid = uuid;
      this.replyHandlers.set(uuid, { resolve, reject });
      if (this.isConnected) {
        this.socket.send(JSON.stringify(message));
      } else {
        this.messageQueue.push(message as SendableMessage);
      }
    }) as ReturnType<RendererMessageHandlers[MessageName]>;
  };

  private connect = () => {
    logger.log('WS:: connecting to server');
    const url = getWebSocketUrl();
    this.socket = new WebSocket(url);
    this.socket.addEventListener('open', this.onConnect);
    this.socket.addEventListener('close', this.onDisconnect);
  };

  private onConnect = async () => {
    logger.log('WS:: connected');
    this.isConnected = true;
    this.socket.addEventListener('message', this.onMessage);
    this.socket.addEventListener('close', this.onDisconnect);
    this.socket.addEventListener('error', this.onError);
    this.onConnectionSuccess();
    for (const message of this.messageQueue) {
      await this.send(message);
    }
    this.messageQueue = [];
  };

  private onDisconnect = (event: CloseEvent): void => {
    logger.warn('WS:: disconnected');
    this.isConnected = false;
    this.onConnectionError(event);
    this.connect();
  };

  private onError = (event: Event): void => {
    logger.error('WS:: error', event);
    this.isConnected = false;
    this.connect();
  };

  private onMessage = (messageEvent: MessageEvent): void => {
    try {
      const message: IdentifiableClientMessage<RendererServerMessageName> = JSON.parse(messageEvent.data as string);
      const { name, payload, uuid } = message;

      switch (name) {
        case SharedServerMessageName.Reply:
          {
            if (uuid === undefined) {
              logger.log(`WS:: missing uuid for message with name: "${name}", can't retrieve its reply handler`);
              return;
            }
            const replyHandler = this.replyHandlers.get(uuid);
            if (replyHandler) {
              replyHandler.resolve(payload);
              this.replyHandlers.delete(uuid);
            } else {
              logger.log(`WS:: no reply handler for message with name: "${name}" and uuid ${uuid}`);
            }
          }
          break;
        case SharedServerMessageName.ReplyError:
          {
            if (uuid === undefined) {
              logger.log(`WS:: missing uuid for message with name: "${name}", can't retrieve its reply handler`);
              return;
            }

            const replyHandler = this.replyHandlers.get(uuid);
            if (replyHandler) {
              replyHandler.reject(payload);
              this.replyHandlers.delete(uuid);
            } else {
              logger.log(`WS:: no reply handler for message with name: "${name}" and uuid ${uuid}`);
            }
          }
          break;
        default: {
          logger.log(`WS:: message with name "${name}" received from server`);
          const listeners = this.listeners.get(name);
          if (listeners) {
            for (const listener of listeners) {
              listener(payload);
            }
          } else {
            logger.log(`WS:: no listener for message with name: "${name}"`);
          }
        }
      }
    } catch (error) {
      logger.error('WS:: Error on message:');
      logger.error(error);
    }
  };
}

export const WebSocketContext = createContext<WebWebSocketClient | null>(null);

type Props = {
  children: ReactNode;
};

export function WebSocketProvider({ children }: Props) {
  const clientRef = useRef<WebWebSocketClient | null>(null);
  const [status, setStatus] = useState<Status>(Status.Loading);
  const [error, setError] = useState('');
  const { t } = useLingui();

  const getClient = () => {
    if (clientRef.current === null) {
      const onConnectionSuccess = () => {
        setStatus(Status.Success);
      };

      const onConnectionError = (event: CloseEvent) => {
        const code = event.code;
        const url = getWebSocketUrl();
        setError(
          t`The connection to the WebSocket server at ${url} failed with code ${code}. Make sure the backend server is running.`,
        );
        setStatus(Status.Error);
      };

      clientRef.current = new WebWebSocketClient(onConnectionSuccess, onConnectionError);
    }

    return clientRef.current;
  };
  const client: WebWebSocketClient = getClient();
  // WebWebSocketClient 与 WebSocketClient 公共接口完全一致，
  // 但 TypeScript 对 private 属性使用名义类型，需要类型断言。
  useRegisterWebSocketListeners(client as never);

  if (status === Status.Loading) {
    return <Loading />;
  }

  if (status === Status.Error) {
    return <LoadingError title={<Trans>An error occurred connecting to the WebSocket server.</Trans>} error={error} />;
  }

  return <WebSocketContext.Provider value={client}>{children}</WebSocketContext.Provider>;
}
