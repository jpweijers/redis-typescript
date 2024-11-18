import { handleCommand } from "./commands/main.ts";
import { parseRESP } from "./resp/resp_parser.ts";

export const PORT = 6379;

let listener: Deno.Listener;

export async function startServer() {
  listener = Deno.listen({ port: PORT });

  for await (const conn of listener) {
    await handleConnection(conn);
    conn.close();
  }
}

export function stopServer() {
  listener.close();
}

async function handleConnection(conn: Deno.Conn) {
  const buffer = new Uint8Array(1024);
  const readBytes = await conn.read(buffer);

  if (!readBytes) {
    return;
  }

  const parsedData = parseRESP(buffer.subarray(0, readBytes));
  const [command, ...args] = parsedData as string[];

  await handleCommand(conn, command, args);
}

if (import.meta.main) {
  await startServer();
}
