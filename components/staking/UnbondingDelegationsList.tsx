import React, { Dispatch, SetStateAction } from 'react';
import {
  ValidatorList,
  ValidatorNameCell,
  ValidatorTokenAmountCell,
  Text,
  Button,
} from '@interchain-ui/react';
import { ChainName } from 'cosmos-kit';
import { getCoin } from '@/config';
import { type ParsedUnbondingDelegations } from '@/utils';

const UnbondingDelegationsList = ({
  unbondingDelegations,
  chainName,
  logos,
  validatorsMap,
  openCancelModal,
  setSelectedEntry,
}: {
  unbondingDelegations: ParsedUnbondingDelegations;
  chainName: ChainName;
  logos: {
    [key: string]: string;
  };
  validatorsMap: {
    [key: string]: { name: string; jailed: boolean };
  };
  openCancelModal: () => void;
  setSelectedEntry: Dispatch<
    SetStateAction<ParsedUnbondingDelegations[0] | undefined>
  >;
}) => {
  const coin = getCoin(chainName);

  const formatCompletionTime = (completionTime: Date | undefined) => {
    if (!completionTime) return 'N/A';

    const now = new Date();
    const completion = new Date(completionTime);
    const diffMs = completion.getTime() - now.getTime();

    if (diffMs <= 0) return 'Completed';

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  };

  return (
    <ValidatorList
      columns={[
        {
          id: 'validator',
          label: 'Validator',
          width: '196px',
          align: 'left',
          render: (entry: ParsedUnbondingDelegations[0]) => {
            const validator = validatorsMap[entry.validatorAddress];
            const getName = () => {
              if (!validator) return entry.validatorAddress.slice(0, 20) + '...';
              if (validator.jailed) return `${validator.name} (JAILED)`;
              return validator.name;
            };

            return (
              <ValidatorNameCell
                validatorName={getName()}
                validatorImg={
                  logos[entry.validatorAddress] !== ''
                    ? logos[entry.validatorAddress]
                    : '/logo_320px.png'
                }
              />
            );
          },
        },
        {
          id: 'amount',
          label: 'Amount',
          width: '160px',
          align: 'right',
          render: (entry: ParsedUnbondingDelegations[0]) => (
            <ValidatorTokenAmountCell
              amount={entry.amount}
              symbol={coin.symbol}
            />
          ),
        },
        {
          id: 'creation-height',
          label: 'Creation Height',
          width: '140px',
          align: 'right',
          render: (entry: ParsedUnbondingDelegations[0]) => (
            <Text fontSize="$sm" fontWeight="$medium">
              {entry.creationHeight?.toString() || 'N/A'}
            </Text>
          ),
        },
        {
          id: 'completion-time',
          label: 'Completion Time',
          width: '160px',
          align: 'right',
          render: (entry: ParsedUnbondingDelegations[0]) => (
            <Text fontSize="$sm" fontWeight="$medium">
              {formatCompletionTime(entry.completionTime)}
            </Text>
          ),
        },
        {
          id: 'action',
          width: '160px',
          align: 'right',
          render: (entry: ParsedUnbondingDelegations[0]) => (
            <Button
              variant="solid"
              intent="tertiary"
              size="sm"
              onClick={() => {
                setSelectedEntry(entry);
                openCancelModal();
              }}
              attributes={{ ml: 'auto' }}
            >
              Cancel
            </Button>
          ),
        },
      ]}
      data={unbondingDelegations}
      tableProps={{
        width: '$full',
      }}
    />
  );
};

export default React.memo(UnbondingDelegationsList);
