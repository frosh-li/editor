import { useState } from 'react';
import { getFileList, saveFileContent, restartServer } from '../service';

export const useToolbarActions = () => {
  const [saving, setSaving] = useState<boolean>(false);
  const [reloading, setReloading] = useState<boolean>(false);
  const [activeKey, setActiveKey] = useState<string>('');
  const [files, setFiles] = useState<IFile[]>([]);
  const saveFile = () => {
    setSaving(true);
    const editor = editors[`editor_${activeKey}`];
    saveFileContent(activeKey.replace('file_', ''), editor.getValue())
      .then(() => {
        setSaving(false);
        message.success('文件保存成功');
      })
      .catch(() => {
        setSaving(false);
      });
  };

  const restart = () => {
    setReloading(true);
    restartServer()
      .then(() => {
        message.success('nginx服务器重启成功');
        setReloading(false);
      })
      .catch(() => {
        setReloading(false);
      });
  };

  const refresh = () => {
    getFileList().then(setFiles);
    message.success('列表刷新完成');
  };

  return {
    files,
    setFiles,
    activeKey,
    setSaving,
    setReloading,
    setActiveKey,
    saving,
    reloading,
    saveFile,
    restart,
    refresh,
  };
};
