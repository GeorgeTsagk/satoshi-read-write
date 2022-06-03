# satoshi-read-write

This project mainly serves as a demonstration to the `DataSig` and `DataStruct` specs that are about to be proposed to the BLIP repo of Lightning.

# Usage

Rename `config.sample.yaml` to `config.yaml` and fill in the URL, macaroon path and TLS path for your LND.

Choose a TLV key over which data will be transmitted by defining a uint64 number that must be odd and bigger than 65536.

Receiver must also use the same TLV key for data.

## Commands

Currently there is only one command

```
speak <address> <string>
```

Which sends the message `<string>` to node with `<address>` over the TLV defined in the configuration file.