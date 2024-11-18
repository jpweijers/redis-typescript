import { startServer, stopServer, PORT } from "./main.ts";

Deno.test("REDIS", async (t) => {
  startServer();

  await t.step("send command", async () => {
    const conn = await Deno.connect({ port: PORT });

    await conn.write(new TextEncoder().encode("*1\r\n$4\r\nPING\r\n"));

    conn.close();
  });

  await t.step("send empty command", async () => {
    const conn = await Deno.connect({ port: PORT });

    await conn.write(new TextEncoder().encode(""));

    conn.close();
  });

  stopServer();
});
