import React from 'react';
import { Button, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

import styles from './index.less';

export default React.memo(
  (props): React.ReactNode => {
    const { refresh, saveFile, restart, openCreate, saving, reloading } = props;
    return (
      <div className={styles.toolbar}>
        <Tooltip title="刷新列表">
          <Button type="primary" onClick={refresh} icon={<ReloadOutlined />} />
        </Tooltip>
        <Button type="primary" loading={saving} onClick={saveFile}>
          保存
        </Button>
        <Button type="primary" loading={reloading} onClick={restart}>
          重启nginx
        </Button>
        <Button onClick={openCreate}>新建文件</Button>
      </div>
    );
  },
);
