interface DiscordUser {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
    flags: number;
    banner: string | null;
    accent_color: number | null;
    global_name: string;
    avatar_decoration_data: string | null;
    banner_color: string | null;
    clan: string | null;
    mfa_enabled: boolean;
    locale: string;
    premium_type: number;
    email: string;
    verified: boolean;
    phone: string;
    nsfw_allowed: boolean | null;
    analytics_token: string;
    linked_users: Array<string>;
    purchased_flags: number;
    bio: string;
    authenticator_types: Array<any>;
}

interface Session {
    at: number;
    credentialId: string;
}

//#region Bot
interface InstallParams {
    scopes: string[];
    permissions: string;
}

interface OAuth2InstallParams {
    scopes: string[];
    permissions: string;
}

interface IntegrationTypesConfig {
    [key: number]: {
        oauth2_install_params: OAuth2InstallParams;
    };
}

interface Owner {
    id: string;
    username: string;
    global_name: string;
    avatar: string;
    avatar_decoration_data: string | null;
    discriminator: string;
    public_flags: number;
    clan: string | null;
    flags: number;
}

interface Bot {
    id: string;
    username: string;
    global_name: string | null;
    avatar: string;
    avatar_decoration_data: string | null;
    discriminator: string;
    public_flags: number;
    clan: string | null;
    bot: boolean;
}

interface DiscordBot {
    id: string;
    name: string;
    icon: string;
    description: string;
    summary: string;
    type: any; // Type is unknown (null)
    is_monetized: boolean;
    hook: boolean;
    storefront_available: boolean;
    bot_public: boolean;
    bot_require_code_grant: boolean;
    install_params: InstallParams;
    integration_types_config: IntegrationTypesConfig;
    verify_key: string;
    owner: Owner;
    flags: number;
    redirect_uris: string[];
    rpc_application_state: number;
    store_application_state: number;
    verification_state: number;
    interactions_endpoint_url: string | null;
    interactions_event_types: any[]; // Type is unknown (empty array)
    interactions_version: number;
    integration_public: boolean;
    integration_require_code_grant: boolean;
    explicit_content_filter: number;
    discoverability_state: number;
    discovery_eligibility_flags: number;
    monetization_state: number;
    role_connections_verification_url: string | null;
    internal_guild_restriction: number;
    bot: Bot;
    approximate_guild_count: number;
}
//#endregion Bot