export async function readResponse(conn: Deno.Conn): Promise<string> {
  const buffer = new Uint8Array(1024);
  const readBytes = await conn.read(buffer);
  return new TextDecoder().decode(buffer.subarray(0, readBytes ?? 0));
}
