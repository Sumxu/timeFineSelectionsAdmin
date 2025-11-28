interface ContractMap {
  FactoryContract: string;
  Store_Address: string;
  Usdt_Address: string;
  BnB_Withdraw_Address: string;
  BnB_Address: string;
  Crowd_Funding_Address: string;
}

// 开发环境合约（测试网）
const devContract: ContractMap = {
  FactoryContract: "0x7F652Ef3416fCaf4cA88AB42A950E30bFdC8E797",
  Store_Address: "0x87663d59f95ed4689D74733206b04806477e82b3",
  Usdt_Address: "0x55d398326f99059fF775485246999027B3197955",
  BnB_Withdraw_Address: "0x99ad17227797c49cef44b8f975247cfc5828eb86",
  BnB_Address: "0x6409d5db26cf6fb0674a98c4f1b6865915c3efc5",
  Crowd_Funding_Address: "0xFE4951A0988AF8eCB3e2Fed6A324DF2A3588505e"
};
// 生产环境合约（主网）
const prodContract: ContractMap = {
  FactoryContract: "0x7F652Ef3416fCaf4cA88AB42A950E30bFdC8E797",
  Store_Address: "0x87663d59f95ed4689D74733206b04806477e82b3",
  Usdt_Address: "0x55d398326f99059fF775485246999027B3197955",
  BnB_Withdraw_Address: "0x99ad17227797c49cef44b8f975247cfc5828eb86",
  BnB_Address: "0x6409d5db26cf6fb0674a98c4f1b6865915c3efc5",
  Crowd_Funding_Address: "0xFE4951A0988AF8eCB3e2Fed6A324DF2A3588505e"
};

// 根据环境选择配置
export const contractAddress: ContractMap =
  import.meta.env.MODE === "development" ? devContract : prodContract;
