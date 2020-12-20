export default [
  {
    path: "/editor",
    name: "editor",
    icon: "smile",
    component: '../layouts/basic',
    layout: {
      hideMenu: true,
      hideNav: true,
      hideFooter: true,
    },
    routes: [
      {
        path: "/editor/",
        component: './editor/index',
      }
    ]
    
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/admin',
    name: 'admin',
    icon: 'crown',
    access: 'canAdmin',
    component: './Admin',
    routes: [
      {
        path: '/admin/sub-page',
        name: 'sub-page',
        icon: 'smile',
        component: './Welcome',
      },
    ],
  },
  {
    name: 'list.table-list',
    icon: 'table',
    path: '/list',
    component: './ListTableList',
  },
  {
    path: '/',
    component: '../layouts/basic',
    redirect: '/editor',
  },
  {
    component: './404',
  },
];
