import DATA_STORE from "../data_store/data_store.ts";

export const get = async (conn: Deno.Conn, args: string[]): Promise<void> => {
  const [arg1] = args;
  if (!arg1) {
    await conn.write(
      new TextEncoder().encode("-ERR wrong number of arguments\r\n"),
    );
    return;
  }
  const { value, expireAt } = DATA_STORE[arg1] ?? {};
  if (!value) {
    await conn.write(new TextEncoder().encode("$-1\r\n"));
  } else if (expireAt && expireAt < Date.now()) {
    delete DATA_STORE[arg1];
    await conn.write(new TextEncoder().encode("$-1\r\n"));
  } else {
    const response = new TextEncoder().encode(
      `$${value.length}\r\n${value}\r\n`,
    );
    await conn.write(response);
  }
};
