const PORT = 6379;

const listener = Deno.listen({ port: PORT });

for await (const conn of listener) {
  handleConnection(conn);
}

type RESPData = string | number | null | RESPData[];

function parseRESP(buffer: Uint8Array): RESPData {
  const lines = new TextDecoder().decode(buffer).split("\r\n");

  let i = 0;

  const parse = (): RESPData => {
    const line = lines[i++];
    if (!line) throw new Error("Invalid RESP");

    const type = line[0];
    const content = line.slice(1);

    switch (type) {
      case "+":
        return content;
      case ":":
        return parseInt(content);
      case "$":
        return parseBulkString(parseInt(content, 10));
      case "*":
        return parseArray(parseInt(content, 10));
      default:
        throw new Error("Invalid input");
    }
  };

  const parseBulkString = (length: number) => {
    if (length === -1) return null;
    const bulkString = lines[i++];
    if (bulkString.length !== length) throw new Error("Invalid input");
    return bulkString.toLowerCase();
  };

  const parseArray = (length: number): RESPData[] => {
    const res = [];
    for (let j = 0; j < length; j++) {
      res.push(parse());
    }
    return res;
  };

  return parse();
}

async function handleConnection(conn: Deno.Conn) {
  const buffer = new Uint8Array(1024);
  const readBytes = await conn.read(buffer);

  const parsedData = parseRESP(buffer.subarray(0, readBytes ?? 0));
  const [command, ...args] = parsedData as string[];

  console.log(command, args);

  conn.close();
}
