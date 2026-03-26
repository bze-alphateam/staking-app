import {useCallback, useEffect, useRef, useState} from 'react';
import {useChain} from "@interchain-kit/react";
import {
    getSettings,
    getChainName,
    blockchainEventManager,
    CURRENT_WALLET_BALANCE_EVENT,
    EPOCH_START_EVENT,
    SUPPLY_CHANGED_EVENT,
    TendermintEvent,
    getChainNativeAssetDenom,
} from "@bze/bze-ui-kit";
import {parseCoins} from "@cosmjs/amino";
import {coins} from "@cosmjs/stargate";

const BLOCK_SUBSCRIPTION_ID = 1;
const TX_RECIPIENT_SUBSCRIPTION_ID = 2;
const TX_SENDER_SUBSCRIPTION_ID = 3;

const buildSubscribePayload = (id: number, query: string) => {
    return {
        jsonrpc: "2.0",
        method: "subscribe",
        id: id,
        params: {
            query: query
        }
    };
}

const buildUnsubscribePayload = (id: number, query: string) => {
    return {
        jsonrpc: "2.0",
        method: "unsubscribe",
        id: id,
        params: {
            query: query
        }
    };
}

const isTransfer = (event: TendermintEvent) => event.type === 'transfer';

const eventHasAttributeWithValue = (event: TendermintEvent, searchValue: string) => {
    return event.attributes.find(attribute => attribute.value === searchValue) !== undefined;
}

const isCoinbaseEvent = (event: TendermintEvent) => {
    return event.type.includes('coinbase');
};

const isEpochStartEvent = (event: TendermintEvent) => {
    return event.type.includes('bze.epochs.EpochStartEvent');
};

const isBurnEvent = (event: TendermintEvent) => {
    return event.type.includes('burn');
};

const getMintedAmount = (event: TendermintEvent) => {
    const defaultCoin = coins(0, getChainNativeAssetDenom());
    try {
        const amountAttribute = event.attributes.find(attribute => attribute.key === 'amount');
        return amountAttribute ? parseCoins(amountAttribute.value) : defaultCoin
    }catch (e) {
        console.error("Failed to parse minted amount from coinbase event", e)
        return defaultCoin
    }
};

export function useBlockchainListener() {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const shouldReconnectRef = useRef(true);
    const subscribedToTxRef = useRef(false);
    const previousAddressRef = useRef<string | undefined>(undefined);
    const [isConnected, setIsConnected] = useState(false);

    const maxReconnectAttempts = 10;
    const {address} = useChain(getChainName())

    const onBlockEvent = useCallback((events: TendermintEvent[]) => {
        if (!events) return;

        for (const event of events) {
            if (isTransfer(event)) {
                if (address && address !== '' && eventHasAttributeWithValue(event, address)) {
                    blockchainEventManager.emit(CURRENT_WALLET_BALANCE_EVENT)
                }
                continue
            }

            if (isBurnEvent(event)) {
                blockchainEventManager.emit(SUPPLY_CHANGED_EVENT)
                continue;
            }

            if (isEpochStartEvent(event)) {
                blockchainEventManager.emit(EPOCH_START_EVENT)
                continue;
            }

            if (isCoinbaseEvent(event)) {
                const mintedAmount = getMintedAmount(event);
                for (const coin of mintedAmount) {
                    if (coin.denom !== getChainNativeAssetDenom()) {
                        blockchainEventManager.emit(SUPPLY_CHANGED_EVENT)
                        break;
                    }
                }
                continue;
            }
        }
    }, [address])

    const subscribeTxEvents = useCallback((walletAddress: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        if (subscribedToTxRef.current) return;
        if (!walletAddress || walletAddress === '') return;

        const recipientQuery = `tm.event='Tx' AND transfer.recipient='${walletAddress}'`;
        wsRef.current.send(JSON.stringify(buildSubscribePayload(TX_RECIPIENT_SUBSCRIPTION_ID, recipientQuery)));

        const senderQuery = `tm.event='Tx' AND transfer.sender='${walletAddress}'`;
        wsRef.current.send(JSON.stringify(buildSubscribePayload(TX_SENDER_SUBSCRIPTION_ID, senderQuery)));

        subscribedToTxRef.current = true;
    }, []);

    const unsubscribeTxEvents = useCallback((walletAddress: string) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
        if (!subscribedToTxRef.current) return;

        const recipientQuery = `tm.event='Tx' AND transfer.recipient='${walletAddress}'`;
        wsRef.current.send(JSON.stringify(buildUnsubscribePayload(TX_RECIPIENT_SUBSCRIPTION_ID, recipientQuery)));

        const senderQuery = `tm.event='Tx' AND transfer.sender='${walletAddress}'`;
        wsRef.current.send(JSON.stringify(buildUnsubscribePayload(TX_SENDER_SUBSCRIPTION_ID, senderQuery)));

        subscribedToTxRef.current = false;
    }, []);

    const reconnect = useCallback(() => {
        if (!shouldReconnectRef.current) return;
        reconnectAttemptsRef.current++;
        if (reconnectAttemptsRef.current > maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            return;
        }
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current - 1), 30000);
        reconnectTimeoutRef.current = setTimeout(() => {
            if (shouldReconnectRef.current) {
                connectWebSocket();
            }
        }, delay);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const connectWebSocket = useCallback(() => {
        const settings = getSettings()
        if (!shouldReconnectRef.current) return;

        if (wsRef.current) {
            wsRef.current.close(1000, 'Reconnecting');
            wsRef.current = null;
        }

        subscribedToTxRef.current = false;
        wsRef.current = new WebSocket(`${settings.endpoints.rpcEndpoint}/websocket`);

        wsRef.current.onopen = () => {
            const blockPayload = buildSubscribePayload(BLOCK_SUBSCRIPTION_ID, "tm.event='NewBlock'");
            wsRef.current?.send(JSON.stringify(blockPayload));

            if (address && address !== '') {
                subscribeTxEvents(address);
            }

            reconnectAttemptsRef.current = 0;
            setIsConnected(true);
        };

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data?.result?.data?.value?.result_finalize_block?.events) {
                onBlockEvent(data.result.data.value.result_finalize_block.events)
            }

            if (data?.result?.data?.value?.txs_results) {
                for (const txResult of data.result.data.value.txs_results) {
                    if (txResult?.events) {
                        onBlockEvent(txResult.events)
                    }
                }
            }

            if (data?.result?.data?.value?.TxResult?.result?.events) {
                onBlockEvent(data.result.data.value.TxResult.result.events)
            }
        };

        wsRef.current.onclose = (event) => {
            subscribedToTxRef.current = false;
            setIsConnected(false);
            if (event.code !== 1000 && shouldReconnectRef.current) {
                reconnect();
            }
        };

        wsRef.current.onerror = () => {
            setIsConnected(false);
            wsRef.current?.close();
        };
    }, [reconnect, address, subscribeTxEvents, onBlockEvent]);

    useEffect(() => {
        const currentAddress = address ?? '';
        const previousAddress = previousAddressRef.current ?? '';
        if (currentAddress !== previousAddress) {
            if (previousAddress !== '') {
                unsubscribeTxEvents(previousAddress);
            }
            if (currentAddress !== '') {
                subscribeTxEvents(currentAddress);
            }
            previousAddressRef.current = currentAddress;
        }
    }, [address, subscribeTxEvents, unsubscribeTxEvents]);

    useEffect(() => {
        shouldReconnectRef.current = true;
        connectWebSocket();
        return () => {
            shouldReconnectRef.current = false;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
                reconnectTimeoutRef.current = null;
            }
            if (wsRef.current) {
                wsRef.current.close(1000, 'Component unmounting');
                wsRef.current = null;
            }
        };
    }, [connectWebSocket]);

    return {
        isConnected,
    };
}
