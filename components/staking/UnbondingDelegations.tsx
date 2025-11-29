import { useMemo, useState } from 'react';
import { Text } from '@interchain-ui/react';
import { ChainName } from 'cosmos-kit';

import UnbondingDelegationsList from './UnbondingDelegationsList';
import { CancelUnbondingModal } from './CancelUnbondingModal';
import { type ParsedUnbondingDelegations, type ExtendedValidator } from '@/utils';
import { Prices, useDisclosure } from '@/hooks';

export const UnbondingDelegations = ({
  unbondingDelegations,
  allValidators,
  chainName,
  logos,
  updateData,
  prices,
}: {
  unbondingDelegations: ParsedUnbondingDelegations;
  allValidators: ExtendedValidator[];
  chainName: ChainName;
  logos: {
    [key: string]: string;
  };
  updateData: () => void;
  prices: Prices;
}) => {
  const [selectedEntry, setSelectedEntry] =
    useState<ParsedUnbondingDelegations[0]>();

  const cancelModalControl = useDisclosure();

  const validatorsMap = useMemo(() => {
    return allValidators.reduce(
      (acc, validator) => {
        acc[validator.address] = {
          name: validator.name,
          jailed: validator.jailed,
        };
        return acc;
      },
      {} as { [key: string]: { name: string; jailed: boolean } }
    );
  }, [allValidators]);

  if (unbondingDelegations.length === 0) {
    return null;
  }

  return (
    <>
      <Text
        color="$textSecondary"
        fontSize="$lg"
        fontWeight="$semibold"
        attributes={{ mt: '$14', mb: '$6' }}
      >
        Unbonding Delegations
      </Text>

      <UnbondingDelegationsList
        unbondingDelegations={unbondingDelegations}
        chainName={chainName}
        logos={logos}
        validatorsMap={validatorsMap}
        openCancelModal={cancelModalControl.onOpen}
        setSelectedEntry={setSelectedEntry}
      />

      {selectedEntry && cancelModalControl.isOpen && (
        <CancelUnbondingModal
          unbondingEntry={selectedEntry}
          validatorName={
            validatorsMap[selectedEntry.validatorAddress]?.name ||
            selectedEntry.validatorAddress
          }
          logoUrl={logos[selectedEntry.validatorAddress]}
          chainName={chainName}
          modalControl={cancelModalControl}
          updateData={updateData}
          prices={prices}
        />
      )}
    </>
  );
};
