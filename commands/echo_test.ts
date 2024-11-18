import { assertEquals } from "@std/assert";
import { echo } from "./echo.ts";
import { MockConn } from "../test_utils/mock_conn.ts";
import { readResponse } from "../test_utils/read_response.ts";

Deno.test("echo command", async () => {
  const conn = new MockConn();
  const args = ["Hello"];

  echo(conn as unknown as Deno.Conn, args);
  const response = await readResponse(conn as unknown as Deno.Conn);

  assertEquals(response, "$5\r\nHello\r\n");
  conn.close();
});
