import { type Result, post, put ,get} from "../base";

/**
 * 列表查询
 * @param query .
 * @returns .
 */
export function queryPage<T>(data?: any): Promise<Result<T>> {
  return post("/member/user/page", data);
}

export function updateLevel<T>(data?: any): Promise<Result<T>> {
  return post("/user/updateUserLevel", data);
}
export function updateUserActivate<T>(data?: any): Promise<Result<T>> {
  return post("/user/updateUserActivate", data);
}