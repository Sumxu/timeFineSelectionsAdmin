import { type Result, post } from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(query?: any): Promise<Result<T>> {
  return post("/member/claim/page", query);
}
