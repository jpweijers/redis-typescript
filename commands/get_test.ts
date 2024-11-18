import { assertEquals } from "@std/assert";
import DATA_STORE from "../data_store/data_store.ts";
import { get } from "./get.ts";
import { readResponse } from "../test_utils/read_response.ts";
import { MockConn } from "../test_utils/mock_conn.ts";

Deno.test("get", async (t) => {
  const conn = new MockConn() as unknown as Deno.Conn;

  await t.step("wrong number of arguments", async () => {
    const args: string[] = [];

    get(conn, args);
    const response = await readResponse(conn);

    assertEquals(response, "-ERR wrong number of arguments\r\n");
  });

  await t.step("key not found", async () => {
    const args = ["key"];

    get(conn, args);
    const response = await readResponse(conn);

    assertEquals(response, "$-1\r\n");
  });

  await t.step("key expired", async () => {
    const args = ["key"];
    DATA_STORE["key"] = { value: "value", expireAt: Date.now() - 1 };

    get(conn, args);
    const response = await readResponse(conn);

    assertEquals(response, "$-1\r\n");
  });

  await t.step("key found", async () => {
    const args = ["key"];
    DATA_STORE["key"] = { value: "value", expireAt: undefined };

    get(conn, args);
    const response = await readResponse(conn);

    assertEquals(response, "$5\r\nvalue\r\n");
  });

  conn.close();
});
