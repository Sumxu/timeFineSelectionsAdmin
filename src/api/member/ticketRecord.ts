import { type Result,get} from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(query?: any): Promise<Result<T>> {
  return get("/userRecord/ticketRecord", query);
}