import { RawTransaction, RPC, Cell } from "@ckb-lumos/lumos";
import zip from "lodash.zip";
import { BI } from "@ckb-lumos/bi";

export type TransactionResolveResult = {
  inputs: Cell[];
  outputs: Cell[];
  transactionFee: BI;
};

export async function resolveRawTransaction(
  rawTransaction: RawTransaction,
  RPCUrl: string
): Promise<TransactionResolveResult> {
  const rpc = new RPC(RPCUrl);
  const inputs: Cell[] = (
    await Promise.all(
      rawTransaction.inputs.map((input) =>
        rpc.getLiveCell(input.previousOutput, true)
      )
    )
  ).map((result) => ({
    data: result.cell.data.content,
    cellOutput: result.cell.output,
  }));

  const inputCapacitySum = inputs.reduce(
    (acc, cur) => acc.add(cur.cellOutput.capacity),
    BI.from(0)
  );

  const outputs: Cell[] = zip(
    rawTransaction.outputs,
    rawTransaction.outputsData
  ).map(([output, data]) => ({
    cellOutput: output!,
    data: data!,
  }));

  const outputCapacitySum = outputs.reduce(
    (acc, cur) => acc.add(cur.cellOutput.capacity),
    BI.from(0)
  );

  return {
    inputs,
    outputs,
    transactionFee: inputCapacitySum.sub(outputCapacitySum),
  };
}
