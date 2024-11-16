import { parseRESP } from "./resp-parser.ts";

const PORT = 6379;

const dataStore: Record<string, string> = {};

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
    case "ECHO":
      await conn.write(
        new TextEncoder().encode(`$${args[0].length}\r\n${args[0]}\r\n`),
      );
      break;
    case "SET": {
      const [arg1, arg2] = args;
      if (!arg1 || !arg2) {
        await conn.write(
          new TextEncoder().encode("-ERR wrong number of arguments\r\n"),
        );
        break;
      }
      dataStore[arg1] = arg2;
      await conn.write(new TextEncoder().encode("+OK\r\n"));
      break;
    }
    case "GET":
      {
        const [arg1] = args;
        if (!arg1) {
          await conn.write(
            new TextEncoder().encode("-ERR wrong number of arguments\r\n"),
          );
          break;
        }
        const value = dataStore[arg1];
        const response = value ? new TextEncoder().encode(`$${value.length}\r\n${value}\r\n`) : new TextEncoder().encode("$-1\r\n");
        await conn.write(response);
      }
      break;
    default:
      await conn.write(new TextEncoder().encode("-ERR unknown command\r\n"));
  }

  conn.close();
}
