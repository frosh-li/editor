import React, { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card, Alert, Typography } from 'antd';
import { useIntl, FormattedMessage } from 'umi';
import * as monaco from 'monaco-editor';
import styles from './index.less';
import { getFileList, getFileContent } from './service';

let editor: monaco.editor.IStandaloneCodeEditor;

export default (): React.ReactNode => {
  const intl = useIntl();
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const divEl = useRef<HTMLDivElement>(null);
  
  useEffect(async () => {
    const res = await getFileList();
    setFiles(res);
    
    if (divEl.current) {
      editor = monaco.editor.create(divEl.current, {
        value: content,
        language: 'shell',
        fontFamily: 'monaco',
        fontSize: '18px',
        theme: 'vs-dark',
        minimap: false,
      });
    }

    
    return () => {
      editor.dispose();
    };
  }, []);

  const showFile = async (file:String) => {
    const content = await getFileContent(file);
    setContent(content);
    editor.setValue(content);
  }
  return (
    <PageContainer>
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
        <div className={styles.editor} ref={divEl}>
        </div>
      </div>
    </PageContainer>
  );
};
