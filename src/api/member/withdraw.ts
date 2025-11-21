import { type Result,get,post} from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(query?: any): Promise<Result<T>> {
  return get("/userRecord/withdrawRecord", query);
}
export function withdraw<T>(query?: any): Promise<Result<T>> {
  return post("/userRecord/withdraw", query);
}
