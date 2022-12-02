
export type ObjectOrArray<X, Y, T extends Y | Y[]> = T extends Y
    ? Promise<X>
    : Promise<PromiseSettledResult<X>[]>;
