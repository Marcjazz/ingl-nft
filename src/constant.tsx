import { PublicKey } from '@solana/web3.js';

export const CONNECTION_URL = 'api.devnet.solana.com';
export const PROGRAM_ID = new PublicKey('G5d6MNoa742nJz8XbJKE7diagi7JAWiZ266f9u9bJGwd');
export enum Instruction {
    MintNft,
    // {
    //     switchboard_state_bump: u8,
    //     permission_bump: u8,
    //     log_level: u8,
    // }
    ImprintRarity,
    //   {
    //     log_level: u8,
    // }
    Init,
    //   {
    //     log_level: u8,
    //     init_commission: u8,
    //     max_primary_stake: u64,
    //     nft_holders_share: u8,
    //     initial_redemption_fee: u8,
    //     is_validator_id_switchable: bool,
    //     unit_backing: u64,
    //     redemption_fee_duration: u32,
    //     program_upgrade_threshold: u8,
    //     creator_royalties: u16,
    //     rarities: Vec<u16>,
    //     rarity_names: Vec<String>,
    //     twitter_handle: String,
    //     discord_invite: String,
    //     validator_name: String,
    //     collection_uri: String,
    //     website: String,
    // }
    Redeem,
    // {
    //     log_level: u8,
    // }
    NFTWithdraw,
    // {
    //     cnt: usize,
    //     log_level: u8,
    // }
    ProcessRewards,
    // {
    //     log_level: u8,
    // }
    InitRebalance,
    // {
    //     log_level: u8,
    // }
    FinalizeRebalance,
    // {
    //     log_level: u8,
    // },
    UploadUris,
    // {
    //     uris: Vec<String>,
    //     rarity: u8,
    //     log_level: u8,
    // },
    ResetUris,
    // {
    //     log_level: u8,
    // },
    UnDelegateNFT,
    // {
    //     log_level: u8,
    // },
    DelegateNFT,
    // {
    //     log_level: u8,
    // },
    CreateVoteAccount,
    // {
    //     log_level: u8,
    // },
    InitGovernance,
    // {
    //     governance_type: GovernanceType,
    //     log_level: u8,
    // },
    VoteGovernance,
    // {
    //     numeration: u32,
    //     vote: bool,
    //     log_level: u8,
    // },
    FinalizeGovernance,
    // {
    //     numeration: u32,
    //     log_level: u8,
    // },
    ExecuteGovernance,
    // {
    //     numeration: u32,
    //     log_level: u8,
    // },
}
