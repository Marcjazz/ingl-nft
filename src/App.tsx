import { createDefaultAuthorizationResultCache, SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SlopeWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Keypair, PublicKey } from '@solana/web3.js';
import { NftService } from './services';
import React, { FC, ReactNode, useMemo, useState } from 'react';

export const App: FC = () => {
    return (
        <Context>
            <Content />
        </Context>
    );
};

const Context: FC<{ children: ReactNode }> = ({ children }) => {
    // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
    const network = WalletAdapterNetwork.Devnet;

    // You can also provide a custom RPC endpoint.
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            new SolanaMobileWalletAdapter({
                appIdentity: { name: 'Solana React UI Starter App' },
                authorizationResultCache: createDefaultAuthorizationResultCache(),
            }),
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SlopeWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
        ],
        [network]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

type PriceFeeds = Record<string, string>;
const Content: FC = () => {
    const wallet = useWallet();
    const nftService: NftService = new NftService(wallet);

    const historyBuf = async () => {
        // const devSOL = await nftService.getWitchboardAccountInfo('mainnet-beta', 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR')
        // const mainSOL = await nftService.getWitchboardAccountInfo('devnet', 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR')
        // console.log({
        //     devSOL,
        //     mainSOL,
        //     compare: devSOL == mainSOL
        // })
        const priceFeeds: PriceFeeds = {
            SOL_USD: 'GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR',
            BTC_USD: '8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee',
            ETH_USD: 'HNStfhaLnqwF2ZtJUizaA9uHDAVB976r2AgTUx9LrdEo',
            BNB_USD: '2steFGCbo9FNXksMBGDh9NwixtdG5PdQoaCuR4knyvrB',
            BCH_USD: '5ajwSK27wGKfbcJfUGCsu7Rp1VfEenUj64yMv5yKD85j',
            ADA_USD: '3hScmVMU4LyMKQwREEoLjj1YKaZJZov2G2R8GTQNcMkU',
            SBR_USD: 'HFDJtPwJSn2kv96mn5wYUKVhA2QHbphfNtjGeKuyfXnm',
            ZEC_USD: 'DxLVBqe19Rf2eAijqShLf9bs1CNubXQWUjQRixXfMNoT',
            LUNA_USD: '34cmagXChoAvGSwVdGpZfvDahdfnq2Q81Mp6J7joae3X',
            TRX_USD: 'EnZ16z5ARbs3YHSmgmsYgmcajHxoUDueZc7Bsikma7rM',
            SUSHI_USD: 'HeqreCR28Su4wPvzDFd4hkApi7XiGtWJxD4Q6EebtBCs',
            DOGE_USD: 'FoBK7CgwobLrEfGC8MaGFpYxhucCo1DBhAm5EEvUPD2i',
            LTC_USD: '9gh7xLynnJ1FRfNquxPnLrCFsNeaANR2vFfadHgCJuoW',
            XLM_USD: 'EQJ6sTgoKHEcfneHCpTWd4avBvZWDjh4oFqXqBeS5Rab',
            LINK_USD: '5ro9z5HxJtSeATderc8NgTQh37HP1ZWfJPCQPkFn4Jpq',
            DOT_USD: 'B6bjqp6kL3qniMn9nuzHvjzRLiJvvVusugDXJXhYjNYz',
            XMR_USD: 'Lk9PWt2Th6pmdzAJsPvzKzqwDYGTn2PerejJtg1mFsw',
            SRM_USD: 'CUgoqwiQ4wCt6Tthkrgx5saAEpLBjPCdHshVa4Pbfcx2',
            PORT_USD: 'BnT7954eT3UT4XX5zf9Zwfdrag5h3YmzG8LBRwmXo5Bi',
            PAI_USD: 'DKayKbGmnby8XUagUL3bVLcN7NZKy6j5ugyBmHzwpqc8',
        };
        const length = Object.keys(priceFeeds).length;
        const historyBuffer: Record<string, string> = {};
        for (const key in priceFeeds) {
            historyBuffer[key] = (
                await nftService.getWitchboardHistoryBuffer('mainnet-beta', priceFeeds[key])
            ).pubkey.toBase58();
        }
        // console.log({ length, historyBuffer });
    };

    const mintNftHandler = () => {
        nftService
            .mintNft()
            .then((transactionId) => {
                alert('Your transaction id is: ' + transactionId);
            })
            .catch((error) => console.log(error));
    };

    const mintCollectedHandler = () => {
        nftService
            .initProgram()
            .then((transactionId) => {
                alert('Your transaction id is: ' + transactionId);
            })
            .catch((error) => console.log(error));
    };

    const [mintTokenId, setMintTokenId] = useState<string>();
    const [isPending, setIsPending] = useState<boolean>(false);
    const [transactionId, setTransactionId] = useState<string>();

    const initRarityImprint = async () => {
        try {
            if (mintTokenId) {
                setIsPending(true);
                const mintPubkey = new PublicKey(mintTokenId);
                const transactionId = await nftService.initRarityImprint(mintPubkey);
                setIsPending(false);
                setTransactionId(transactionId);
            } else alert('Please Enter your token mint id');
        } catch (error) {
            console.log(error);
        }
    };

    const imprintRarity = async () => {
        try {
            if (mintTokenId) {
                setIsPending(true);
                const mintPubkey = new PublicKey(mintTokenId);
                const transactionId = await nftService.imprintRarity(mintPubkey);
                setTransactionId(transactionId);
                setIsPending(false);
            } else alert('Please Enter your token mint id');
        } catch (error) {
            console.log(error);
        }
    };

    const redeemNft = async () => {
        if (mintTokenId) {
            setIsPending(true);
            const mintPubkey = new PublicKey(mintTokenId);
            nftService
                .redeemNft(mintPubkey)
                .then((transactionId) => {
                    setIsPending(false);
                    setTransactionId(transactionId);
                })
                .catch((error) => {
                    console.log(error);
                });
        } else alert('Please Enter your token mint id');
    };

    const getAccountData = async () => {
        const accountData = await nftService.getAccountData();
        console.log(accountData);
    };

    return (
        <div className="App">
            <header className="App-header">
                {isPending ? (
                    <p style={{ margin: '15px' }}>
                        Your Transaction has been successfully executed<br>{transactionId}</br>
                    </p>
                ) : null}
                <div style={{ display: 'grid', justifyContent: 'center', gap: '20px' }}>
                    {wallet.connected ? (
                        <>
                            <div style={{ display: 'grid', gridAutoFlow: 'column', gap: '15px' }}>
                                <button onClick={mintCollectedHandler}>Mint Collection</button>
                                <button onClick={mintNftHandler}>Mint NFT</button>
                            </div>
                            <div style={{ display: 'grid', gridAutoFlow: 'column', gap: '15px' }}>
                                <button onClick={historyBuf}>Get history feeds</button>
                            </div>
                            <input type="text" name="mintid" onChange={(e) => setMintTokenId(e.target.value)} />
                            <div style={{ display: 'grid', gridAutoFlow: 'column', gap: '15px' }}>
                                <button onClick={initRarityImprint}>Init Imprint</button>
                                <button onClick={imprintRarity}>Imprint Rarity</button>
                                <button onClick={redeemNft}>Redeem Nft</button>
                            </div>
                        </>
                    ) : (
                        <WalletMultiButton />
                    )}
                </div>
            </header>
        </div>
    );
};
