// این تابع برای اپدیت کردن دیتا ها می باشد که اگر اون دیتا تغیر کرده بود در نظر بگیره و اگر تغیری نکرده بود دیتای قبلی را در نظر میگیره.
export function mergeUpdateData<T>(newData: Partial<T>, oldData: T): T {
  const result = { ...oldData };

  for (const key in newData) {
    if (newData[key]) {
      (result as any)[key] = newData[key];
    }
  }

  return result;
}
