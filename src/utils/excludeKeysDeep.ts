type DeepOmit<O, K> = {
  [Key in Exclude<keyof O, K>]: O[Key] extends object ? DeepOmit<O[Key], K> : O[Key];
};

export function omitDeep<O extends object, K extends string>(object: O, objectkeys: K[]): DeepOmit<O, K> {
  for (const iterator of Object.keys(object)) {
  }

  return object;
}

const a = omitDeep({ name: 'Kadir', age: 21 }, ['name', 'bruh']);
