import { ethers } from "ethers";
/**
 * 格式化钱包地址
 * @param addr 钱包地址
 * @param prefixLen 前缀长度，默认 7
 * @param suffixLen 后缀长度，默认 4
 * @returns 格式化后的地址，例如：0x1234567....abcd
 */
export function formatAddress(
  addr?: string,
  prefixLen = 7,
  suffixLen = 4
): string {
  if (!addr) return "";
  return addr.slice(0, prefixLen) + "...." + addr.slice(-suffixLen);
}

/**
 * 检查是否是有效的以太坊地址
 * @param addr 钱包地址
 * @returns 如果是有效地址返回 true，否则 false
 */
export function isValidAddress(addr?: string): boolean {
  if (!addr) return false;
  return ethers.isAddress(addr);
}

/**
 * 将 wei 转为 Ether 或代币单位
 * @param value 要转换的值，可以是 string | number | BigInt
 * @param decimals 小数位数，默认 18（Ether）
 * @param fixed 是否固定小数位，默认 true
 * @returns 格式化后的数字字符串
 */
export function fromWei(
  value: string | number | bigint,
  decimals = 18,
  fixed = true
): string {
  if (value === undefined || value === null) return "0";
  try {
    const etherValue = ethers.formatUnits(value.toString(), decimals);
    return fixed ? Number(etherValue).toFixed(4) : etherValue;
  } catch (error) {
    console.error("fromWei 转换失败:", error);
    return "0";
  }
}

/**
 * 将 Ether 或代币单位转换为最小单位（wei）
 * @param value 要转换的值，可以是 string | number | BigInt
 * @param decimals 小数位数，默认 18（Ether）
 * @returns BigInt 类型的最小单位值
 */
export function toWei(value: string | number | bigint, decimals = 18): bigint {
  if (value === undefined || value === null) return 0n;
  try {
    // ethers.parseUnits 会返回 BigInt
    return ethers.parseUnits(value.toString(), decimals);
  } catch (error) {
    console.error("toWei 转换失败:", error);
    return 0n;
  }
}

/**
 * 通用合约调用器
 * @param providerOrSigner ethers.Provider | ethers.Signer
 * @param method 方法名 (ABI 中定义的)
 * @param args 参数数组 (按顺序传)
 * @returns 调用返回结果
 */
export async function callContractMethod(
  address: string,
  abi: any[],
  method: string,
  args: any[] = [],
  write: boolean = false
): Promise<any> {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });
  if (!accounts || accounts.length === 0) {
    console.warn("未检测到账户，请在 MetaMask 中登录");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);

  const contract = write
    ? new ethers.Contract(address, abi, await provider.getSigner())
    : new ethers.Contract(address, abi, provider);

  console.log(args);
  const result = await (contract as any)[method](...args);
  console.log("result===",result)
  // 如果是写操作，返回 tx.wait() 结果
  if (write) {
    return await result.wait?.();
  }

  return result;
}
/*
 **
 * 通用余额查询（支持 BNB & ERC20）
 * @param address 要查询余额的地址
 * @param tokenAddress 可选，ERC20 合约地址（为空则查 BNB）
 * @returns BigNumber（单位：wei）
 */
export async function getBalance(address: string, tokenAddress?: string) {
  if (!window.ethereum) throw new Error("MetaMask 未连接");
  const provider = new ethers.BrowserProvider(window.ethereum);

  // 🪙 如果没传 tokenAddress，则查询原生 BNB 余额
  if (!tokenAddress) {
    const balance = await provider.getBalance(address);
    return balance; // BigNumber，单位 wei
  }

  // 🧩 查询 ERC20 Token 余额
  const erc20Abi = [
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
  ];

  const tokenContract = new ethers.Contract(tokenAddress, erc20Abi, provider);
  const balance = await tokenContract.balanceOf(address);

  return balance; // BigNumber，单位 token 的最小精度
}
export function formatDate(dateString) {
  // 解析 ISO 格式的日期字符串
  const date = new Date(dateString);

  // 获取日期部分：MM/DD/YYYY
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从 0 开始，所以加 1
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  const formattedDate = `${month}/${day}/${year}`;

  // 获取时间部分：HH:mm:ss
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const formattedTime = `${hours}:${minutes}:${seconds}`;
  // 返回包含日期和时间的对象
  return {
    date: formattedDate,
    time: formattedTime,
    dateTime: formattedDate + " " + formattedTime
  };
}

//bigNumber加法
export function BigNumberAdd(big1: BigInt, big2: BigInt){
  return BigInt(big1) + BigInt(big2);
};
