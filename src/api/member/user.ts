import { type Result, post, put ,get} from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(query?: any): Promise<Result<T>> {
  return get("/user/page", query);
}

export function updateLevel<T>(data?: any): Promise<Result<T>> {
  return post("/user/updateUserLevel", data);
}
export function updateUserActivate<T>(data?: any): Promise<Result<T>> {
  return post("/user/updateUserActivate", data);
}