import { Config, PlatformConfig } from 'style-dictionary/types/Config';
import { Dictionary } from 'style-dictionary/types/DesignToken';
import { Config as Config$1 } from 'tailwindcss/types';

type TailwindOptions = Pick<Config$1, 'content' | 'darkMode'> & {
    plugins: Array<'typography' | ['typography', {
        className?: string;
        target?: 'modern' | 'legacy';
    }] | 'forms' | ['forms', {
        strategy?: 'base' | 'class';
    }] | 'aspect-ratio' | 'line-clamp' | 'container-queries'>;
};
type TailwindFormatType = 'js' | 'cjs';
type SdTailwindConfigType = {
    type: 'all' | string;
    formatType?: TailwindFormatType;
    isVariables?: boolean;
    source?: Config['source'];
    preprocessors?: Config['preprocessors'];
    transforms?: PlatformConfig['transforms'];
    buildPath?: PlatformConfig['buildPath'];
    prefix?: PlatformConfig['prefix'];
    tailwind?: Partial<TailwindOptions>;
    extend?: boolean;
};
type TailwindFormatObjType = Pick<SdTailwindConfigType, 'type' | 'isVariables' | 'prefix' | 'tailwind' | 'extend'> & {
    dictionary: Dictionary;
    formatType: TailwindFormatType;
};

declare const getTailwindFormat: ({ dictionary: { allTokens }, type, isVariables, prefix, extend, tailwind }: TailwindFormatObjType) => string;
declare const makeSdTailwindConfig: ({ type, formatType, isVariables, extend, source, transforms, buildPath, prefix, tailwind, preprocessors }: SdTailwindConfigType) => Config;

export { getTailwindFormat, makeSdTailwindConfig };
