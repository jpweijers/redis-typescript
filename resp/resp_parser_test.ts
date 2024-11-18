import { assertEquals } from "@std/assert/equals";
import { parseRESP } from "./resp_parser.ts";
import { assertThrows } from "@std/assert/throws";

Deno.test("RESP parser", async (t) => {
  await t.step("parses simple string", () => {
    const buffer = new TextEncoder().encode("+OK\r\n");
    const parsed = parseRESP(buffer);
    assertEquals(parsed, "OK");
  });

  await t.step("no valid lines", () => {
    const buffer = new TextEncoder().encode("");
    assertThrows(() => parseRESP(buffer), Error, "Invalid RESP");
  });

  await t.step("parses integer", () => {
    const buffer = new TextEncoder().encode(":1000\r\n");
    const parsed = parseRESP(buffer);
    assertEquals(parsed, 1000);
  });

  await t.step("parses bulk string", () => {
    const buffer = new TextEncoder().encode("$5\r\nhello\r\n");
    const parsed = parseRESP(buffer);
    assertEquals(parsed, "hello");
  });

  await t.step("parses null bulk string", () => {
    const buffer = new TextEncoder().encode("$-1\r\n");
    const parsed = parseRESP(buffer);
    assertEquals(parsed, null);
  });

  await t.step("Fails on invalid bulk string", () => {
    const buffer = new TextEncoder().encode("$6\r\nhello\r\n");
    assertThrows(() => parseRESP(buffer), Error, "Invalid input");
  });

  await t.step("parses array", () => {
    const buffer = new TextEncoder().encode(
      "*2\r\n$5\r\nhello\r\n$5\r\nworld\r\n",
    );
    const parsed = parseRESP(buffer);
    assertEquals(parsed, ["hello", "world"]);
  });

  await t.step("Fails on invalid type", () => {
    const buffer = new TextEncoder().encode("!invalid\r\n");
    assertThrows(() => parseRESP(buffer), Error, "Invalid input");
  });
});
