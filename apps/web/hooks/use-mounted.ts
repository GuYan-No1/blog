import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * 判断当前是否已完成客户端挂载
 * 服务端始终返回 false，客户端始终返回 true
 * 用于避免水合不匹配，替代 useEffect + setState 的写法
 */
export function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
