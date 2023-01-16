import { field, vec } from '@dao-xyz/borsh';
import { Instruction } from './constant';

export class InstructionPayload {
    @field({ type: 'u8' })
    public instruction!: Instruction;

    @field({ type: 'u8' })
    public log_level!: number;

    constructor(properties: { instruction: Instruction; log_level: number }) {
        this.log_level = properties.log_level;
        this.instruction = properties.instruction;
    }
}

export class MintNftPayload {
    @field({ type: 'u8' })
    public instruction!: Instruction;

    @field({ type: 'u8' })
    public switchboard_state_bump!: number;

    @field({ type: 'u8' })
    public permission_bump!: number;

    @field({ type: 'u8' })
    public log_level!: number;

    constructor(properties: {
        instruction: Instruction;
        switchboard_state_bump: number;
        permission_bump: number;
        log_level: number;
    }) {
        this.instruction = properties.instruction;
        this.switchboard_state_bump = properties.switchboard_state_bump;
        this.permission_bump = properties.permission_bump;
        this.log_level = properties.log_level;
    }
}

export class InitPayload {
    @field({ type: 'u8' })
    public instruction!: Instruction;

    @field({ type: 'u8' })
    public log_level!: number;

    @field({ type: 'u8' })
    public init_commission!: number;

    @field({ type: 'u64' })
    public max_primary_stake!: number;

    @field({ type: 'u8' })
    public nft_holders_share!: number;

    @field({ type: 'u8' })
    public initial_redemption_fee!: number;

    @field({ type: 'bool' })
    public is_validator_id_switchable!: boolean;

    @field({ type: 'u64' })
    public unit_backing!: number;

    @field({ type: 'u32' })
    public redemption_fee_duration!: number;

    @field({ type: 'u8' })
    public proposal_quorum!: number;

    @field({ type: 'u16' })
    public creator_royalties!: number;

    @field({ type: vec('u16') })
    public rarities!: number[];

    @field({ type: vec('string') })
    public rarity_names!: string[];

    @field({ type: 'string' })
    public twitter_handle!: string;

    @field({ type: 'string' })
    public discord_invite!: string;

    @field({ type: 'string' })
    public validator_name!: string;

    @field({ type: 'string' })
    public collection_uri!: string;

    @field({ type: 'string' })
    public website!: string;

    constructor(properties: {
        instruction: Instruction;
        log_level: number;
        init_commission: number;
        max_primary_stake: number;
        nft_holders_share: number;
        initial_redemption_fee: number;
        is_validator_id_switchable: boolean;
        unit_backing: number;
        redemption_fee_duration: number;
        proposal_quorum: number;
        creator_royalties: number;
        rarities: number[];
        rarity_names: string[];
        twitter_handle: string;
        discord_invite: string;
        validator_name: string;
        collection_uri: string;
        website: string;
    }) {
        this.instruction = properties.instruction;
        this.log_level = properties.log_level;
        this.init_commission = properties.init_commission;
        this.max_primary_stake = properties.max_primary_stake;
        this.nft_holders_share = properties.nft_holders_share;
        this.initial_redemption_fee = properties.initial_redemption_fee;
        this.is_validator_id_switchable = properties.is_validator_id_switchable;
        this.unit_backing = properties.unit_backing;
        this.redemption_fee_duration = properties.redemption_fee_duration;
        this.proposal_quorum = properties.proposal_quorum;
        this.creator_royalties = properties.creator_royalties;
        this.rarities = properties.rarities;
        this.rarity_names = properties.rarity_names;
        this.twitter_handle = properties.twitter_handle;
        this.discord_invite = properties.discord_invite;
        this.validator_name = properties.validator_name;
        this.collection_uri = properties.collection_uri;
        this.website = properties.website;
    }
}
