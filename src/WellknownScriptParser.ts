import { BI, Cell } from "@ckb-lumos/lumos";
import { Script } from "@ckb-lumos/base";
import { number } from "@ckb-lumos/codec";

type DataParser = (data: string) => string | BI;

/**
 * A parser class for parsing the well-known scripts to human readable type and lock script name.
 * @example
 * ``` typescript
 * const sUDTTypeScript = { codeHash: '0x...', hashType: 'type'};
 * const parser = new WellknownScriptParser();
 * parser.register("simple UDT", sUDTTypeScript, 'sUDT');
 * parser.parse(cell); // => simple UDT
 * ```
 */
export class WellknownScriptNameParser {
  private lockConfig: {
    script: Script;
    name: string;
    dataParser?: DataParser;
  }[] = [];

  register(
    name: string,
    script: Script,
    dataParser: "sUDT" | DataParser | undefined = undefined
  ) {
    this.lockConfig.push({
      name,
      script,
      dataParser:
        dataParser === "sUDT"
          ? (data: string) => number.Uint128LE.unpack(data)
          : dataParser,
    });
  }

  parse(cell: Cell): { lock?: string; type?: string } {
    const lock = cell.cellOutput.lock;
    const type = cell.cellOutput.type;
    const result: { lock?: string; type?: string; data?: string | BI } = {};
    for (const { script, name, dataParser } of this.lockConfig) {
      if (
        script.codeHash === lock.codeHash &&
        script.hashType === lock.hashType
      ) {
        result.lock = name;
      }

      if (
        script.codeHash === type?.codeHash &&
        script.hashType === type.hashType
      ) {
        result.type = name;
        result.data = dataParser?.(cell.data);
      }
    }

    return result;
  }
}
