declare global {
    type Env = {
        Token?: string;
        AuthTable?: string;
        HomeMode?: string;
        HomePage?: string;
    };

    type Table = Record<string, string | undefined | null>;

    var AuthTable: Table | undefined;
}

export {};
