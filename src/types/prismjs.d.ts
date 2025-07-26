declare module "prismjs" {
    export const highlight: (
        code: string,
        grammar: any,
        language: string
    ) => string;
    export const languages: {
        [language: string]: any;
    };
}
