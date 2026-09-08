import {
  ApolloServerPlugin,
  GraphQLRequestContextDidResolveOperation,
} from '@apollo/server';
import {
  DocumentNode,
  GraphQLError,
  Kind,
  OperationDefinitionNode,
} from 'graphql';
import {
  ComplexityEstimatorArgs,
  fieldExtensionsEstimator,
  getComplexity,
} from 'graphql-query-complexity';

const MAXIMUM_COMPLEXITY = 150;

export function listComplexity(nestedFactor: number) {
  return ({ args, childComplexity }: ComplexityEstimatorArgs) =>
    Math.min(Number(args.pageSize ?? 10), 50) + childComplexity * nestedFactor;
}

const additiveEstimator = ({ childComplexity }: { childComplexity: number }) =>
  childComplexity + 1;

function isIntrospectionOperation(
  document: DocumentNode,
  operationName?: string,
): boolean {
  const definition = document.definitions.find((node) => {
    if (node.kind !== Kind.OPERATION_DEFINITION) return false;
    if (!operationName) return true;
    const name = node.name?.value;
    return name === operationName;
  }) as OperationDefinitionNode | undefined;
  if (!definition) return false;
  return definition.selectionSet.selections.some(
    (selection) =>
      selection.kind === Kind.FIELD &&
      (selection.name.value === '__schema' ||
        selection.name.value === '__type'),
  );
}

export const complexityPlugin: ApolloServerPlugin = {
  // eslint-disable-next-line @typescript-eslint/require-await
  async requestDidStart() {
    return {
      // eslint-disable-next-line @typescript-eslint/require-await
      async didResolveOperation({
        request,
        document,
        schema,
      }: GraphQLRequestContextDidResolveOperation<Record<string, unknown>>) {
        if (
          isIntrospectionOperation(document, request.operationName ?? undefined)
        ) {
          return;
        }
        const complexity = getComplexity({
          schema,
          query: document,
          operationName: request.operationName ?? undefined,
          variables: request.variables,
          estimators: [fieldExtensionsEstimator(), additiveEstimator],
        });
        if (complexity > MAXIMUM_COMPLEXITY) {
          throw new GraphQLError(
            `Слишком сложный запрос: сложность ${complexity} превышает лимит ${MAXIMUM_COMPLEXITY}.`,
          );
        }
      },
    };
  },
};
