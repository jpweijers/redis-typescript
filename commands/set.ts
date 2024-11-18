import DATA_STORE from "../data_store/data_store.ts";

export const set = async (conn: Deno.Conn, args: string[]): Promise<void> => {
  const [arg1, arg2, arg3] = args;
  if (!arg1 || !arg2) {
    await conn.write(
      new TextEncoder().encode("-ERR wrong number of arguments\r\n"),
    );
    return;
  }
  const expireAt = arg3 ? Date.now() + parseInt(arg3) : undefined;
  DATA_STORE[arg1] = { value: arg2, expireAt };
  await conn.write(new TextEncoder().encode("+OK\r\n"));
};
