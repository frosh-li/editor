export interface Pane {
  key: string;
  title: string;
}

export interface IFile {
  data: string;
  isDirectory: boolean;
}

export type cb = (data?: any) => void;

export interface ISocket {
  emit(cmd: string, data: string): void;
  on(cmd: string, cb: cb): void;
}
