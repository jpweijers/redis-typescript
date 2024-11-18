import { assertEquals } from "@std/assert/equals";
import { MockConn } from "../test_utils/mock_conn.ts";
import { readResponse } from "../test_utils/read_response.ts";
import { handleCommand } from "./main.ts";
import DATA_STORE from "../data_store/data_store.ts";

Deno.test("Command handler", async (t) => {
  const conn = new MockConn() as unknown as Deno.Conn;

  await t.step("PING command", async () => {
    handleCommand(conn, "PING", []);
    const response = await readResponse(conn);
    assertEquals(response, "+PONG\r\n");
  });

  await t.step("ECHO command", async () => {
    handleCommand(conn, "ECHO", ["hello"]);
    const response = await readResponse(conn);
    assertEquals(response, "$5\r\nhello\r\n");
  });

  await t.step("SET command", async () => {
    handleCommand(conn, "SET", ["key", "value"]);
    const response = await readResponse(conn);
    assertEquals(response, "+OK\r\n");
  });

  await t.step("GET command", async () => {
    handleCommand(conn, "GET", ["key"]);
    DATA_STORE["key"] = { value: "value" };
    const response = await readResponse(conn);
    assertEquals(response, "$5\r\nvalue\r\n");
  });

  await t.step("Unknown command", async () => {
    handleCommand(conn, "UNKNOWN", []);
    const response = await readResponse(conn);
    assertEquals(response, "-ERR unknown command\r\n");
  });

  conn.close();
});
