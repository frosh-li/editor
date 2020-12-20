import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Tabs, Button } from 'antd';
import { useIntl, FormattedMessage } from 'umi';
import * as monaco from 'monaco-editor';
import styles from './index.less';
import { getFileList, getFileContent, saveFileContent } from './service';


const { TabPane } = Tabs;
const editors = {};

interface Pane {
  key: string;
  title: string;
}
export default (): React.ReactNode => {
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  const [files, setFiles] = useState([]);
  const [activeKey, setActiveKey] = useState<string>("");
  
  const [panes, setPanes] = useState<Pane[]>([]);
  const panesRef = useRef(panes);

  const [saving, setSaving] = useState<boolean>(false)

  useEffect(() => {
    getFileList().then(setFiles);
    return () => {
        for(let key in editors) {
            editors[key].dispose()
        }
    };
  }, []);

  const onChange = (activeKey: string) => {
    setActiveKey(activeKey);
  };

  const onEdit = (targetKey: string, action: "remove" | "add") => {
    console.log('targetkey', targetKey)
    if(action === "remove") {
        let nkey = activeKey;
        let lastIndex = -1;
        const _panes = panesRef.current.filter((pane) => pane.key !== `${targetKey}`);
        if (panes.length && activeKey === targetKey) {
        if (lastIndex >= 0) {
            nkey = panes[lastIndex].key;
        } else {
            nkey = panes[0].key;
        }
        }
        setActiveKey(nkey);
        panesRef.current = _panes;
        setPanes(panesRef.current);
        let editor = editors[`editor_${targetKey}`];
        let el = document.getElementById(`editor_${targetKey}`);
        console.log(el);
        editor.dispose();
        editor._domElement = null;
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

  const saveFile = () => {
    setSaving(true);
    const editor = editors[`editor_${activeKey}`];
    saveFileContent(activeKey.replace('file_', ''), editor.getValue())
      .then(() => {
        setSaving(false);
      })
      .catch((e) => {
        console.log(e);
        setSaving(false);
      });
  }

  const showFile = async (file: string) => {
    const content = await getFileContent(file);
    const activeKey: string = `file_${file}`;
    const has = panesRef.current.filter(item => item.key === activeKey);
    if(has && has.length > 0) {
        setActiveKey(activeKey);
        return;
    }
    panesRef.current.push({
      title: file,
      key: activeKey,
    });

    setPanes(panesRef.current);
    forceUpdate();
    setActiveKey(activeKey);
    console.log(file, panesRef.current);
    console.log(document.getElementById(`editor_${activeKey}`));
    let editor: monaco.editor.IStandaloneCodeEditor;
    const editorEl = document.getElementById(`editor_${activeKey}`);
    if (editorEl) {
      editor = monaco.editor.create(editorEl, {
        value: content,
        language: 'shell',
        fontFamily: 'monaco',
        fontSize: 18,
        theme: 'vs-dark',
        // minimap: false,
      });
      editor.setValue(content);
      editors[`editor_${activeKey}`] = editor;
    }
  };
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.files}>
          {files.map((item) => (
            <div
              key={item}
              className={styles.file}
              onClick={() => {
                showFile(item);
              }}
            >
              {item}
            </div>
          ))}
        </div>
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
              <div className={styles.editor} id={setEditorId(pane.key)}></div>
            </TabPane>
          ))}
        </Tabs>
      </div>
      <div className={styles.toolbar}>
        <Button type="primary" loading={saving} onClick={saveFile}>
          保存
        </Button>
      </div>
    </div>
  );
};
