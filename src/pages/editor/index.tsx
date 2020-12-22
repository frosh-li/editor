import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Tabs, Button, message, Modal, Input, Form, Tooltip } from 'antd';
import { useIntl, FormattedMessage } from 'umi';
import * as monaco from 'monaco-editor';
import styles from './index.less';

import { getFileList, getFileContent, saveFileContent, restartServer, sendCommand, getCommand } from './service';
import { ProfileOutlined, ProfileTwoTone, ReloadOutlined, RightOutlined } from '@ant-design/icons';
// Generate four random hex digits. 
function S4() { 
  return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
}; 
// Generate a pseudo-GUID by concatenating random hexadecimal. 
function guid() { 
  return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()); 
};

const cuuid = guid();

const { TabPane } = Tabs;
const editors = {};

interface Pane {
  key: string;
  title: string;
}

interface IFile {
  data: string;
  isDirectory: boolean;
}


let socket;
let lastContent = new Map();

export default (): React.ReactNode => {
  
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  const [files, setFiles] = useState<IFile[]>([]);
  const [activeKey, setActiveKey] = useState<string>("");
  
  const [panes, setPanes] = useState<Pane[]>([]);
  const panesRef = useRef(panes);

  const [saving, setSaving] = useState<boolean>(false)

  // 弹窗相关
  const [isCreateModalVisible, setCreateModalStatus] = useState<boolean>(false) 
  const [form] = Form.useForm();
  

  const disconnectWS = () => {

  }


  const connectWS = () => {
    socket = require('socket.io-client')("/", {
      transports: ['websocket'],
      autoConnect: true,
    });
    console.log('socket', socket)
    socket.on('connect', function(){
      console.log('connect')
      socket.emit('chat', 'hello world!');
    });
    socket.on('sync', function(data: any){
      const cdata = JSON.parse(data);
      const changes = JSON.parse(cdata.data);
      console.log('sync from socket', data)
      let editor = editors[`editor_file_${cdata.filename}`];
      editor.executeEdits(lastContent.get(cdata.filename), changes)
      lastContent.set(cdata.filename,editor.getValue());
    });
    socket.on('disconnect', function(){
      console.log('disconnect')
    });
    socket.on('error', function(e: any) {
      console.log(e)
    })
  }

  useEffect(() => {
    getFileList().then(setFiles);
    connectWS();
    return () => {
        for(let key in editors) {
            editors[key].dispose()
        }
        disconnectWS()
    };
  }, []);

  const onChange = (activeKey: string) => {
    setActiveKey(activeKey);
  };

  const handleOk = () => {
    const filename = form.getFieldValue("filename");
    console.log(filename);
    saveFileContent(filename, '').then(() => {
      message.success("文件新建成功");
      getFileList().then(setFiles);
      setCreateModalStatus(false);
    }).catch(e => {
      setCreateModalStatus(false);
    })
  }

  const handleCancel = () => {
    setCreateModalStatus(false);
  }

  const openCreate = () => {
    setCreateModalStatus(true);
  }

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
        message.success('文件保存成功');
      })
      .catch((e) => {
        console.log(e);
        setSaving(false);
      });
  }

  const restart = () => {
    restartServer().then(() => {
      message.success('nginx服务器重启成功');
    })
  }

  const refresh = () => {
    getFileList().then(setFiles);
    message.success("列表刷新完成");
  }

  const showFile = async (file: string, isDirectory: boolean) => {
    if(isDirectory) {
      return;
    }
    const {content, changes} = await getFileContent(file);
    
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
      const model = monaco.editor.createModel("","shell");

      editor = monaco.editor.create(editorEl, {
        value: content,
        language: 'shell',
        fontFamily: 'monaco',
        fontSize: 18,
        theme: 'vs-dark',
        model,
        // minimap: false,
      });
      editor.setValue(content);
      const subkey = activeKey.replace("file_", "");
      lastContent.set(subkey, content);
      editors[`editor_${activeKey}`] = editor;
      const _changes = changes.map(change => {
        return JSON.parse(JSON.parse(change).data)[0]
      });
      console.log("_changes", _changes)
      editor.executeEdits(subkey, _changes)
      editor.onDidChangeModelContent(event => {
        setTimeout(() => {
          if(lastContent.get(subkey) === editor.getValue()) {
            return;
          }
          lastContent.set(subkey, editor.getValue())
          console.log('lastContent', lastContent);
          console.log('content', editor.getValue())
          console.log(event.changes);
          socket.emit('execCmd', JSON.stringify({
            filename: file,
            data: JSON.stringify(event.changes)
          }))
        }, 0)
        
      }); 
    }
  };
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <div className={styles.files}>
          {files.map((item) => (
            <Tooltip title={item.data} key={item.data}>
            <div
              key={item.data}
              className={styles.file}
              onClick={() => {
                showFile(item.data, item.isDirectory);
              }}
            >
              {item.isDirectory ? <RightOutlined />: <ProfileOutlined />}
              <div className={styles.cfile}>{item.data}</div>
            </div>
            </Tooltip>
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
        <Tooltip title="刷新列表">
          <Button type="primary" onClick={refresh} icon={<ReloadOutlined />} />
        </Tooltip>
        <Button type="primary" loading={saving} onClick={saveFile}>
          保存
        </Button>
        <Button type="primary" loading={saving} onClick={restart}>
          重启nginx
        </Button>
        <Button onClick={openCreate}>
          新建文件
        </Button>
      </div>
      <Modal title="新增文件" visible={isCreateModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Form
            form={form}
            layout="vertical"
          >
            <Form.Item label="文件名" required tooltip="请输入文件名.server结尾" name="filename">
              <Input placeholder="请输入文件名以.server结尾" />
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
