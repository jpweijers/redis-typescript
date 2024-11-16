import { parseRESP } from "./resp-parser.ts";

const PORT = 6379;

const listener = Deno.listen({ port: PORT });

for await (const conn of listener) {
  handleConnection(conn);
}

async function handleConnection(conn: Deno.Conn) {
  const buffer = new Uint8Array(1024);
  const readBytes = await conn.read(buffer);

  const parsedData = parseRESP(buffer.subarray(0, readBytes ?? 0));
  const [command, ...args] = parsedData as string[];

  switch (command.toUpperCase()) {
    case "PING":
      await conn.write(new TextEncoder().encode("+PONG\r\n"));
      break;
    default:
      await conn.write(new TextEncoder().encode("-ERR unknown command\r\n"));
  }

  conn.close();
}
