import { type Result, get,post } from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(query?: any): Promise<Result<T>> {
  return get("/crowdf/page", query);
}
/**
 * 查询配置
 * @param query .
 * @returns .
 */
export function getConfig<T>(query?: any): Promise<Result<T>> {
  return get("/crowdf/getConfig", query);
}
/**
 * 设置增长比例
 * @param query .
 * @returns .
 */
export function setIncreaseRate<T>(query?: any): Promise<Result<T>> {
  return post("/crowdf/setIncreaseRate", query);
}
/**
 * 设置首期比例 1-10000
 * @param query .
 * @returns .
 */
export function setInitRate<T>(query?: any): Promise<Result<T>> {
  return post("/crowdf/setInitRate", query);
}
