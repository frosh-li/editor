import React from 'react';
import { Tooltip } from 'antd';
import { ProfileOutlined, RightOutlined } from '@ant-design/icons';

import styles from './index.less';

export default React.memo(
  (props): React.ReactNode => {
    const { files, showFile } = props;
    return (
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
              {item.isDirectory ? <RightOutlined /> : <ProfileOutlined />}
              <div className={styles.cfile}>{item.data}</div>
            </div>
          </Tooltip>
        ))}
      </div>
    );
  },
);
