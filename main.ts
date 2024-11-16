import { parseRESP } from "./resp-parser.ts";

export const PORT = 6379;

interface DataStore {
  [key: string]: { value: string; expireAt: number | undefined };
}

const dataStore: DataStore = {};

let listener: Deno.Listener;

export async function startServer() {
  listener = Deno.listen({ port: PORT });

  for await (const conn of listener) {
    handleConnection(conn);
  }
}

export function stopServer() {
  listener.close();
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
      const [arg1, arg2, arg3] = args;
      if (!arg1 || !arg2) {
        await conn.write(
          new TextEncoder().encode("-ERR wrong number of arguments\r\n"),
        );
        break;
      }
      const expireAt = arg3 ? Date.now() + parseInt(arg3) : undefined;
      dataStore[arg1] = { value: arg2, expireAt };
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
        const { value, expireAt } = dataStore[arg1] ?? {};
        if (!value) {
          await conn.write(new TextEncoder().encode("$-1\r\n"));
        } else if (expireAt && expireAt < Date.now()) {
          delete dataStore[arg1];
          await conn.write(new TextEncoder().encode("$-1\r\n"));
        } else {
          const response = new TextEncoder().encode(
            `$${value.length}\r\n${value}\r\n`,
          );
          await conn.write(response);
        }
      }
      break;
    default:
      await conn.write(new TextEncoder().encode("-ERR unknown command\r\n"));
  }

  conn.close();
}

if (import.meta.main) {
  await startServer();
}
