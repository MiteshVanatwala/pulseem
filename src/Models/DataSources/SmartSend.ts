// Smart-Send (מסך השליחה החכמה) models.
// Mirrors: C# DAL.Models.DataSources.SmartSendModels (eSendChannel : byte) and the
// §7½ Gate-0 contract resultsets (DataSources-DB-MasterPlan, anchor sp-contract-smartsend).
// PascalCase fields = server JSON keys (PulseemResponse.Data shapes) — no client renaming.

// Mirror of DataSources_FillCampaignGroup @prm_Channel (tinyint). 1=Email is the ONLY
// wired channel in v1; 2/3 are visually present but disabled ("בקרוב").
export enum eSendChannel { EMAIL = 1, SMS = 2, WHATSAPP = 3 }

export interface ChannelDescriptor {
    channel: eSendChannel;
    labelKey: string;
    icon: 'email' | 'sms' | 'whatsapp';
    enabled: boolean;            // v1: only EMAIL === true
    comingSoon: boolean;
    identityFlag: 'HasEmailIdentity' | 'HasCellIdentity';       // which GetMany flag gates a source
    clientIdField: 'EmailClientID' | 'CellClientID';            // which ClientID FillCampaignGroup resolves
    resolvedCountField: 'ResolvedRowsEmail' | 'ResolvedRowsCell';
    duplicateFlag: 'IsEmailDuplicate' | 'IsCellDuplicate';
}

// The single source of truth for channel-dependent behavior. Every channel-aware
// spot reads field NAMES from here — never hardcodes EmailClientID etc. Adding a
// future channel = flipping enabled:false→true on one row (plus server wiring).
export const CHANNELS: ChannelDescriptor[] = [
    { channel: eSendChannel.EMAIL, labelKey: 'DataSources.send.channel.email', icon: 'email',
      enabled: true,  comingSoon: false, identityFlag: 'HasEmailIdentity', clientIdField: 'EmailClientID',
      resolvedCountField: 'ResolvedRowsEmail', duplicateFlag: 'IsEmailDuplicate' },
    { channel: eSendChannel.SMS, labelKey: 'DataSources.send.channel.sms', icon: 'sms',
      enabled: false, comingSoon: true,  identityFlag: 'HasCellIdentity',  clientIdField: 'CellClientID',
      resolvedCountField: 'ResolvedRowsCell', duplicateFlag: 'IsCellDuplicate' },
    { channel: eSendChannel.WHATSAPP, labelKey: 'DataSources.send.channel.whatsapp', icon: 'whatsapp',
      enabled: false, comingSoon: true,  identityFlag: 'HasCellIdentity',  clientIdField: 'CellClientID',
      resolvedCountField: 'ResolvedRowsCell', duplicateFlag: 'IsCellDuplicate' },
];

export const getChannelDescriptor = (channel: eSendChannel): ChannelDescriptor =>
    CHANNELS.find(c => c.channel === channel) ?? CHANNELS[0];

// ── GetMapping (§10 + Gate-0 clone-detection fields) ─────────────────────────

export interface SmartSendTokenInfo {
    Token: string;               // exact, case-sensitive, without ##
    IsSystemField: boolean;      // ∈ the sender's closed set (30 + Verify)
    IsGraphToken: boolean;       // appears inside a pulseemmonitorgraph URL
    MappedColumnID: number | null;
}

export interface SmartSendColumn {
    ColumnID: number;
    Ordinal: number;
    SourceHeader: string;
    DisplayName: string;
    ColumnKey: string;
    DataType: number;            // 1=Text,2=Number,3=Date,4=Email,5=Phone
    FormatHint: number;          // 0=None,1=Currency,2=Percent
    SemanticRole: number;        // 0=None,1=RecipientEmail,2=RecipientCellphone
    IsSearchable: boolean;
}

export interface SmartSendDataSourceInfo {
    DataSourceID: number;
    Name: string;
    LockedVersionID: number;
    ActiveVersionID: number | null;
}

export interface GetMappingResult {
    CampaignID: number;
    IsMapped: boolean;
    IsStale: boolean;
    Mismatch: boolean;
    DataSource: SmartSendDataSourceInfo | null;
    SupervisorColumnID: number | null;
    GapColumnID: number | null;
    SortColumnID: number | null;
    SyntheticGroupID: number | null;
    ForeignSyntheticGroupID: number | null;    // clone detection (PO decision #6)
    ForeignSyntheticGroupName: string | null;
    Tokens: SmartSendTokenInfo[];
    Columns: SmartSendColumn[];
}

// ── GetTokensBulk (campaign-picker field counts) ─────────────────────────────
// POST api/DataSourcesSender/GetTokensBulk → Data: BulkTokensResult.
// Mirrors DAL.Models.DataSources.{CampaignTokensItem,BulkTokensResult}. Reuses
// SmartSendTokenInfo so the number on a picker card is the SAME number the mapping screen
// shows — both come from the server's single ExtractTokens. MappedColumnID is always null
// here (this call carries no mapping context).
// A requested CampaignID may be ABSENT from Items when the caller does not own it; the slice
// marks those ids failed rather than rendering a misleading 0.

export interface CampaignTokensItem {
    CampaignID: number;
    Tokens: SmartSendTokenInfo[];
}

export interface BulkTokensResult {
    Items: CampaignTokensItem[];
}

// ── SetMapping ───────────────────────────────────────────────────────────────

export interface TokenMapEntry {
    Token: string;
    DataSourceColumnID: number;
    GroupNo: number;
    GroupTitle: string | null;
    DisplayOrder: number;
}

// Wire note: the token-map array is named "Mappings" — the §10 endpoint JSON is
// the binding wire spec (the §12.3 sketch's "TokenMap" name was superseded;
// documented M4 decision). Channel travels in every request from day one (§3.3).
export interface SaveMappingRequest {
    CampaignID: number;
    Channel: eSendChannel;       // v1 always sends 1
    DataSourceID: number;
    DataSourceVersionID: number | null;   // null = lock the active version
    SupervisorColumnID: number | null;
    GapColumnID: number | null;
    SortColumnID: number | null;
    Mappings: TokenMapEntry[];
}

// ── FillAndSummarize (§7½ exact aliases) ─────────────────────────────────────

export interface FillSummary {
    TotalRows: number;
    FinalClients: number;
    SkippedNoIdentity: number;
    SkippedDuplicates: number;
    SkippedRemovedOrMissing: number;
}

// ── Smart-Send management list (Session-B frozen contract) ───────────────────
// One row of the DataSources "Smart Send" management tab. PascalCase = server JSON
// keys (DataSources_GetSmartSendList resultset, mirrored 1:1 by the C# SmartSendListItem
// in DataSourceModels.cs). IsOutdated drives the amber "newer version available" chip;
// Latest* are null when the mapped version already IS the latest. CampaignStatus is an
// eCampaignStatus value (Models/Enums/Campaign) — the tab's status chip maps it exactly
// as CampaignPicker's STATUS_KEY does.
export interface SmartSendListItem {
    CampaignID: number;
    Channel: eSendChannel;              // tinyint server-side; v1 always 1 (EMAIL)
    DataSourceID: number;
    DataSourceName: string;
    CampaignName: string;
    CampaignStatus: number;             // eCampaignStatus
    MappedVersionID: number;
    MappedVersionNumber: number;
    LatestVersionNumber: number | null;
    LatestVersionID: number | null;
    IsOutdated: boolean;
    SyntheticGroupID: number | null;
    LastUpdated: string | null;
}

// Data payload of GET DataSourcesSender/GetList (PulseemResponse.Data).
export interface SmartSendListResult {
    items: SmartSendListItem[];
    total: number;
    page: number;
    pageSize: number;
}
