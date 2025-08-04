### Create

- npx @move.box/ts-gc-viem@latest create

### Start

#### Dev

- Run dev 

```
npm install
npm run dev
```

- [view status](http://localhost:8899)
- [view latest block](http://localhost:8899/eth/latest_block)

### Demo API

- /eth/batch/metadata

```
POST
tokens: string[]
```

- /eth/batch/iscontract

```
POST
addresses: string[]
```


#### Prod

- npm run start

#### Deploy with docker


```
docker-compose build
docker-compose up -d
```