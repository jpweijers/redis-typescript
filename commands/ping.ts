export const ping = async (conn: Deno.Conn): Promise<void> => {
  await conn.write(new TextEncoder().encode("+PONG\r\n"));
};
