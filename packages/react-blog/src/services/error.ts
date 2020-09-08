type Case<T> = [T, (error: Error) => void];

export function when(error: Error, cases: Case<new (message?: string) => Error>[]) {
  const option = cases.find(([errorType]) => error instanceof errorType);

  if (option) {
    option[1](error as InstanceType<typeof option[0]>);
  } else {
    throw error;
  }
}
