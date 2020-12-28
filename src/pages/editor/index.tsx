import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Tabs, message, Modal, Input, Form } from 'antd';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';
import styles from './index.less';
import { Pane } from './data.d';
import FilesTree from './FilesTree';
import MainBar from './MainBar';
import { useToolbarActions } from './hooks/toolbar';
import { useSocket } from './hooks/socket';
import { getFileList, getFileContent, saveFileContent } from './service';

const { TabPane } = Tabs;
const editors = {};

let currentfile = '';
// 设置是否不更新
const freeHanldeChange = new Map();

export default (): React.ReactNode => {
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  const {
    files,
    setFiles,
    activeKey,
    setActiveKey,
    saving,
    reloading,
    saveFile,
    restart,
    refresh,
  } = useToolbarActions();
  const [panes, setPanes] = useState<Pane[]>([]);
  const panesRef = useRef(panes);
  const { emit } = useSocket();
  // 弹窗相关
  const [isCreateModalVisible, setCreateModalStatus] = useState<boolean>(false);
  const [form] = Form.useForm();

  const changeModelContent = (event: monaco.editor.IModelContentChangedEvent): void => {
    if (freeHanldeChange.get(currentfile)) {
      return;
    }
    emit(
      'execCmd',
      JSON.stringify({
        filename: currentfile,
        data: JSON.stringify(event.changes),
      }),
    );
  };

  useEffect(() => {
    getFileList().then(setFiles);
    return () => {
      Object.values(editors).forEach((editor) => {
        editor.dispose();
      });
    };
  }, []);

  const onChange = (aKey: string) => {
    setActiveKey(aKey);
  };

  const handleOk = () => {
    const filename = form.getFieldValue('filename');
    saveFileContent(filename, '')
      .then(() => {
        message.success('文件新建成功');
        getFileList().then(setFiles);
        setCreateModalStatus(false);
      })
      .catch(() => {
        setCreateModalStatus(false);
      });
  };

  const handleCancel = () => {
    setCreateModalStatus(false);
  };

  const openCreate = () => {
    setCreateModalStatus(true);
  };

  const onEdit = (targetKey: string, action: 'remove' | 'add') => {
    if (action === 'remove') {
      let nkey = activeKey;
      const lastIndex = -1;
      const iPanes = panesRef.current.filter((pane) => pane.key !== `${targetKey}`);
      if (panes.length > 0 && activeKey === targetKey) {
        if (lastIndex > 0) {
          nkey = iPanes[lastIndex].key;
        } else {
          nkey = iPanes[0].key;
        }
      }
      setActiveKey(nkey);
      panesRef.current = iPanes;
      setPanes(panesRef.current);
      let editor = editors[`editor_${targetKey}`];
      let el = document.getElementById(`editor_${targetKey}`);
      editor?.dispose();
      editor = null;
      el?.remove();
      el = null;
      editors[`editor_${targetKey}`] = null;
      forceUpdate();
    }
  };

  const setEditorId = (key: string) => {
    return `editor_${key}`;
  };

  const showFile = React.useCallback(async (file: string, isDirectory: boolean) => {
    if (isDirectory) {
      return;
    }
    const { content, changes } = await getFileContent(file);
    currentfile = file;
    const iActiveKey: string = `file_${file}`;
    const has = panesRef.current.filter((item) => item.key === iActiveKey);
    if (has && has.length > 0) {
      setActiveKey(iActiveKey);
      return;
    }
    panesRef.current.push({
      title: file,
      key: iActiveKey,
    });
    setPanes(panesRef.current);
    setActiveKey(iActiveKey);
    let editor: monaco.editor.IStandaloneCodeEditor;
    const editorEl = document.getElementById(`editor_${iActiveKey}`);
    if (editorEl) {
      const model = monaco.editor.createModel('', 'shell');
      editor = monaco.editor.create(editorEl, {
        value: content,
        language: 'shell',
        fontFamily: 'monaco',
        fontSize: 18,
        theme: 'vs-dark',
        model,
      });
      editor.setValue(content);
      editors[`editor_${iActiveKey}`] = editor;
      changes.forEach(async (change: string) => {
        const current_change = JSON.parse(JSON.parse(change).data);
        freeHanldeChange.set(file, true);
        editor.executeEdits(editor.getValue(), current_change);
        freeHanldeChange.set(file, false);
      });
      editor.onDidChangeModelContent(changeModelContent);
    }
    forceUpdate();
  }, []);

  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <FilesTree files={files} showFile={showFile} />
        <Tabs
          hideAdd
          onChange={onChange}
          activeKey={activeKey}
          type="editable-card"
          onEdit={onEdit}
          tabBarStyle={{ background: '#333' }}
          className={styles.tabs}
        >
          {panesRef.current.map((pane) => (
            <TabPane tab={pane.title} key={pane.key} className={styles.tabContent}>
              <div className={styles.editor} id={setEditorId(pane.key)} />
            </TabPane>
          ))}
        </Tabs>
      </div>
      <MainBar
        refresh={refresh}
        saveFile={saveFile}
        restart={restart}
        openCreate={openCreate}
        saving={saving}
        reloading={reloading}
      />

      <Modal
        title="新增文件"
        visible={isCreateModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="文件名" required tooltip="请输入文件名.server结尾" name="filename">
            <Input placeholder="请输入文件名以.server结尾" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
