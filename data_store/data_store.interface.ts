export interface DataStore {
  [key: string]: { value: string; expireAt?: number | undefined };
}
