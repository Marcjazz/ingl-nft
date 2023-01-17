import { serialize } from '@dao-xyz/borsh';
import { PROGRAM_ID as METAPLEX_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import {
    AccountMeta,
    clusterApiUrl,
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmRawTransaction,
    SystemProgram,
    SYSVAR_RECENT_BLOCKHASHES_PUBKEY,
    SYSVAR_RENT_PUBKEY,
    Transaction,
    TransactionInstruction,
} from '@solana/web3.js';
import {
    AggregatorAccount,
    AnchorWallet,
    PermissionAccount,
    SwitchboardProgram,
    SwitchboardTestContext,
    VrfAccount,
} from '@switchboard-xyz/solana.js';
import assert from 'assert';
import { Instruction, PROGRAM_ID } from './constant';
import { InitPayload, MintNftPayload } from './payload';
import { createLookupTable, forwardTransaction, getCloseLookupTableInstructions } from './utils';

export enum NftType {
    Nft,
    NftCollection,
}

export class NftService {
    private connection: Connection;
    constructor(private wallet: WalletContextState) {
        this.connection = new Connection(clusterApiUrl(WalletAdapterNetwork.Devnet));
    }

    async mintNft() {
        const payerAccount: AccountMeta = {
            pubkey: this.wallet.publicKey as PublicKey,
            isSigner: true,
            isWritable: true,
        };

        const mintKeyPair = Keypair.generate();
        const nftMintAccount: AccountMeta = {
            pubkey: mintKeyPair.publicKey,
            isSigner: true,
            isWritable: true,
        };

        const [mintAuthorityAcountKey, _mintAuthorityAcountBump] = await PublicKey.findProgramAddress(
            [Buffer.from('ingl_mint_authority')],
            PROGRAM_ID
        );

        const mintAuthorityAccount: AccountMeta = {
            pubkey: mintAuthorityAcountKey,
            isSigner: false,
            isWritable: true,
        };

        const splTokenProgramAccount: AccountMeta = {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        };

        const sysvarRentAccount: AccountMeta = {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        };

        const systemProgramAccount: AccountMeta = {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        };

        const [metaplexAccountKey, _metaplexAccountBump] = await PublicKey.findProgramAddress(
            [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), nftMintAccount.pubkey.toBuffer()],
            METAPLEX_PROGRAM_ID
        );

        const nftMetadataAccount: AccountMeta = {
            pubkey: metaplexAccountKey,
            isSigner: false,
            isWritable: true,
        };

        const [generalAccountPubkey, _globalAccountBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('general_account')],
            PROGRAM_ID
        );

        const generalAccountAccount: AccountMeta = {
            pubkey: generalAccountPubkey,
            isSigner: false,
            isWritable: true,
        };

        const [nftPubkey, _gemBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('nft_account'), mintKeyPair.publicKey.toBuffer()],
            PROGRAM_ID
        );

        const nftAccount: AccountMeta = {
            pubkey: nftPubkey,
            isSigner: false,
            isWritable: true,
        };

        const metaplexProgramAccount: AccountMeta = {
            pubkey: METAPLEX_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        };

        const [mitingPoolKey, _mitingPoolKeyBump] = await PublicKey.findProgramAddress(
            [Buffer.from('pd_pool_account')],
            PROGRAM_ID
        );
        const mintingPoolAccount: AccountMeta = {
            pubkey: mitingPoolKey,
            isSigner: false,
            isWritable: true,
        };

        const associatedTokenAccount: AccountMeta = {
            pubkey: await getAssociatedTokenAddress(mintKeyPair.publicKey, payerAccount.pubkey),
            isSigner: false,
            isWritable: true,
        };

        const [inglNftCollectionKey, _inglMintBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('ingl_nft_collection')],
            PROGRAM_ID
        );
        const inglCollectionMintAccount: AccountMeta = {
            pubkey: inglNftCollectionKey,
            isSigner: false,
            isWritable: false,
        };

        const [inglNftCollectionMetadataKey, _inglMetadataBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), inglNftCollectionKey.toBuffer()],
            METAPLEX_PROGRAM_ID
        );
        const inglCollectionAccount: AccountMeta = {
            pubkey: inglNftCollectionMetadataKey,
            isSigner: false,
            isWritable: false,
        };

        const [nftEditionKey, _nftEditionBump] = PublicKey.findProgramAddressSync(
            [
                Buffer.from('metadata'),
                METAPLEX_PROGRAM_ID.toBuffer(),
                nftMintAccount.pubkey.toBuffer(),
                Buffer.from('edition'),
            ],
            METAPLEX_PROGRAM_ID
        );
        const nftEditionAccount: AccountMeta = {
            pubkey: nftEditionKey,
            isSigner: false,
            isWritable: true,
        };

        const [collectionEditionKey, _editionBump] = PublicKey.findProgramAddressSync(
            [
                Buffer.from('metadata'),
                METAPLEX_PROGRAM_ID.toBuffer(),
                inglNftCollectionKey.toBuffer(),
                Buffer.from('edition'),
            ],
            METAPLEX_PROGRAM_ID
        );
        const collectionEditionAccount: AccountMeta = {
            pubkey: collectionEditionKey,
            isSigner: false,
            isWritable: true,
        };

        const associatedTokeProgramAccount: AccountMeta = {
            pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        };

        const [inglConfigKey, _inglConfigBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('ingl_config')],
            PROGRAM_ID
        );
        const inglConfigAccount: AccountMeta = {
            isSigner: false,
            isWritable: false,
            pubkey: inglConfigKey,
        };
        const [urisAccountKey, _urisAccountBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('uris_account')],
            PROGRAM_ID
        );
        const urisAccountAccount: AccountMeta = {
            isSigner: false,
            isWritable: false,
            pubkey: urisAccountKey,
        };
        // load the switchboard program
        const network = 'devnet';
        const program = await SwitchboardProgram.load(
            network,
            new Connection(clusterApiUrl(network)),
            Keypair.fromSeed(Buffer.from('ingl_permissionless_payerKeypair'))
        );
        // // // Configure the client to use the local cluster.
        // // setProvider(AnchorProvider.env());
        // // load the switchboard aggregator
        // const aggregator = new AggregatorAccount(
        //     program,
        //     new PublicKey('GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR')
        // );
        // const provider = program.provider;
        // // const aggregatorData = await aggregator.loadData();
        // const payerKeypair = (provider.wallet as AnchorWallet).payer;
        // // const [queueAccount] = await QueueAccount.load(program, aggregatorData.queuePubkey);

        // const switchboard = await SwitchboardTestContext.loadDevnetQueue(provider);

        // const queueOracles = await switchboard.queue.loadOracles();
        // console.log(`# of oracles heartbeating: ${queueOracles.length}`);
        // assert(queueOracles.length > 0, 'No oracles actively heartbeating');

        // const { accounts: initVrfClientAccounts, vrfAccount } = await this.getInitVrfAccounts(switchboard, mintKeyPair.publicKey);

        try {
            // const { addresses: requestRandomnessAccounts, bumps } = await this.getRequestRandomnessAccounts(
            //     switchboard,
            //     vrfAccount,
            //     payerKeypair
            // );
            const feedAccountInfos = this.getFeedAccountInfos(network);
            const instructionAccounts = [
                payerAccount,
                nftMintAccount,
                mintAuthorityAccount,
                associatedTokenAccount,
                splTokenProgramAccount,
                sysvarRentAccount,
                systemProgramAccount,
                nftMetadataAccount,
                mintingPoolAccount,
                nftAccount,
                collectionEditionAccount,
                nftEditionAccount,
                inglCollectionMintAccount,
                inglCollectionAccount,
                inglConfigAccount,
                urisAccountAccount,
                generalAccountAccount,
                // //init vrf accounts
                // ...initVrfClientAccounts,
                // //request randomness accounts
                // ...requestRandomnessAccounts,

                //switchbord history buffer account infos
                ...feedAccountInfos,

                systemProgramAccount,
                splTokenProgramAccount,
                associatedTokeProgramAccount,
                metaplexProgramAccount,
            ];
            const lookupTableAddresses = await createLookupTable(
                this.connection,
                this.wallet,
                instructionAccounts.map((_) => _.pubkey)
            );
            console.log(lookupTableAddresses);
            const mintNftPayload = new MintNftPayload({
                // ...bumps,
                log_level: 0,
                instruction: Instruction.MintNft,
            });

            const mintNftInstruction = new TransactionInstruction({
                programId: PROGRAM_ID,
                data: Buffer.from(serialize(mintNftPayload)),
                keys: instructionAccounts,
            });
            const closeLookupTableInstructions = getCloseLookupTableInstructions(
                this.wallet.publicKey as PublicKey,
                lookupTableAddresses
            );
            return await forwardTransaction(
                { connection: this.connection, wallet: this.wallet },
                [mintNftInstruction],
                {
                    signerKeypairs: [mintKeyPair],
                    additionalUnits: 1_000_000,
                    lookupTableAddresses: lookupTableAddresses,
                }
            );
        } catch (error) {
            throw new Error('NFT Minting transaction failed with error ' + error);
        }
    }

    async getInitVrfAccounts(switchboard: SwitchboardTestContext, mintPubkey: PublicKey) {
        const inglVrfKeyPair = Keypair.fromSeed(Buffer.from(process.env.VRF_SEED_PHRASE as string));
        const [nftVrfStateKey, _nftVrfStateBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('ingl_vrf_state_key'), mintPubkey.toBytes(), inglVrfKeyPair.publicKey.toBytes()],
            PROGRAM_ID
        );
        console.log(inglVrfKeyPair.publicKey.toBase58(), {
            nftVrfStateKey: nftVrfStateKey.toBase58(),
        });
        const vrfAccountInfo = await this.connection.getAccountInfo(inglVrfKeyPair.publicKey);
        let vrfAccount: VrfAccount;
        if (vrfAccountInfo?.owner.toBase58() !== switchboard.program.programId.toBase58()) {
            const [newVrfAccount, transactionObject] = await switchboard.queue.createVrfInstructions(
                this.wallet.publicKey as PublicKey,
                {
                    callback: {
                        programId: PROGRAM_ID,
                        accounts: [
                            { pubkey: nftVrfStateKey, isSigner: false, isWritable: true },
                            { pubkey: inglVrfKeyPair.publicKey, isSigner: false, isWritable: false },
                        ],
                        ixData: Buffer.from(''),
                    },
                    vrfKeypair: inglVrfKeyPair,
                    authority: nftVrfStateKey,
                    enable: true,
                }
            );
            vrfAccount = newVrfAccount;
            const accounts: { pubkey: string; isSigner: boolean; isWritable: boolean }[] = [];
            transactionObject.ixns.forEach((trans) =>
                accounts.push(
                    ...trans.keys.filter((key) => key.isSigner).map((_) => ({ ..._, pubkey: _.pubkey.toBase58() }))
                )
            );
            const txId = await forwardTransaction(
                { connection: this.connection, wallet: this.wallet },
                transactionObject.ixns,
                { signerKeypairs: [inglVrfKeyPair], commitment: 'finalized' }
            );
            console.log(txId);
        }
        vrfAccount = (await VrfAccount.load(switchboard.program, inglVrfKeyPair.publicKey))[0];
        const nftVrfAccount: AccountMeta = {
            pubkey: vrfAccount.publicKey,
            isSigner: false,
            isWritable: true,
        };
        const nftVrfStateAccount: AccountMeta = {
            pubkey: nftVrfStateKey,
            isSigner: false,
            isWritable: true,
        };
        return {
            vrfAccount,
            accounts: [nftVrfAccount, nftVrfStateAccount],
        };
    }

    async getRequestRandomnessAccounts(
        switchboard: SwitchboardTestContext,
        vrfAccount: VrfAccount,
        payerKeypair: Keypair
    ) {
        const vrfState = await vrfAccount.loadData();
        const queueState = await switchboard.queue.loadData();
        const [permissionAccount, permissionBump] = PermissionAccount.fromSeed(
            switchboard.program,
            queueState.authority,
            switchboard.queue.publicKey,
            vrfAccount.publicKey
        );
        console.log({ payerWallet: payerKeypair.publicKey.toBase58() });
        const [payerWalletAddress, transactionObject] =
            await switchboard.program.mint.getOrCreateWrappedUserInstructions(this.wallet.publicKey as PublicKey, {
                fundUpTo: 0.75,
            });
        if (transactionObject) {
            const accounts: { pubkey: string; isSigner: boolean; isWritable: boolean }[] = [];
            transactionObject.ixns.forEach((trans) =>
                accounts.push(
                    ...trans.keys.filter((key) => key.isSigner).map((_) => ({ ..._, pubkey: _.pubkey.toBase58() }))
                )
            );
            console.log(accounts, payerWalletAddress.toBase58());
            const signature = await forwardTransaction(
                { connection: this.connection, wallet: this.wallet },
                transactionObject.ixns,
                { signerKeypairs: transactionObject.signers }
            );
            console.log({ signature });
        }
        console.log(transactionObject?.ixns.length);

        return {
            addresses: [
                { pubkey: payerWalletAddress, isSigner: false, isWritable: true },
                { pubkey: switchboard.queue.publicKey, isSigner: false, isWritable: true },
                { pubkey: queueState.authority, isSigner: false, isWritable: true },
                { pubkey: queueState.dataBuffer, isSigner: false, isWritable: true },
                { pubkey: permissionAccount.publicKey, isSigner: false, isWritable: true },
                { pubkey: vrfState.escrow, isSigner: false, isWritable: true },
                { pubkey: switchboard.program.programState.publicKey, isSigner: false, isWritable: true },
                { pubkey: switchboard.program.programId, isSigner: false, isWritable: false },
                { pubkey: SYSVAR_RECENT_BLOCKHASHES_PUBKEY, isSigner: false, isWritable: false },
            ],
            bumps: {
                permission_bump: permissionBump,
                switchboard_state_bump: switchboard.program.programState.bump,
            },
        };
    }

    async initProgram() {
        const validatorKeypair = Keypair.generate();
        const validatorAccount: AccountMeta = {
            isSigner: false,
            isWritable: false,
            pubkey: validatorKeypair.publicKey,
        };

        const [inglConfigKey, _inglConfigBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('ingl_config')],
            PROGRAM_ID
        );
        const inglConfigAccount: AccountMeta = {
            isSigner: false,
            isWritable: true,
            pubkey: inglConfigKey,
        };
        const [urisAccountKey, _urisAccountBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('uris_account')],
            PROGRAM_ID
        );
        const urisAccountAccount: AccountMeta = {
            isSigner: false,
            isWritable: true,
            pubkey: urisAccountKey,
        };

        const [inglNftCollectionMintKey, _inglNftCollectionBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('ingl_nft_collection')],
            PROGRAM_ID
        );
        const payerAccount: AccountMeta = {
            pubkey: this.wallet.publicKey as PublicKey,
            isSigner: true,
            isWritable: true,
        };

        const collectionMintAccount: AccountMeta = {
            pubkey: inglNftCollectionMintKey,
            isSigner: false,
            isWritable: true,
        };

        const [nftCollectionAutorityPDA, _mintAuthorityAcountBump] = await PublicKey.findProgramAddress(
            [Buffer.from('ingl_mint_authority')],
            PROGRAM_ID
        );

        const mintAuthorityAccount: AccountMeta = {
            pubkey: nftCollectionAutorityPDA,
            isSigner: false,
            isWritable: true,
        };

        const splTokenProgramAccount: AccountMeta = {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        };

        const sysvarRentAccount: AccountMeta = {
            pubkey: SYSVAR_RENT_PUBKEY,
            isSigner: false,
            isWritable: false,
        };

        const systemProgramAccount: AccountMeta = {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        };

        const [metaplexAccountKey, _metaplexAccountBump] = await PublicKey.findProgramAddress(
            [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), collectionMintAccount.pubkey.toBuffer()],
            METAPLEX_PROGRAM_ID
        );

        const collectionMetadataAccount: AccountMeta = {
            pubkey: metaplexAccountKey,
            isSigner: false,
            isWritable: true,
        };

        const [generalAccountPubkey, _generalAccountBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('general_account')],
            PROGRAM_ID
        );

        const generalAccount: AccountMeta = {
            pubkey: generalAccountPubkey,
            isSigner: false,
            isWritable: true,
        };

        const metaplexProgramAccount: AccountMeta = {
            pubkey: METAPLEX_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        };

        const [inglCollectionHolderKey, _inglCollectionHolderBump] = PublicKey.findProgramAddressSync(
            [Buffer.from('collection_holder')],
            PROGRAM_ID
        );
        const collectionHolderAccount: AccountMeta = {
            pubkey: inglCollectionHolderKey,
            isSigner: false,
            isWritable: true,
        };
        const associatedTokenAccount: AccountMeta = {
            pubkey: await getAssociatedTokenAddress(inglNftCollectionMintKey, inglCollectionHolderKey, true),
            isSigner: false,
            isWritable: true,
        };

        const [editionKey, _editionBump] = PublicKey.findProgramAddressSync(
            [
                Buffer.from('metadata'),
                METAPLEX_PROGRAM_ID.toBuffer(),
                inglNftCollectionMintKey.toBuffer(),
                Buffer.from('edition'),
            ],
            METAPLEX_PROGRAM_ID
        );
        const collectionEditionAccount: AccountMeta = {
            pubkey: editionKey,
            isSigner: false,
            isWritable: true,
        };

        const associatedTokeProgramAccount: AccountMeta = {
            pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        };
        const initProgramPayload = new InitPayload({
            instruction: Instruction.Init,
            log_level: 0,
            init_commission: 5,
            max_primary_stake: 15_500_000_000,
            initial_redemption_fee: 5,
            is_validator_id_switchable: true,
            unit_backing: 1_500_000_000,
            redemption_fee_duration: 365,
            proposal_quorum: 65,
            creator_royalties: 105,
            rarities: [5300, 3000, 1000, 700],
            rarity_names: ['Jupiter', 'Neptune', 'Mars', 'Earth'],
            twitter_handle: 'https://twitter.com/ingldao',
            discord_invite: 'https://t.co/sMPnyZzYt3',
            validator_name: 'Survivor',
            collection_uri: 'https://scitechdaily.com/images/Vast-Universe-Concept-1.gif',
            nft_holders_share: 55,
            website: 'https://whitepaper.ingl.io',
            governance_expiration_time: 40 * 24 * 3600,
        });
        const initProgramInstruction = new TransactionInstruction({
            programId: PROGRAM_ID,
            data: Buffer.from(serialize(initProgramPayload)),
            keys: [
                payerAccount,
                inglConfigAccount,
                generalAccount,
                urisAccountAccount,
                sysvarRentAccount,
                validatorAccount,
                collectionHolderAccount,
                collectionMintAccount,
                mintAuthorityAccount,
                associatedTokenAccount,
                collectionMetadataAccount,
                collectionEditionAccount,
                splTokenProgramAccount,
                systemProgramAccount,

                systemProgramAccount,
                splTokenProgramAccount,
                associatedTokeProgramAccount,
                metaplexProgramAccount,
            ],
        });
        try {
            return await forwardTransaction(
                { connection: this.connection, wallet: this.wallet },
                [initProgramInstruction],
                {
                    additionalUnits: 400_000,
                }
            );
        } catch (error) {
            throw new Error('Nft Minting transaction failed with error ' + error);
        }
    }

    async initRarityImprint(mint_token_id: PublicKey) {
        const payerAccount: AccountMeta = {
            pubkey: this.wallet.publicKey as PublicKey,
            isSigner: true,
            isWritable: true,
        };
        const [gem_pubkey, _gem_bump] = PublicKey.findProgramAddressSync(
            [Buffer.from('gem_account'), mint_token_id.toBuffer()],
            PROGRAM_ID
        );
        const gemAccount: AccountMeta = {
            pubkey: gem_pubkey,
            isSigner: false,
            isWritable: true,
        };

        const mintAccount: AccountMeta = {
            pubkey: mint_token_id,
            isSigner: false,
            isWritable: false,
        };
        const associatedTokenAccount: AccountMeta = {
            pubkey: await getAssociatedTokenAddress(mintAccount.pubkey, payerAccount.pubkey),
            isSigner: false,
            isWritable: true,
        };
        const [edition_key, _edition_bump] = PublicKey.findProgramAddressSync(
            [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mint_token_id.toBuffer(), Buffer.from('edition')],
            METAPLEX_PROGRAM_ID
        );
        const nftEditionAccount: AccountMeta = {
            pubkey: edition_key,
            isSigner: false,
            isWritable: false,
        };

        const splTokenProgramAccount: AccountMeta = {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        };
        const [nftCollectionAutorityPDA, _mintAuthorityAcountBump] = await PublicKey.findProgramAddress(
            [Buffer.from('mint_authority')],
            PROGRAM_ID
        );

        const mintAuthorityAccount: AccountMeta = {
            pubkey: nftCollectionAutorityPDA,
            isSigner: false,
            isWritable: true,
        };

        const metaplexProgramAccount: AccountMeta = {
            pubkey: METAPLEX_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        };

        const mintNftCollectionInstruction = new TransactionInstruction({
            programId: PROGRAM_ID,
            data: Buffer.from([Instruction.ImprintRarity]),
            keys: [
                payerAccount,
                gemAccount,
                mintAccount,
                associatedTokenAccount,
                mintAuthorityAccount,
                nftEditionAccount,

                splTokenProgramAccount,
                metaplexProgramAccount,
            ],
        });

        try {
            const transaction = new Transaction();

            const tx = transaction.add(mintNftCollectionInstruction);
            tx.feePayer = this.wallet.publicKey as PublicKey;

            const blockhashObj = await this.connection.getLatestBlockhash();
            tx.recentBlockhash = blockhashObj.blockhash;

            const signedTransaction = this.wallet.signTransaction ? await this.wallet?.signTransaction(tx) : null;
            const txn = signedTransaction?.serialize();

            const transactionId = await sendAndConfirmRawTransaction(this.connection, txn as Buffer);

            console.log(transactionId);
            return transactionId;
        } catch (error) {
            throw new Error('Nft Minting transaction failed with error ' + error);
        }
    }

    async getWitchboardHistoryBuffer(network: 'devnet' | 'mainnet-beta', witchboard_feed_pubkey: string) {
        // load the switchboard program
        const program = await SwitchboardProgram.load(
            network,
            new Connection(clusterApiUrl(network)),
            Keypair.fromSeed(new Uint8Array(32).fill(1)) // using dummy keypair since we wont be submitting any transactions
        );
        // load the switchboard aggregator
        const aggregator = new AggregatorAccount(program, new PublicKey(witchboard_feed_pubkey));

        const { historyBuffer } = await aggregator.loadData();
        console.log(historyBuffer.toString(), witchboard_feed_pubkey);
        // return historyBuffer.toString();
        return {
            pubkey: historyBuffer,
            isSigner: false,
            isWritable: false,
        };
    }

    getFeedAccountInfos(network: 'devnet' | 'mainnet-beta') {
        return (
            network === 'devnet'
                ? [
                      '9ATrvi6epR5hVYtwNs7BB7VCiYnd4WM7e8MfafWpfiXC', //BTC
                      '7LLvRhMs73FqcLkA8jvEE1AM2mYZXTmqfUv8GAEurymx', //SOL
                      '6fhxFvPocWapZ5Wa2miDnrX2jYRFKvFqYnX11GGkBo2f', //ETH
                      'DR6PqK15tD21MEGSLmDpXwLA7Fw47kwtdZeUMdT7vd7L', //BNB
                      'HPRYVJQ3DcTqszvorS4gCwbJvvNeWMgaCCoF3Lj3sAgC', //ADA
                      '2qcLzR7FatMnfCbiB9BdhGsd6SxDgEqWq7xkD62n3xoT', //BCH
                      'Bux82YCH8DgqFAQTKBxuQHDp3cud5AhD1Kibhjadz22D', //SBR
                      '9gGvxPErkRubNj1vKE19smLa4Kp89kkzMVyA6TMvmKEZ', //ZEC
                      '3WNhN4RJwRui4R3k1S9agGzyMZkCwKQkWjoEHbDeAF8J', //LUNA
                      'CNzjdKHfXqyAeGd2APpzvwLcuPACrFdHb3k6SLsod6Ao', //TRX
                      '6cBTHY4HQ4PABmhUqVLT4n4bNpmZAi2br5VnqTQoVRUo', //SUSHI
                      'GRGMtrTszsoNzjqwTxsvkHVAPq5Snju2UzaAws5KBPed', //DOGE
                      'C9CeLP5B4Lqq7cFppRBUZjt6hrvd99YR3Sk4EPPuAoAC', //LTC
                      'FReW6u9YPpGQNaeEHNkVqA4KGA2WzbcT87NThwFb7fwm', //XLM
                      'GEp5pZFjFPqn1teMmx9sLPyADf9N9aQsRn9TE17PwmmL', //LINK
                      'Fd3UQMqmKCA6SNf6To97PdC2H3EfzYWR5bxr5CBYuFiy', //DOT
                      'EQHf8ueSzJUPELF6yZkyGfwjbLsDmMwFrAYehmC15b6c', //XMR
                      'C5x5W7BHVY61ULtWQ3qkP7kpE6zHViWd4AHpKDuAywPw', //SRM
                      'HnbpTLbdv78hkVCDBZ52o5E6bkqtsZp4tUXBd2E8Sw9x', //PORT
                      'EbpMMgMkC4Jt2oipUBc2GPL4XQo5uxKT8NpF8NEZWvqL', //PAI
                  ]
                : [
                      '8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee', //BTC
                      'E3cqnoFvTeKKNsGmC8YitpMjo2E39hwfoyt2Aiem7dCb', //SOL
                  ]
        ).map<AccountMeta>((address) => ({ pubkey: new PublicKey(address), isSigner: false, isWritable: false }));
    }

    async imprintRarity(mint_token_id: PublicKey) {
        const payerAccount: AccountMeta = {
            pubkey: this.wallet.publicKey as PublicKey,
            isSigner: true,
            isWritable: true,
        };
        const [nft_pubkey, _nft_bump] = PublicKey.findProgramAddressSync(
            [Buffer.from('nft_account'), mint_token_id.toBuffer()],
            PROGRAM_ID
        );
        const gemAccount: AccountMeta = {
            pubkey: nft_pubkey,
            isSigner: false,
            isWritable: true,
        };

        const mintAccount: AccountMeta = {
            pubkey: mint_token_id,
            isSigner: false,
            isWritable: false,
        };
        const associatedTokenAccount: AccountMeta = {
            pubkey: await getAssociatedTokenAddress(mintAccount.pubkey, payerAccount.pubkey),
            isSigner: false,
            isWritable: true,
        };
        const [nftCollectionAutorityPDA, _mintAuthorityAcountBump] = await PublicKey.findProgramAddress(
            [Buffer.from('mint_authority')],
            PROGRAM_ID
        );

        const freezeAuthorityAccount: AccountMeta = {
            pubkey: nftCollectionAutorityPDA,
            isSigner: false,
            isWritable: true,
        };
        const [edition_key, _edition_bump] = PublicKey.findProgramAddressSync(
            [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mint_token_id.toBuffer(), Buffer.from('edition')],
            METAPLEX_PROGRAM_ID
        );
        const nftEditionAccount: AccountMeta = {
            pubkey: edition_key,
            isSigner: false,
            isWritable: false,
        };

        const [metaplexAccountKey, _metaplexAccountBump] = await PublicKey.findProgramAddress(
            [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mint_token_id.toBuffer()],
            METAPLEX_PROGRAM_ID
        );

        const metadataAccount: AccountMeta = {
            pubkey: metaplexAccountKey,
            isSigner: false,
            isWritable: true,
        };
        const splTokenProgramAccount: AccountMeta = {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        };
        const metaplexProgramAccount: AccountMeta = {
            pubkey: METAPLEX_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        };

        const mintNftCollectionInstruction = new TransactionInstruction({
            programId: PROGRAM_ID,
            data: Buffer.from([Instruction.ImprintRarity]),
            keys: [
                payerAccount,
                gemAccount,
                mintAccount,
                associatedTokenAccount,
                freezeAuthorityAccount,
                metadataAccount,
                nftEditionAccount,

                splTokenProgramAccount,
                metaplexProgramAccount,
            ],
        });

        try {
            const transaction = new Transaction();

            const tx = transaction.add(mintNftCollectionInstruction);
            tx.feePayer = this.wallet.publicKey as PublicKey;

            const blockhashObj = await this.connection.getLatestBlockhash();
            tx.recentBlockhash = blockhashObj.blockhash;

            const signedTransaction = this.wallet.signTransaction ? await this.wallet?.signTransaction(tx) : null;
            const txn = signedTransaction?.serialize();

            const transactionId = await sendAndConfirmRawTransaction(this.connection, txn as Buffer);

            console.log(transactionId);
            return transactionId;
        } catch (error) {
            throw new Error('Nft Minting transaction failed with error ' + error);
        }
    }

    async redeemNft(mint_token_id: PublicKey) {
        const payerAccount: AccountMeta = {
            pubkey: this.wallet.publicKey as PublicKey,
            isSigner: true,
            isWritable: true,
        };

        const mintAccount: AccountMeta = {
            pubkey: mint_token_id,
            isSigner: false,
            isWritable: true,
        };
        const [mitingPoolKey, _mitingPoolKeyBump] = await PublicKey.findProgramAddress(
            [Buffer.from('minting_pool')],
            PROGRAM_ID
        );

        const mintingPoolAccount: AccountMeta = {
            pubkey: mitingPoolKey,
            isSigner: false,
            isWritable: true,
        };

        const associatedTokenAccount: AccountMeta = {
            pubkey: await getAssociatedTokenAddress(mint_token_id, payerAccount.pubkey),
            isSigner: false,
            isWritable: true,
        };
        const [mint_authority_key, _mint_authority_bump] = await PublicKey.findProgramAddress(
            [Buffer.from('mint_authority')],
            PROGRAM_ID
        );

        const mintAuthorityAccount: AccountMeta = {
            pubkey: mint_authority_key,
            isSigner: false,
            isWritable: true,
        };

        const [gem_pubkey, _gem_bump] = PublicKey.findProgramAddressSync(
            [Buffer.from('gem_account'), mint_token_id.toBuffer()],
            PROGRAM_ID
        );
        const gemAccount: AccountMeta = {
            pubkey: gem_pubkey,
            isSigner: false,
            isWritable: true,
        };

        const [ingl_nft_collection_mint_key, _ingl_nft_collection_bump] = PublicKey.findProgramAddressSync(
            [Buffer.from('ingl_nft_collection_newer')],
            PROGRAM_ID
        );

        const [metaplexAccountKey, _metaplexAccountBump] = await PublicKey.findProgramAddress(
            [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mint_token_id.toBuffer()],
            METAPLEX_PROGRAM_ID
        );

        const metadataAccount: AccountMeta = {
            pubkey: metaplexAccountKey,
            isSigner: false,
            isWritable: true,
        };

        const [edition_key, _edition_bump] = PublicKey.findProgramAddressSync(
            [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mint_token_id.toBuffer(), Buffer.from('edition')],
            METAPLEX_PROGRAM_ID
        );
        const editionAccount: AccountMeta = {
            pubkey: edition_key,
            isSigner: false,
            isWritable: true,
        };

        const [ingl_nft_collection_key, _ingl_mint_bump] = PublicKey.findProgramAddressSync(
            [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), ingl_nft_collection_mint_key.toBuffer()],
            METAPLEX_PROGRAM_ID
        );
        const inglNftCollectionAccount: AccountMeta = {
            pubkey: ingl_nft_collection_key,
            isSigner: false,
            isWritable: true,
        };

        const splTokenProgramAccount: AccountMeta = {
            pubkey: TOKEN_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        };

        const [program_treasury_id, _program_treasury_bump] = PublicKey.findProgramAddressSync(
            [Buffer.from('ingl_treasury_account_key')],
            PROGRAM_ID
        );
        const programTreasuryAccount: AccountMeta = {
            pubkey: program_treasury_id,
            isSigner: false,
            isWritable: true,
        };

        const systemProgramAccount: AccountMeta = {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
        };
        const metaplexProgramAccount: AccountMeta = {
            pubkey: METAPLEX_PROGRAM_ID,
            isSigner: false,
            isWritable: false,
        };

        const mintNftCollectionInstruction = new TransactionInstruction({
            programId: PROGRAM_ID,
            data: Buffer.from([Instruction.Redeem]),
            keys: [
                payerAccount,
                mintAccount,
                mintingPoolAccount,
                associatedTokenAccount,
                mintAuthorityAccount,
                gemAccount,
                metadataAccount,
                editionAccount,
                inglNftCollectionAccount,
                splTokenProgramAccount,
                programTreasuryAccount,

                systemProgramAccount,
                metaplexProgramAccount,
            ],
        });

        try {
            const transaction = new Transaction();

            const tx = transaction.add(mintNftCollectionInstruction);
            tx.feePayer = this.wallet.publicKey as PublicKey;

            const blockhashObj = await this.connection.getLatestBlockhash();
            tx.recentBlockhash = blockhashObj.blockhash;

            const signedTransaction = this.wallet.signTransaction ? await this.wallet?.signTransaction(tx) : null;
            const txn = signedTransaction?.serialize();

            const transactionId = await sendAndConfirmRawTransaction(this.connection, txn as Buffer);

            console.log(transactionId);
            return transactionId;
        } catch (error) {
            throw new Error('Nft Minting transaction failed with error ' + error);
        }
    }

    async getAccountData() {
        if (this.wallet.publicKey) {
            const response = await this.connection.getParsedTokenAccountsByOwner(this.wallet?.publicKey, {
                programId: TOKEN_PROGRAM_ID,
            });

            response.value.forEach((accountInfo) => {
                console.log(`pubkey: ${accountInfo.pubkey.toBase58()}`);
                console.log(`mint: ${accountInfo.account.data['parsed']['info']['mint']}`);
                console.log(`owner: ${accountInfo.account.data['parsed']['info']['owner']}`);
                console.log(`decimals: ${accountInfo.account.data['parsed']['info']['tokenAmount']['decimals']}`);
                console.log(`amount: ${accountInfo.account.data['parsed']['info']['tokenAmount']['amount']}`);
                console.log('====================');
            });
            return response;
        }
    }
}
