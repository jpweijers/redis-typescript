export class MockConn {
  private data: Uint8Array = new Uint8Array();

  public read(buffer: Uint8Array): Promise<number | null> {
    buffer.set(this.data);
    return Promise.resolve(this.data.length);
  }

  public write(data: Uint8Array): void {
    this.data = data;
  }

  public close(): void {}
}
