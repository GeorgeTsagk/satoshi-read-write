# satoshi-read-write

*Send data to other nodes in the Lightning Network.*

This project mainly serves as a demonstration to the `DataSig` and `DataStruct` specs that are about to be proposed to the BLIP repo of Lightning.

# Usage

The receiving node must have `--accept-keysend` enabled in order to accept the spontaneous payments carrying data.

Rename `config.sample.yaml` to `config.yaml` and fill in the URL, macaroon path and TLS path for your LND.

Configure the `tlv_key` for `data_sig` and `data_struct`, this needs to be a `uint64` number that is **odd** and **greater than 65536**.

Note that receiver must also run this application and have **the same keys configured** in order to normally receive data.

Run `npm start`.

## Commands

- `set <address>`: Sets the destination address to transmit data to
- `speak <string>`: Sends the given text to the destination.
- `send <filepath>`: Sends the contents of the file at given path.