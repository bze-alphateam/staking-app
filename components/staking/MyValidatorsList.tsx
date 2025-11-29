import React from 'react';
import { Dispatch, SetStateAction } from 'react';
import {
  Button,
  ValidatorList,
  ValidatorNameCell,
  ValidatorTokenAmountCell,
} from '@interchain-ui/react';
import { ChainName } from 'cosmos-kit';
import { getCoin } from '@/config';
import { type ExtendedValidator as Validator } from '@/utils';
import BigNumber from "bignumber.js";

const MyValidatorsList = ({
  myValidators,
  openModal,
  chainName,
  logos,
  setSelectedValidator,
}: {
  myValidators: Validator[];
  chainName: ChainName;
  openModal: () => void;
  setSelectedValidator: Dispatch<SetStateAction<Validator | undefined>>;
  logos: {
    [key: string]: string;
  };
}) => {
  const coin = getCoin(chainName);

  const filterValidators = () => {
      return myValidators.filter((validator) => {
          const deleg = new BigNumber(validator.delegation);

          return !deleg.isNaN() && deleg.isPositive() && deleg.isGreaterThanOrEqualTo(0.000001);
      })
  }

  return (
    <ValidatorList
      columns={[
        {
          id: 'validator',
          label: 'Validator',
          width: '196px',
          align: 'left',
          render: (validator: Validator) => {
              const getName = () => {
                  if (validator.jailed) {
                      return `${validator.name} (JAILED)`
                  }

                  return validator.name;
              }

              return (
                  <ValidatorNameCell
                      validatorName={getName()}
                      validatorImg={logos[validator.address] !== "" ? logos[validator.address] : "/logo_320px.png"}
                  />
              )
          },
        },
        {
          id: 'amount-staked',
          label: 'Staked',
          width: '196px',
          align: 'right',
          render: (validator: Validator) => (
            <ValidatorTokenAmountCell
              amount={validator.delegation}
              symbol={coin.symbol}
            />
          ),
        },
        {
          id: 'claimable-rewards',
          label: 'Rewards',
          width: '196px',
          align: 'right',
          render: (validator: Validator) => (
            <ValidatorTokenAmountCell
              amount={validator.reward}
              symbol={coin.symbol}
            />
          ),
        },
        {
          id: 'action',
          width: '196px',
          align: 'right',
          render: (validator) => (
            <Button
              variant="solid"
              intent="tertiary"
              size="sm"
              onClick={() => {
                openModal();
                setSelectedValidator(validator);
              }}
              attributes={{
                ml: 'auto',
              }}
            >
              Manage
            </Button>
          ),
        },
      ]}
      data={filterValidators()}
      tableProps={{
        width: '$full',
      }}
    />
  );
};

export default React.memo(MyValidatorsList);
