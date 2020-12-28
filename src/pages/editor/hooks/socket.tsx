import { useEffect } from 'react';
import io from 'socket.io-client';
import { ISocket } from '../data.d';

let socket: ISocket;
export const useSocket = () => {
  const connectWS = () => {
    socket = io('/', {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', function onConnect() {
      socket.emit('connected');
    });
    socket.on('sync', (data: any) => {
      const cdata = JSON.parse(data);
      const changes = JSON.parse(cdata.data);
      const editor = editors[`editor_file_${cdata.filename}`];
      if (!editor) {
        return;
      }
      freeHanldeChange.set(cdata.filename, true);
      editor.executeEdits(editor.getValue(), changes);
      freeHanldeChange.set(cdata.filename, false);
    });
    socket.on('disconnect', function onDisconnect() {});
    socket.on('error', function onError(e: any) {
      throw new Error(e);
    });
  };

  const emit = (channel, data) => {
    socket.emit(channel, data);
  };

  useEffect(() => {
    connectWS();
    return () => {
      socket = null;
    };
  }, []);

  return {
    emit,
  };
};
