import { startServer, stopServer, PORT } from "./main.ts";
import { assertEquals } from "@std/assert";

async function readResponse(conn: Deno.Conn): Promise<string> {
  const buffer = new Uint8Array(1024);
  const readBytes = await conn.read(buffer);
  return new TextDecoder().decode(buffer.subarray(0, readBytes ?? 0));
}

Deno.test("REDIS", async (t) => {
  startServer();
  await new Promise((res) => setTimeout(res, 100));

  await t.step("PING", async () => {
    const conn = await Deno.connect({ port: PORT });

    await conn.write(new TextEncoder().encode("*1\r\n$4\r\nPING\r\n"));
    const response = await readResponse(conn);

    assertEquals(response, "+PONG\r\n");
    conn.close();
  });

  await t.step("ECHO", async () => {
    const conn = await Deno.connect({ port: PORT });

    await conn.write(
      new TextEncoder().encode("*2\r\n$4\r\nECHO\r\n$4\r\nTEST\r\n"),
    );
    const response = await readResponse(conn);

    assertEquals(response, "$4\r\nTEST\r\n");
    conn.close();
  });

  await t.step("SET", async () => {
    const conn = await Deno.connect({ port: PORT });

    await conn.write(
      new TextEncoder().encode("*3\r\n$3\r\nSET\r\n$3\r\nfoo\r\n$3\r\nbar\r\n"),
    );
    const response = await readResponse(conn);

    assertEquals(response, "+OK\r\n");
    conn.close();
  });

  await t.step("SET with wrong number of arguments", async () => {
    const conn = await Deno.connect({ port: PORT });

    await conn.write(new TextEncoder().encode("*1\r\n$3\r\nSET\r\n"));
    const response = await readResponse(conn);

    assertEquals(response, "-ERR wrong number of arguments\r\n");
    conn.close();
  });

  await t.step("GET", async () => {
    const conn = await Deno.connect({ port: PORT });

    await conn.write(
      new TextEncoder().encode("*2\r\n$3\r\nGET\r\n$3\r\nfoo\r\n"),
    );
    const response = await readResponse(conn);

    assertEquals(response, "$3\r\nbar\r\n");
    conn.close();
  });

  await t.step("GET with wrong number of arguments", async () => {
    const conn = await Deno.connect({ port: PORT });

    await conn.write(new TextEncoder().encode("*1\r\n$3\r\nGET\r\n"));
    const response = await readResponse(conn);

    assertEquals(response, "-ERR wrong number of arguments\r\n");
    conn.close();
  });

  await t.step("GET with non-existent key", async () => {
    const conn = await Deno.connect({ port: PORT });

    await conn.write(
      new TextEncoder().encode("*2\r\n$3\r\nGET\r\n$3\r\nbaz\r\n"),
    );
    const response = await readResponse(conn);

    assertEquals(response, "$-1\r\n");
    conn.close();
  });

  await t.step("Unknown command", async () => {
    const conn = await Deno.connect({ port: PORT });

    await conn.write(new TextEncoder().encode("*1\r\n$3\r\nERR\r\n"));
    const response = await readResponse(conn);

    assertEquals(response, "-ERR unknown command\r\n");
    conn.close();
  });

  stopServer();
});
