/**
 * 选项
 */
export interface SelectOption<T> {
  label: string;
  value: T;
}
export interface SelectOptionMap<T> {
  [key: string | number]: T;
}
/**
 * 菜单类型
 */
export const MenuTypeOptions: SelectOption<number>[] = [
  { label: "目录", value: 0 },
  { label: "菜单", value: 1 },
  { label: "权限", value: 2 }
];
export const MenuTypeMap: SelectOptionMap<string> = {
  0: "目录",
  1: "菜单",
  2: "权限"
};

/**
 * 状态
 */
export const enableOptions: SelectOption<number>[] = [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 }
];
export const enableMap: SelectOptionMap<string> = {
  1: "启用",
  0: "禁用"
};
export const enableBooleanMap: SelectOptionMap<boolean> = {
  1: true,
  0: false
};

export const ifEnableOptions: SelectOption<boolean>[] = [
  { label: "启用", value: true },
  { label: "禁用", value: false }
];

export const ifNumberOptions: SelectOption<number>[] = [
  { label: "是", value: 1 },
  { label: "否", value: 0 }
];

export const ifOptions: SelectOption<boolean>[] = [
  { label: "是", value: true },
  { label: "否", value: false }
];
/**
 * 系统配置类型
 */
export const configTypeOptions: SelectOption<number>[] = [
  { label: "系统配置", value: 1 },
  { label: "业务配置", value: 2 }
];

export const configTypeMap: SelectOptionMap<string> = {
  1: "系统配置",
  2: "业务配置"
};

export const userStatusOptions: SelectOption<number>[] = [
  { label: "正常", value: 1 },
  { label: "禁用", value: 2 }
];

export const statusOptions: SelectOption<number>[] = [
  { label: "处理中", value: 0 },
  { label: "成功", value: 1 },
  { label: "失败", value: 2 }
];

export const statusMap: SelectOptionMap<string> = {
  0: "处理中",
  1: "成功",
  2: "失败"
};

export const levelOptions: SelectOption<number>[] = [
  { label: "无", value: 0 },
  { label: "小节点", value: 1 },
  { label: "大节点", value: 2 },
  { label: "超级节点", value: 3 },
  { label: "社区节点", value: 4 }
];
export const userLevelOptions: SelectOption<number>[] = [
  { label: "无", value: 0 },
  { label: "F1", value: 1 },
  { label: "F2", value: 2 },
  { label: "F3", value: 3 },
  { label: "F4", value: 4 },
  { label: "F5", value: 5 },
  { label: "F6", value: 6 },
  { label: "F7", value: 7 },
  { label: "F8", value: 8 }
];
export const userlevelMap: SelectOptionMap<string> = {
  0: "无",
  1: "F1",
  2: "F2",
  3: "F3",
  4: "F4",
  5: "F5",
  6: "F6"
};
export const levelMap: SelectOptionMap<string> = {
  0: "无",
  1: "小节点",
  2: "大节点",
  3: "超级节点",
  4: "社区节点"
};
export const userTypeMap: SelectOptionMap<string> = {
  0: "普通",
  1: "安品商家",
  2: "优品区",
  3: "臻品区"
};
export const pledgeMap: SelectOptionMap<string> = {
  1: "正常",
  2: "结束"
};
export const coinTypeMap: SelectOptionMap<string> = {
  1: "usdt",
  2: "usd",
  3: "tusd",
  4: "tax",
  5: "积分"
};

export const bizTypeMap: SelectOptionMap<string> = {
  1: "积分释放",
  2: "购买商品",
  3: "提现",
  4: "质押",
  5: "赎回",
  6: "质押收益",
  7: "卖出商品",
  8: "团队加速",
  9: "平级加速",
  10: "直推",
  11: "间推"
};
export const orderMap: SelectOptionMap<string> = {
  1: "已购买",
  2: "已发货",
  3: "已完成"
};
export const payTypeMap: SelectOptionMap<string> = {
  1: "usdt",
  2: "usd",
  3: "tusd"
};
export const classifyMap: SelectOptionMap<string> = {
  1: "安品区",
  2: "优品区",
  3: "臻品区",
  4: "兑换区"
};