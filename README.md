# TypeScript Redis clone
A Redis clone built with TypeScript and Deno, designed to implement core Redis commands and functionalities. This project serves as an educational tool for exploring the underlying mechanics of Redis. Note: it is not intended as a production-ready Redis replacement.

## Run the server
```shell
deno --allow-net main.ts
```

## Usage
You can interact with the server using the redis-cli.

### PING
```shell
> redis-cli PING
  PONG
```

### ECHO
```shell
> redis-cli ECHO test123
  test123
```

### SET
```shell
> redis-cli SET fruit kiwi
  OK
```

### GET
```shell
> redis-cli GET fruit
  kiwi

> redis-cli GET veg
  (nil)
```

### SET with expiraton
```shell
> redis-cli SET fruit kiwi 100
  OK
> redis-cli GET fruit
  kiwi

# after some time
> redis-cli GET fruit
  (nil)
```




