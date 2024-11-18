import { ping } from "./ping.ts";
import { echo } from "./echo.ts";
import { set } from "./set.ts";
import { get } from "./get.ts";

interface Command {
  (conn: Deno.Conn, args: string[]): Promise<void>;
}

export const commands: { [key: string]: Command } = {
  PING: ping,
  ECHO: echo,
  SET: set,
  GET: get,
};

export const handleCommand = async (
  conn: Deno.Conn,
  command: string,
  args: string[],
): Promise<void> => {
  const commandHandler = commands[command.toUpperCase()];
  if (!commandHandler) {
    await conn.write(new TextEncoder().encode("-ERR unknown command\r\n"));
    return;
  }
  await commandHandler(conn, args);
  return;
};
