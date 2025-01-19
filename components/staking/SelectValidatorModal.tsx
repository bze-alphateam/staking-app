import React, { useMemo } from 'react';
import { ChainName } from 'cosmos-kit';
import {
  Text,
  GridColumn,
  ValidatorNameCell,
  ValidatorTokenAmountCell,
  ValidatorList,
  Button,
  BasicModal,
  Box,
} from '@interchain-ui/react';

import { getCoin } from '@/config';
import { UseDisclosureReturn } from '@/hooks';
import { shiftDigits, type ExtendedValidator as Validator } from '@/utils';

export const SelectValidatorModal = ({
  allValidators,
  chainName,
  logos,
  handleValidatorClick,
  modalControl,
}: {
  allValidators: Validator[];
  chainName: ChainName;
  handleValidatorClick: (validator: Validator) => void;
  modalControl: UseDisclosureReturn;
  logos: {
    [key: string]: string;
  };
}) => {
  const coin = getCoin(chainName);

  const columns = useMemo(() => {
    const hasApr = !!allValidators[0]?.apr;

    const _columns: GridColumn[] = [
      {
        id: 'validator',
        label: 'Validator',
        width: '196px',
        align: 'left',
        render: (validator: Validator) => (
            <ValidatorNameCell
                validatorName={validator.name}
                validatorImg={logos[validator.address]}
            />
        ),
      },
      {
        id: 'voting-power',
        label: 'Voting Power',
        width: '196px',
        align: 'right',
        render: (validator: Validator) => (
            <>
              <ValidatorTokenAmountCell
                  amount={validator.votingPower}
                  symbol={coin.symbol}
              />
              <Text fontWeight="$hairline">
                Commission: {shiftDigits(validator.commission, 2)}%
              </Text>
              {hasApr && <Text fontWeight="$hairline">APR {validator.apr}%</Text>}
            </>
        ),
      },
      {
        id: 'action',
        width: '126px',
        align: 'right',
        render: (validator) => (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            pr="$8"
          >
            <Button
              size="sm"
              intent="secondary"
              variant="solid"
              onClick={() => handleValidatorClick(validator)}
            >
              Select
            </Button>
          </Box>
        ),
      },
    ];

    return _columns;
  }, [chainName]);

  return (
    <BasicModal
      title="Redelegate to"
      isOpen={modalControl.isOpen}
      onClose={modalControl.onClose}
    >
      <Box
        width={{ mobile: '$auto', tablet: '$containerMd' }}
        maxHeight={"450px"}
        overflowY="scroll"
      >
        <ValidatorList
          columns={columns}
          data={allValidators}
          tableProps={{ width: '100%' }}
          variant="ghost"
        />
      </Box>
    </BasicModal>
  );
};
