import { request } from 'umi';

export async function getFileList(): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/list');
}

export async function getFileContent(filename: String): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/file?filename='+filename);
}

export async function restartServer(): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/restart');
}

export async function saveFileContent(filename: String, content: String): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/savefile?filename=' + filename, {
    method: "post",
    data: {
      filename,
      content,
    },
  });
}

export async function sendCommand(uuid:String, filename: String, changes: String): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/execCmd?uuid='+uuid+'&filename=' + filename, {
    method: "post",
    data: {
      filename,
      changes,
      uuid,
    },
  });
}

export async function getCommand(uuid: String, filename: String): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/getCmd?uuid='+uuid+'&filename='+filename);
}