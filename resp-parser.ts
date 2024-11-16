type RESPData = string | number | null | RESPData[];

export function parseRESP(buffer: Uint8Array): RESPData {
  const lines = new TextDecoder().decode(buffer).split("\r\n");
  console.log(lines);

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
    return bulkString;
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
