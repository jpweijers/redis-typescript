import { assertEquals } from "@std/assert/equals";
import { readResponse } from "../test_utils/read_response.ts";
import { MockConn } from "../test_utils/mock_conn.ts";
import { ping } from "./ping.ts";

Deno.test("ping", async () => {
  const conn = new MockConn() as unknown as Deno.Conn;

  ping(conn);
  const response = await readResponse(conn);

  assertEquals(response, "+PONG\r\n");
  conn.close();
});
