import { type Result, post, put, get } from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(data?: any): Promise<Result<T>> {
  return post("/member/order/page", data);
}
/**
 * 发货
 * @param query .
 * @returns .
 */
export function send<T>(data?: any): Promise<Result<T>> {
  return post("/member/order/send", data);
}