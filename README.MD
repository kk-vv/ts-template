### Create

- npx @move.box/ts-gc@latest create

### Common Utils

- DataService

```
APIRequest.jsonRequest()
APIService.fetch<T>()
```

- FormatUtils

```

FormatUtils.shitNumber('0.000000000000123') //0.0{12}123
FormatUtils.toTradingViewNumber('0.000000000000123') //0.0₁₂123
```

- ObjectExt

```
JSONSerialize     with bigint
JSONDeserialize   with bigint
...
```