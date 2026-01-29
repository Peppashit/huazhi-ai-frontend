// utils/formatTime.ts (或者直接写在 setup 里)

export const formatRelativeTime = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const date = new Date(timestamp);

  // 1. 一分钟内 -> 显示 "刚刚"
  if (diff < 60 * 1000) {
    return '刚刚';
  }

  // 2. 一小时内 -> 显示 "xx分钟前"
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟前`;
  }

  // 3. 今天内 -> 显示 "14:30"
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${mins}`;
  }

  // 4. 昨天 -> 显示 "昨天"
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return '昨天';
  }

  // 5. 更早 -> 显示 "12-24" (月-日)
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${month}-${day}`;
};