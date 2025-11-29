import { useState } from 'react';
import { cosmos } from 'interchain-query';
import { useChain } from '@cosmos-kit/react';
import { ChainName } from 'cosmos-kit';
import {
  BasicModal,
  Box,
  Button,
  Text,
  Callout,
} from '@interchain-ui/react';

import { getCoin, getExponent } from '@/config';
import { Prices, UseDisclosureReturn, useTx } from '@/hooks';
import {
  calcDollarValue,
  shiftDigits,
  type ParsedUnbondingDelegations,
} from '@/utils';

const { cancelUnbondingDelegation } =
  cosmos.staking.v1beta1.MessageComposer.fromPartial;

export const CancelUnbondingModal = ({
  updateData,
  chainName,
  unbondingEntry,
  validatorName,
  modalControl,
  prices,
}: {
  updateData: () => void;
  chainName: ChainName;
  unbondingEntry: ParsedUnbondingDelegations[0];
  validatorName: string;
  logoUrl: string;
  modalControl: UseDisclosureReturn;
  prices: Prices;
}) => {
  const [isCancelling, setIsCancelling] = useState(false);

  const { address } = useChain(chainName);
  const { tx } = useTx(chainName);

  const coin = getCoin(chainName);
  const exp = getExponent(chainName);

  const closeCancelModal = () => {
    setIsCancelling(false);
    modalControl.onClose();
  };

  const onCancelClick = async () => {
    if (!address) return;

    setIsCancelling(true);

    const msg = cancelUnbondingDelegation({
      delegatorAddress: address,
      validatorAddress: unbondingEntry.validatorAddress,
      amount: {
        amount: shiftDigits(unbondingEntry.amount, exp),
        denom: coin.base,
      },
      creationHeight: unbondingEntry.creationHeight,
    });

    await tx([msg], {
      onSuccess: () => {
        updateData();
        closeCancelModal();
      },
    });

    setIsCancelling(false);
  };

  const dollarValue = calcDollarValue(coin.base, unbondingEntry.amount, prices);

  return (
    <BasicModal
      title="Cancel Unbonding"
      isOpen={modalControl.isOpen}
      onClose={closeCancelModal}
    >
      <Box
        width={{ mobile: '100%', tablet: '$containerSm' }}
        maxHeight={{ mobile: '$viewHeight', tablet: '$containerSm' }}
        attributes={{ p: '$10' }}
      >
        <Callout
          title="Cancel Unbonding Delegation"
          intent="warning"
          iconName="informationLine"
          attributes={{ mb: '$8' }}
        >
          <Text>
            This will cancel the unbonding delegation and re-delegate the tokens
            to the validator.
          </Text>
        </Callout>

        <Box attributes={{ mb: '$6' }}>
          <Text fontSize="$sm" color="$textSecondary" attributes={{ mb: '$2' }}>
            Validator
          </Text>
          <Text fontSize="$lg" fontWeight="$semibold">
            {validatorName}
          </Text>
        </Box>

        <Box attributes={{ mb: '$6' }}>
          <Text fontSize="$sm" color="$textSecondary" attributes={{ mb: '$2' }}>
            Amount
          </Text>
          <Text fontSize="$lg" fontWeight="$semibold">
            {unbondingEntry.amount} {coin.symbol}
          </Text>
          {dollarValue && (
            <Text fontSize="$sm" color="$textSecondary">
              ≈ ${dollarValue}
            </Text>
          )}
        </Box>

        <Box attributes={{ mb: '$6' }}>
          <Text fontSize="$sm" color="$textSecondary" attributes={{ mb: '$2' }}>
            Creation Height
          </Text>
          <Text fontSize="$lg" fontWeight="$semibold">
            {unbondingEntry.creationHeight?.toString() || 'N/A'}
          </Text>
        </Box>

        <Box display="flex" justifyContent="center" attributes={{ mt: '$10' }}>
          <Button
            intent="tertiary"
            onClick={onCancelClick}
            disabled={isCancelling}
            isLoading={isCancelling}
            attributes={{ mr: '$4' }}
          >
            Confirm Cancel
          </Button>
          <Button variant="outlined" onClick={closeCancelModal}>
            Close
          </Button>
        </Box>
      </Box>
    </BasicModal>
  );
};
