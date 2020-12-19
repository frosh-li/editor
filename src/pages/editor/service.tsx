import { request } from 'umi';

export async function getFileList(): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/list');
}

export async function getFileContent(filename: String): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/file?filename='+filename);
}
