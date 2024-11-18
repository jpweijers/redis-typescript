import { assertEquals } from "@std/assert/equals";
import DATA_STORE from "../data_store/data_store.ts";
import { MockConn } from "../test_utils/mock_conn.ts";
import { set } from "./set.ts";
import { readResponse } from "../test_utils/read_response.ts";
import { assertGreaterOrEqual } from "@std/assert/greater-or-equal";

Deno.test("set", async (t) => {
  const conn = new MockConn() as unknown as Deno.Conn;

  await t.step("wrong number of arguments", async () => {
    const args: string[] = [];

    set(conn, args);
    const response = await readResponse(conn);

    assertEquals(response, "-ERR wrong number of arguments\r\n");
  });

  await t.step("set key", async () => {
    const args = ["key", "value"];

    set(conn, args);
    const response = await readResponse(conn);

    assertEquals(response, "+OK\r\n");
    assertEquals(DATA_STORE["key"], { value: "value", expireAt: undefined });
  });

  await t.step("set key with expiration", async () => {
    const args = ["key", "value", "1000"];
    const now = Date.now();

    set(conn, args);
    const response = await readResponse(conn);

    assertEquals(response, "+OK\r\n");
    assertGreaterOrEqual(DATA_STORE["key"].expireAt, now + 1000);
  });

  conn.close();
});
