export const echo = async (conn: Deno.Conn, args: string[]): Promise<void> => {
  await conn.write(
    new TextEncoder().encode(`$${args[0].length}\r\n${args[0]}\r\n`),
  );
};
