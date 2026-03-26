'use client';

import {useState} from 'react';
import {Box, Button, HStack, Text, VStack, Dialog, Portal} from '@chakra-ui/react';
import {
    useAssets,
    useSDKTx,
    useToast,
    prettyAmount,
    uAmountToBigNumberAmount,
    getChainName,
    useAssetPrice,
    formatUsdAmount,
} from '@bze/bze-ui-kit';
import {useChain} from '@interchain-kit/react';
import BigNumber from 'bignumber.js';
import {cosmos} from '@bze/bzejs';
import type {UserNativeStakingRewards} from '@bze/bze-ui-kit';
import {LuGift} from 'react-icons/lu';

interface ClaimRewardsModalProps {
    isOpen: boolean;
    onClose: () => void;
    pendingRewards: UserNativeStakingRewards;
    onSuccess: () => void;
}

export function ClaimRewardsModal({isOpen, onClose, pendingRewards, onSuccess}: ClaimRewardsModalProps) {
    const {nativeAsset} = useAssets();
    const {address} = useChain(getChainName());
    const {tx, progressTrack} = useSDKTx();
    const {toast} = useToast();
    const {price: bzePrice} = useAssetPrice(nativeAsset?.denom ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const decimals = nativeAsset?.decimals ?? 6;
    const totalRewardsHuman = uAmountToBigNumberAmount(pendingRewards.total.amount, decimals);
    const rewardsUsd = bzePrice ? totalRewardsHuman.multipliedBy(bzePrice) : new BigNumber(0);

    const handleClaim = async () => {
        if (!address || pendingRewards.validators.length === 0) {
            toast.error('No rewards', 'No claimable rewards found');
            return;
        }

        setIsSubmitting(true);
        try {
            const {withdrawDelegatorReward} = cosmos.distribution.v1beta1.MessageComposer.withTypeUrl;
            const messages = pendingRewards.validators.map(validatorAddr =>
                withdrawDelegatorReward({
                    delegatorAddress: address,
                    validatorAddress: validatorAddr,
                })
            );

            await tx(messages);
            toast.success('Rewards claimed!', `Claimed ${prettyAmount(totalRewardsHuman)} ${nativeAsset?.ticker}`);
            onSuccess();
        } catch (e) {
            console.error('Claim rewards failed:', e);
            toast.error('Claim failed', 'Transaction failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !isSubmitting && !e.open && onClose()}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content maxW="md" p="6">
                        <Dialog.Header pb="4">
                            <Dialog.Title>Claim Staking Rewards</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <VStack gap="5" align="stretch">
                                <Box
                                    bg="purple.500/5"
                                    p="6"
                                    borderRadius="lg"
                                    borderWidth="1px"
                                    borderColor="purple.500/20"
                                    textAlign="center"
                                >
                                    <VStack gap="2">
                                        <Box color="purple.500">
                                            <LuGift size={32} />
                                        </Box>
                                        <Text fontSize="2xl" fontWeight="bold">
                                            {prettyAmount(totalRewardsHuman)} {nativeAsset?.ticker}
                                        </Text>
                                        {rewardsUsd.gt(0) && (
                                            <Text fontSize="sm" color="fg.muted">
                                                ~{formatUsdAmount(rewardsUsd)}
                                            </Text>
                                        )}
                                        <Text fontSize="xs" color="fg.muted">
                                            From {pendingRewards.validators.length} validator{pendingRewards.validators.length > 1 ? 's' : ''}
                                        </Text>
                                    </VStack>
                                </Box>

                                {progressTrack && (
                                    <Text fontSize="xs" color="fg.muted" textAlign="center">{progressTrack}</Text>
                                )}

                                <HStack gap="3">
                                    <Button
                                        variant="outline"
                                        onClick={onClose}
                                        flex="1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        colorPalette="purple"
                                        onClick={handleClaim}
                                        loading={isSubmitting}
                                        disabled={!address}
                                        flex="1"
                                    >
                                        Claim Rewards
                                    </Button>
                                </HStack>
                            </VStack>
                        </Dialog.Body>

                        <Dialog.CloseTrigger disabled={isSubmitting} />
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
